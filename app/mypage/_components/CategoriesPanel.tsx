// app/mypage/_components/CategoriesPanel.tsx

"use client";

import Modal from "@/app/components/Modal";
import { clearAuth } from "@/app/lib/authStorage";
import {
    CategoryNode,
    RootCategory,
    createCategory,
    deleteCategory,
    fetchMyCategoryTree,
    normalizeTree,
    updateCategory,
} from "@/app/lib/categoryApi.me";
import { AuthError } from "@/app/lib/requestAuth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_CATEGORY_NAME = "미분류";

type Mode = "create" | "edit" | "move" | "delete";

export default function CategoriesPanel() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [roots, setRoots] = useState<RootCategory[]>([]);
    const [nodesByRoot, setNodesByRoot] = useState<Record<number, CategoryNode[]>>({});

    const [selectedRootId, setSelectedRootId] = useState<number | null>(null);

    // 선택된 “카테고리(루트 or 자식)” (이동/수정/삭제 대상)
    const [selected, setSelected] = useState<CategoryNode | null>(null);

    const [mode, setMode] = useState<Mode | null>(null);

    const selectedRoot = useMemo(
        () => roots.find((r) => r.id === selectedRootId) ?? null,
        [roots, selectedRootId]
    );

    const childrenOfSelectedRoot = useMemo(() => {
        if (!selectedRootId) return [];
        const list = nodesByRoot[selectedRootId] ?? [];
        // root 노드는 제외하고 children만 노출(UX 요청)
        return list.filter((n) => !n.isRoot);
    }, [nodesByRoot, selectedRootId]);

    const canMutate = useMemo(() => {
        if (!selected) return false;
        // 미분류는 수정/삭제/이동 전부 금지
        if (selected.isRoot && selected.name === DEFAULT_CATEGORY_NAME) return false;
        return true;
    }, [selected]);

    const canCreateChildHere = useMemo(() => {
        // 루트 선택된 상태에서만 "자식 생성"이 의미 있음 (우측에 보여줄 자식들이니까)
        if (!selectedRoot) return false;
        if (selectedRoot.name === DEFAULT_CATEGORY_NAME) return false; // 미분류는 자식 금지
        return true;
    }, [selectedRoot]);

    const handleAuthFail = () => {
        clearAuth();
        router.replace("/login");
    };

    const reload = async () => {
        setErr(null);

        const tree = await fetchMyCategoryTree();
        const normalized = normalizeTree(tree);

        setRoots(normalized.roots);
        setNodesByRoot(normalized.nodesByRoot);

        // 1) 보여줄 루트 결정
        const nextRootId =
            selectedRootId && normalized.nodesByRoot[selectedRootId]
                ? selectedRootId
                : normalized.roots[0]?.id ?? null;

        setSelectedRootId(nextRootId);

        // 2) 선택된 카테고리 유지(가능하면)
        if (selected) {
            const pool = normalized.nodesByRoot[selected.rootId] ?? [];
            const still = pool.find((n) => n.id === selected.id) ?? null;

            if (still) {
                setSelected(still);
                return;
            }
        }

        // 3) 유지 못하면: 해당 루트 노드를 기본 선택
        if (nextRootId) {
            const rootNode =
                (normalized.nodesByRoot[nextRootId] ?? []).find((n) => n.isRoot) ?? null;

            setSelected(rootNode);
        } else {
            setSelected(null);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await reload();
            } catch (e: unknown) {
                if (e instanceof AuthError) return handleAuthFail();
                setErr(e instanceof Error ? e.message : "카테고리를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSelectRoot = (rootId: number) => {
        setSelectedRootId(rootId);

        // ✅ 루트도 선택 대상으로 설정 (수정/삭제/이동 가능)
        const rootNode =
            (nodesByRoot[rootId] ?? []).find((n) => n.isRoot) ?? null;

        setSelected(rootNode);
    };

    const onSelectChild = (child: CategoryNode) => {
        setSelected(child);
    };

    // -------- actions --------

    const openCreate = () => setMode("create");
    const openEdit = () => canMutate && setMode("edit");
    const openMove = () => canMutate && setMode("move");
    const openDelete = () => canMutate && setMode("delete");

    const closeModal = () => setMode(null);

    // ---------- render ----------

    if (loading) {
        return (
            <div className="rounded-xl border border-neutral-200 p-8 text-sm">
                Loading...
            </div>
        );
    }

    if (err) {
        return (
            <div className="rounded-xl border border-neutral-200 p-8 text-sm text-neutral-600">
                {err}
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-neutral-200 p-8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h2 className="text-base font-semibold">카테고리</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            루트를 선택하면 오른쪽에서 자식 카테고리를 관리합니다.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
                        >
                            생성
                        </button>

                        <button
                            type="button"
                            onClick={openMove}
                            disabled={!selected || !canMutate}
                            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-40"
                            title={!selected ? "카테고리를 선택해 주세요." : undefined}
                        >
                            이동
                        </button>

                        <button
                            type="button"
                            onClick={openEdit}
                            disabled={!selected || !canMutate}
                            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-40"
                        >
                            수정
                        </button>

                        <button
                            type="button"
                            onClick={openDelete}
                            disabled={!selected || !canMutate}
                            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-40"
                        >
                            삭제
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* 좌: 루트 목록 */}
                    <aside className="space-y-2">
                        <div className="text-xs tracking-widest text-neutral-500">ROOTS</div>

                        <div className="rounded-xl border border-neutral-200 overflow-hidden">
                            {roots.map((r) => {
                                const active = r.id === selectedRootId;
                                const locked = r.name === DEFAULT_CATEGORY_NAME;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => onSelectRoot(r.id)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 ${active ? "bg-neutral-50 font-medium" : ""
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span>{r.name}</span>
                                            {locked && (
                                                <span className="text-[11px] text-neutral-500">LOCK</span>
                                            )}
                                        </div>
                                        {r.description ? (
                                            <div className="mt-1 text-xs text-neutral-600 line-clamp-2">
                                                {r.description}
                                            </div>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* 우: 선택된 루트의 자식 목록 */}
                    <section className="space-y-3">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <div className="text-xs tracking-widest text-neutral-500">
                                    CHILDREN
                                </div>
                                <div className="mt-2 text-sm">
                                    {selectedRoot ? (
                                        <>
                                            <span className="font-medium">{selectedRoot.name}</span>
                                            <span className="text-neutral-500"> 의 자식</span>
                                        </>
                                    ) : (
                                        <span className="text-neutral-500">루트를 선택해 주세요.</span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openCreate}
                                disabled={!canCreateChildHere}
                                className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline disabled:opacity-40"
                                title={
                                    !selectedRoot
                                        ? "루트를 먼저 선택해 주세요."
                                        : selectedRoot.name === DEFAULT_CATEGORY_NAME
                                            ? "미분류는 자식 카테고리를 가질 수 없습니다."
                                            : undefined
                                }
                            >
                                + 자식 생성
                            </button>
                        </div>

                        <div className="rounded-xl border border-neutral-200 overflow-hidden">
                            {childrenOfSelectedRoot.length === 0 ? (
                                <div className="p-6 text-sm text-neutral-600">
                                    자식 카테고리가 없습니다.
                                </div>
                            ) : (
                                childrenOfSelectedRoot.map((c) => {
                                    const active = selected?.id === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => onSelectChild(c)}
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 ${active ? "bg-neutral-50 font-medium" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span>{c.name}</span>
                                                {active && (
                                                    <span className="text-[11px] text-neutral-500">
                                                        SELECTED
                                                    </span>
                                                )}
                                            </div>
                                            {c.description ? (
                                                <div className="mt-1 text-xs text-neutral-600 line-clamp-2">
                                                    {c.description}
                                                </div>
                                            ) : null}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {selected ? (
                            <div className="text-xs text-neutral-500">
                                선택됨:{" "}
                                <span className="text-neutral-800">
                                    {selected.isRoot ? `[ROOT] ${selected.name}` : selected.name}
                                </span>
                            </div>
                        ) : (
                            <div className="text-xs text-neutral-500">
                                카테고리를 선택하면 이동/수정/삭제가 활성화됩니다.
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* ---------- Modals ---------- */}
            <Modal
                open={mode === "create"}
                title="카테고리 생성"
                onClose={closeModal}
            >
                <CategoryForm
                    roots={roots}
                    defaultRootId={selectedRootId}
                    defaultParentId={
                        // 기본은 “현재 선택 루트 아래에 자식 생성”
                        selectedRootId && canCreateChildHere ? selectedRootId : null
                    }
                    lockDefaultCategoryName={DEFAULT_CATEGORY_NAME}
                    onSubmit={async ({ name, description, parentId }) => {
                        try {
                            await createCategory({ name, description, parentId });
                            await reload();
                            closeModal();
                        } catch (e: unknown) {
                            if (e instanceof AuthError) return handleAuthFail();
                            throw e;
                        }
                    }}
                />
            </Modal>

            <Modal
                open={mode === "edit"}
                title="카테고리 수정"
                onClose={closeModal}
            >
                <CategoryEditForm
                    selected={selected}
                    lockDefaultCategoryName={DEFAULT_CATEGORY_NAME}
                    onSubmit={async ({ name, description }) => {
                        if (!selected) return;
                        try {
                            await updateCategory(selected.id, {
                                name,
                                description,
                                parentId: selected.parentId, // 수정은 이름/설명만
                            });
                            await reload();
                            closeModal();
                        } catch (e: unknown) {
                            if (e instanceof AuthError) return handleAuthFail();
                            throw e;
                        }
                    }}
                />
            </Modal>

            <Modal
                open={mode === "move"}
                title="카테고리 이동"
                onClose={closeModal}
            >
                <CategoryMoveForm
                    roots={roots}
                    selected={selected}
                    lockDefaultCategoryName={DEFAULT_CATEGORY_NAME}
                    onSubmit={async (parentId) => {
                        if (!selected) return;
                        try {
                            await updateCategory(selected.id, {
                                name: selected.name,
                                description: selected.description,
                                parentId,
                            });
                            await reload();
                            closeModal();
                        } catch (e: unknown) {
                            if (e instanceof AuthError) return handleAuthFail();
                            throw e;
                        }
                    }}
                />
            </Modal>

            <Modal
                open={mode === "delete"}
                title="카테고리 삭제"
                onClose={closeModal}
            >
                <DeleteConfirm
                    selected={selected}
                    lockDefaultCategoryName={DEFAULT_CATEGORY_NAME}
                    onConfirm={async () => {
                        if (!selected) return;
                        try {
                            await deleteCategory(selected.id);
                            setSelected(null);
                            await reload();
                            closeModal();
                        } catch (e: unknown) {
                            if (e instanceof AuthError) return handleAuthFail();
                            throw e;
                        }
                    }}
                />
            </Modal>
        </>
    );
}

/* ----------------- Forms ----------------- */

function CategoryForm({
    roots,
    defaultRootId,
    defaultParentId,
    lockDefaultCategoryName,
    onSubmit,
}: {
    roots: RootCategory[];
    defaultRootId: number | null;
    defaultParentId: number | null;
    lockDefaultCategoryName: string;
    onSubmit: (v: { name: string; description: string; parentId: number | null }) => Promise<void>;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // parentId: null => root 생성
    // parentId: rootId => 해당 root 아래 자식 생성
    const [parentId, setParentId] = useState<number | null>(defaultParentId);

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // 미분류는 부모로 선택 불가(자식 생성 금지)
    const parentOptions = roots.filter((r) => r.name !== lockDefaultCategoryName);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                const n = name.trim();
                if (!n) {
                    setErr("카테고리 이름을 입력해 주세요.");
                    return;
                }

                setSaving(true);
                try {
                    await onSubmit({
                        name: n,
                        description: description.trim(),
                        parentId,
                    });
                } catch (e: unknown) {
                    if (e instanceof Error) setErr(e.message);
                    else setErr("오류가 발생했습니다.");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <div>
                <div className="text-xs text-neutral-600 mb-2">이름</div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                    placeholder="카테고리 이름"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">설명</div>
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                    placeholder="설명(선택)"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">부모(선택)</div>
                <select
                    value={parentId === null ? "root" : String(parentId)}
                    onChange={(e) => {
                        const v = e.target.value;
                        setParentId(v === "root" ? null : Number(v));
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 bg-white"
                >
                    <option value="root">루트 카테고리로 생성</option>
                    {parentOptions.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                            {r.name} 아래에 자식으로 생성
                        </option>
                    ))}
                </select>

                {/* 현재 선택된 root 아래 자식 생성 UX 힌트 */}
                {defaultRootId && (
                    <p className="mt-2 text-xs text-neutral-500">
                        기본값은 선택된 루트 아래 자식 생성입니다.
                    </p>
                )}
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
                {saving ? "Saving..." : "생성"}
            </button>
        </form>
    );
}

function CategoryEditForm({
    selected,
    lockDefaultCategoryName,
    onSubmit,
}: {
    selected: CategoryNode | null;
    lockDefaultCategoryName: string;
    onSubmit: (v: { name: string; description: string }) => Promise<void>;
}) {
    const locked =
        !selected ||
        (selected.isRoot && selected.name === lockDefaultCategoryName);

    const [name, setName] = useState(selected?.name ?? "");
    const [description, setDescription] = useState(selected?.description ?? "");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(selected?.name ?? "");
        setDescription(selected?.description ?? "");
    }, [selected]);

    if (!selected) {
        return <p className="text-sm text-neutral-600">카테고리를 선택해 주세요.</p>;
    }

    if (locked) {
        return (
            <p className="text-sm text-neutral-600">
                미분류 카테고리는 수정할 수 없습니다.
            </p>
        );
    }

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                const n = name.trim();
                if (!n) {
                    setErr("카테고리 이름을 입력해 주세요.");
                    return;
                }

                setSaving(true);
                try {
                    await onSubmit({ name: n, description: description.trim() });
                } catch (e: unknown) {
                    if (e instanceof Error) setErr(e.message);
                    else setErr("오류가 발생했습니다.");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <div>
                <div className="text-xs text-neutral-600 mb-2">이름</div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">설명</div>
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
                {saving ? "Saving..." : "저장"}
            </button>
        </form>
    );
}

function CategoryMoveForm({
    roots,
    selected,
    lockDefaultCategoryName,
    onSubmit,
}: {
    roots: RootCategory[];
    selected: CategoryNode | null;
    lockDefaultCategoryName: string;
    onSubmit: (parentId: number | null) => Promise<void>;
}) {
    if (!selected) {
        return <p className="text-sm text-neutral-600">카테고리를 선택해 주세요.</p>;
    }

    const locked = selected.isRoot && selected.name === lockDefaultCategoryName;
    if (locked) {
        return (
            <p className="text-sm text-neutral-600">
                미분류 카테고리는 이동할 수 없습니다.
            </p>
        );
    }

    // 부모 선택 목록: (루트로 이동 null) + 루트들(미분류 제외)
    // + 자기 자신을 부모로 선택 금지
    const parentOptions = roots
        .filter((r) => r.name !== lockDefaultCategoryName)
        .filter((r) => r.id !== selected.id);

    const [parentId, setParentId] = useState<number | null>(selected.parentId);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                setSaving(true);
                try {
                    await onSubmit(parentId);
                } catch (e: unknown) {
                    if (e instanceof Error) setErr(e.message);
                    else setErr("오류가 발생했습니다.");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <p className="text-sm text-neutral-700">
                <span className="font-medium">{selected.name}</span> 의 위치를 변경합니다.
            </p>

            <div>
                <div className="text-xs text-neutral-600 mb-2">부모 선택</div>
                <select
                    value={parentId === null ? "root" : String(parentId)}
                    onChange={(e) => {
                        const v = e.target.value;
                        setParentId(v === "root" ? null : Number(v));
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 bg-white"
                >
                    <option value="root">루트로 이동</option>
                    {parentOptions.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                            {r.name} 아래로 이동
                        </option>
                    ))}
                </select>
                <p className="mt-2 text-xs text-neutral-500">
                    미분류는 부모로 선택할 수 없습니다.
                </p>
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
                {saving ? "Moving..." : "이동"}
            </button>
        </form>
    );
}

function DeleteConfirm({
    selected,
    lockDefaultCategoryName,
    onConfirm,
}: {
    selected: CategoryNode | null;
    lockDefaultCategoryName: string;
    onConfirm: () => Promise<void>;
}) {
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    if (!selected) {
        return <p className="text-sm text-neutral-600">카테고리를 선택해 주세요.</p>;
    }

    const locked = selected.isRoot && selected.name === lockDefaultCategoryName;
    if (locked) {
        return (
            <p className="text-sm text-neutral-600">
                미분류 카테고리는 삭제할 수 없습니다.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-700">
                정말로 <span className="font-medium">{selected.name}</span> 을(를) 삭제할까요?
            </p>
            <p className="text-xs text-neutral-500">
                삭제 후 복구할 수 없습니다.
            </p>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="button"
                disabled={saving}
                onClick={async () => {
                    setErr(null);
                    setSaving(true);
                    try {
                        await onConfirm();
                    } catch (e: unknown) {
                        if (e instanceof Error) setErr(e.message);
                        else setErr("오류가 발생했습니다.");
                    } finally {
                        setSaving(false);
                    }
                }}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
                {saving ? "Deleting..." : "삭제"}
            </button>
        </div>
    );
}