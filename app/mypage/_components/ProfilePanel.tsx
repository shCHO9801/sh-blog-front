"use client";

import Modal from "@/app/components/Modal";
import { clearAuth } from "@/app/lib/authStorage";
import { resizeProfileImage } from "@/app/lib/imageResize";
import { AuthError, requestAuth } from "@/app/lib/requestAuth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type MeResponse = {
    username: string;
    nickname: string;
    email: string;
    profileImageUrl: string | null;
};

type ModalState =
    | null
    | { type: "username" }
    | { type: "password" }
    | { type: "nickname" }
    | { type: "email" }
    | { type: "profileImage" };

function api(path: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    return base ? `${base}${path}` : path;
}

export default function ProfilePanel() {
    const router = useRouter();

    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>(null);

    const modalTitle = useMemo(() => {
        if (!modal) return "";
        switch (modal.type) {
            case "username":
                return "아이디 변경";
            case "password":
                return "비밀번호 변경";
            case "nickname":
                return "닉네임 변경";
            case "email":
                return "이메일 변경";
            case "profileImage":
                return "프로필 이미지";
        }
    }, [modal]);

    const handleAuthFail = () => {
        clearAuth();
        router.replace("/login");
    };

    const refreshMe = async () => {
        const data = await requestAuth<MeResponse>(api("/api/users/me"));
        setMe(data);
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await requestAuth<MeResponse>(api("/api/users/me"));
                setMe(data);
            } catch (e: unknown) {
                if (e instanceof AuthError) {
                    handleAuthFail();
                    return;
                }
                if (e instanceof Error) {
                    setPageError(e.message);
                } else {
                    setPageError("데이터를 불러오지 못했습니다.");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ---------------- API ----------------

    const patchUsername = async (username: string) => {
        await requestAuth<MeResponse>(api("/api/users/me/username"), {
            method: "PATCH",
            body: JSON.stringify({ username }),
        });

        // username 변경 시 토큰 무효화 가능성 → 재로그인 유도
        clearAuth();
        router.replace("/login");
    };

    const patchNickname = async (nickname: string) => {
        const data = await requestAuth<MeResponse>(api("/api/users/me/nickname"), {
            method: "PATCH",
            body: JSON.stringify({ nickname }),
        });
        setMe(data);
    };

    const patchEmail = async (email: string) => {
        const data = await requestAuth<MeResponse>(api("/api/users/me/email"), {
            method: "PATCH",
            body: JSON.stringify({ email }),
        });
        setMe(data);
    };

    const patchPassword = async (oldPassword: string, rawPassword: string) => {
        const data = await requestAuth<MeResponse>(api("/api/users/me/password"), {
            method: "PATCH",
            body: JSON.stringify({ oldPassword, rawPassword }),
        });
        setMe(data);
    };

    const putProfileImage = async (file: File) => {
        const processed = await resizeProfileImage(file);
        const form = new FormData();
        form.append("file", processed);

        const data = await requestAuth<MeResponse>(
            api("/api/users/me/profile-image"),
            {
                method: "PUT",
                body: form,
            }
        );
        setMe(data);
    };

    const deleteProfileImage = async () => {
        await requestAuth<null>(api("/api/users/me/profile-image"), {
            method: "DELETE",
        });
        await refreshMe();
    };

    // ---------------- UI ----------------

    if (loading) {
        return (
            <div className="rounded-xl border border-neutral-200 p-8 text-sm">
                Loading...
            </div>
        );
    }

    if (!me) {
        return (
            <div className="rounded-xl border border-neutral-200 p-8 text-sm text-neutral-600">
                {pageError ?? "No data"}
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-neutral-200 p-8 space-y-8">
                {/* 프로필 */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border border-neutral-200 overflow-hidden bg-neutral-100">
                            {me.profileImageUrl && (
                                <img
                                    src={me.profileImageUrl}
                                    alt="profile"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        <div>
                            <div className="text-sm font-medium">{me.nickname}</div>
                            <div className="mt-1 text-xs text-neutral-600">
                                {me.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setModal({ type: "profileImage" })}
                            className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
                        >
                            이미지 변경
                        </button>
                        {me.profileImageUrl && (
                            <button
                                onClick={deleteProfileImage}
                                className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </div>

                <FieldRow
                    label="Username"
                    value={me.username}
                    onEdit={() => setModal({ type: "username" })}
                />

                <FieldRow
                    label="Password"
                    value="********"
                    onEdit={() => setModal({ type: "password" })}
                />

                <FieldRow
                    label="Nickname"
                    value={me.nickname}
                    onEdit={() => setModal({ type: "nickname" })}
                />

                <FieldRow
                    label="Email"
                    value={me.email}
                    onEdit={() => setModal({ type: "email" })}
                />
            </div>

            <Modal open={!!modal} title={modalTitle} onClose={() => setModal(null)}>
                {modal?.type === "password" && (
                    <PasswordForm
                        onSubmit={async (oldPw, newPw) => {
                            try {
                                await patchPassword(oldPw, newPw);
                                setModal(null);
                            } catch (e: unknown) {
                                if (e instanceof AuthError) {
                                    handleAuthFail();
                                    return;
                                }
                                if (e instanceof Error) {
                                    throw e;
                                }
                            }
                        }}
                    />
                )}

                {modal?.type === "profileImage" && (
                    <ProfileImageForm
                        onSubmit={async (file) => {
                            try {
                                await putProfileImage(file);
                                setModal(null);
                            } catch (e: unknown) {
                                if (e instanceof AuthError) {
                                    handleAuthFail();
                                    return;
                                }
                                if (e instanceof Error) {
                                    throw e;
                                }
                            }
                        }}
                    />
                )}
            </Modal>
        </>
    );
}

/* ---------------- Sub Components ---------------- */

function FieldRow({
    label,
    value,
    onEdit,
}: {
    label: string;
    value: string;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div>
                <div className="text-xs tracking-widest text-neutral-500">{label}</div>
                <div className="mt-2 text-sm text-neutral-900">{value}</div>
            </div>

            <button
                onClick={onEdit}
                className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
            >
                수정
            </button>
        </div>
    );
}

function PasswordForm({
    onSubmit,
}: {
    onSubmit: (oldPw: string, newPw: string) => Promise<void>;
}) {
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const isFilled = newPw.length > 0 && confirmPw.length > 0;
    const isMatch = newPw === confirmPw;

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                if (!oldPw || !newPw || !confirmPw) {
                    setErr("값을 입력해 주세요.");
                    return;
                }

                if (!isMatch) {
                    setErr("새 비밀번호가 일치하지 않습니다.");
                    return;
                }

                setSaving(true);
                try {
                    await onSubmit(oldPw, newPw);
                } catch (e: unknown) {
                    if (e instanceof Error) setErr(e.message);
                    else setErr("오류가 발생했습니다.");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <div>
                <div className="text-xs text-neutral-600 mb-2">기존 비밀번호</div>
                <input
                    type="password"
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">새 비밀번호</div>
                <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">새 비밀번호 확인</div>
                <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${!isFilled
                            ? "border-neutral-200"
                            : isMatch
                                ? "border-green-500"
                                : "border-red-500"
                        }`}
                />

                {isFilled && (
                    <p
                        className={`mt-2 text-xs ${isMatch ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {isMatch
                            ? "✔ 비밀번호가 일치합니다."
                            : "✖ 비밀번호가 일치하지 않습니다."}
                    </p>
                )}
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving || !isMatch || !isFilled}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
                {saving ? "Saving..." : "저장"}
            </button>
        </form>
    );
}

function ProfileImageForm({
    onSubmit,
}: {
    onSubmit: (file: File) => Promise<void>;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                if (!file) return;
                setSaving(true);
                await onSubmit(file);
                setSaving(false);
            }}
        >
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button
                type="submit"
                disabled={!file || saving}
                className="w-full rounded-xl border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
            >
                {saving ? "Uploading..." : "업로드"}
            </button>
        </form>
    );
}