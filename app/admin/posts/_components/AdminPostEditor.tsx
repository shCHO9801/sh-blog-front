// app/admin/posts/_components/AdminPostEditor.tsx
"use client";

import Markdown from "@/app/components/Markdown";
import { clearAuth, getAccessToken, isTokenExpired } from "@/app/lib/authStorage";
import { fetchMyCategoryTree, normalizeTree } from "@/app/lib/categoryAdminApi";
import {
    createPost,
    fetchMyPostDetail,
    patchPostCategory,
    patchPostContent,
    patchPostPublic,
    patchPostTitle,
    uploadPostImage,
} from "@/app/lib/postAdminApi";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Props =
    | { mode: "create"; postId?: never; initialCategoryId?: number }
    | { mode: "edit"; postId: number; initialCategoryId?: never };

type LeafOption = { id: number; label: string };

export default function AdminPostEditor(props: Props) {
    const router = useRouter();
    const taRef = useRef<HTMLTextAreaElement | null>(null);

    const [loading, setLoading] = useState(props.mode === "edit");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [categoryOptions, setCategoryOptions] = useState<LeafOption[]>([]);
    const [uploading, setUploading] = useState(false);

    // ✅ auth gate (MyPage와 동일 패턴)
    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            clearAuth();
            router.replace("/login");
        }
    }, [router]);

    // ✅ categories load (leaf only)
    useEffect(() => {
        (async () => {
            try {
                const tree = await fetchMyCategoryTree();
                const { roots, nodesByRoot } = normalizeTree(tree);

                const opts: LeafOption[] = [];
                for (const r of roots) {
                    const nodes = nodesByRoot[r.id] ?? [];
                    const children = nodes.filter((n) => !n.isRoot);

                    if (children.length === 0) {
                        opts.push({ id: r.id, label: r.name });
                    } else {
                        for (const ch of children) {
                            opts.push({ id: ch.id, label: `${r.name} / ${ch.name}` });
                        }
                    }
                }

                setCategoryOptions(opts);

                if (props.mode === "create" && categoryId === null) {
                    const requestedId = props.initialCategoryId;
                    const matched = requestedId
                        ? opts.find((opt) => opt.id === requestedId)
                        : undefined;

                    setCategoryId(matched ? matched.id : (opts[0]?.id ?? null));
                }
            } catch (e) {
                setErr(e instanceof Error ? e.message : "카테고리 불러오기에 실패했습니다.");
            }
        })();
    }, [categoryId, props.initialCategoryId, props.mode]);

    // ✅ edit mode: load post
    useEffect(() => {
        if (props.mode !== "edit") return;

        (async () => {
            setErr(null);
            setLoading(true);
            try {
                const p = await fetchMyPostDetail(props.postId);
                setTitle(p.title ?? "");
                setContent(p.content ?? "");
                setIsPublic(!!p.isPublic);
                setCategoryId(p.categoryId ?? null);
            } catch (e) {
                setErr(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [props]);

    const preview = useMemo(() => content ?? "", [content]);

    const insertAtCursor = (text: string) => {
        const el = taRef.current;
        if (!el) {
            setContent((prev) => (prev ? `${prev}\n${text}` : text));
            return;
        }
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;

        setContent((prev) => {
            const next = prev.slice(0, start) + text + prev.slice(end);
            return next;
        });

        // selection restore
        requestAnimationFrame(() => {
            el.focus();
            const pos = start + text.length;
            el.setSelectionRange(pos, pos);
        });
    };

    const onUploadImage = async (file: File) => {
        setErr(null);
        setUploading(true);
        try {
            const res = await uploadPostImage(file);
            const md = `\n![](${res.url})\n`;
            insertAtCursor(md);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const moveCaretToDropPosition = (
        e: React.DragEvent<HTMLTextAreaElement>
    ) => {
        const el = taRef.current;
        if (!el) return;

        el.focus();

        const native = e.nativeEvent;
        const anyDoc = document as Document & {
            caretPositionFromPoint?: (
                x: number,
                y: number
            ) => { offsetNode: Node; offset: number };
            caretRangeFromPoint?: (x: number, y: number) => Range | null;
        };

        if (typeof anyDoc.caretPositionFromPoint === "function") {
            const pos = anyDoc.caretPositionFromPoint(native.clientX, native.clientY);
            if (!pos) return;

            const textNode = el.firstChild;
            if (!textNode || pos.offsetNode !== textNode) return;

            const offset = Math.max(0, Math.min(pos.offset, el.value.length));
            el.setSelectionRange(offset, offset);
            return;
        }

        if (typeof anyDoc.caretRangeFromPoint === "function") {
            const range = anyDoc.caretRangeFromPoint(native.clientX, native.clientY);
            if (!range) return;

            const textNode = el.firstChild;
            if (!textNode || range.startContainer !== textNode) return;

            const offset = Math.max(0, Math.min(range.startOffset, el.value.length));
            el.setSelectionRange(offset, offset);
        }
    };

    const onDropUpload = async (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        moveCaretToDropPosition(e);
        await onUploadImage(file);
    };

    const onPasteUpload = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items || items.length === 0) return;

        const imageItem = Array.from(items).find((item) =>
            item.type.startsWith("image/")
        );

        if (!imageItem) return;

        const file = imageItem.getAsFile();
        if (!file) return;

        e.preventDefault();
        await onUploadImage(file);
    };

    const onSubmitCreate = async () => {
        if (categoryId === null) return;
        setErr(null);
        setSaving(true);
        try {
            const created = await createPost({
                title,
                content,
                categoryId,
                isPublic,
            });

            router.replace(`/admin/posts/${created.postId}/edit`);
            router.refresh();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "생성에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const onSaveEdit = async () => {
        if (props.mode !== "edit") return;
        if (categoryId === null) return;

        setErr(null);
        setSaving(true);
        try {
            // ✅ 서버가 필드별 PATCH이므로, 일단 모두 PATCH (불필요 최적화는 생략)
            await patchPostTitle(props.postId, title);
            await patchPostContent(props.postId, content);
            await patchPostCategory(props.postId, categoryId);
            await patchPostPublic(props.postId, isPublic);

            router.refresh();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
                로딩 중...
            </div>
        );
    }

    return (
        <section className="space-y-4">
            {err && (
                <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-red-600">
                    {err}
                </p>
            )}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px_140px_160px]">
                    <div>
                        <label className="text-xs text-neutral-600">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-300"
                            placeholder="제목을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-neutral-600">Category</label>
                        <select
                            value={categoryId ?? ""}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-300"
                        >
                            {categoryOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-600">Public</label>
                        <button
                            type="button"
                            onClick={() => setIsPublic((v) => !v)}
                            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm hover:border-black"
                        >
                            {isPublic ? "PUBLIC" : "PRIVATE"}
                        </button>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-600">Actions</label>
                        {props.mode === "create" ? (
                            <button
                                type="button"
                                onClick={onSubmitCreate}
                                disabled={saving}
                                className="mt-2 w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
                            >
                                {saving ? "생성 중..." : "Create"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onSaveEdit}
                                disabled={saving}
                                className="mt-2 w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
                            >
                                {saving ? "저장 중..." : "Save"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-neutral-500">
                        이미지 업로드 시 마크다운으로 삽입됩니다.
                    </div>

                    <label className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 text-xs hover:border-black">
                        {uploading ? "업로드 중..." : "이미지 업로드"}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                onUploadImage(f);
                                e.currentTarget.value = "";
                            }}
                        />
                    </label>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <div className="text-xs text-neutral-600">Write</div>
                    <textarea
                        ref={taRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDropUpload}
                        onPaste={onPasteUpload}
                        className="mt-3 h-[520px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-neutral-300"
                        placeholder="마크다운으로 작성하세요..."
                    />
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <div className="text-xs text-neutral-600">Preview</div>
                    <div className="mt-3 h-[520px] overflow-auto rounded-xl border border-neutral-200 bg-white p-4">
                        <Markdown content={preview} />
                    </div>
                </div>
            </div>
        </section>
    );
}