"use client";

import Modal from "@/app/components/Modal";
import { clearAuth, getAccessToken, isTokenExpired } from "@/app/lib/authStorage";
import { resizeProfileImage } from "@/app/lib/imageResize";
import { requestAuth } from "@/app/lib/requestAuth";
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

export default function MyPageProfile() {
    const router = useRouter();

    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);

    const [modal, setModal] = useState<ModalState>(null);

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            clearAuth();
            router.replace("/login");
            return;
        }

        (async () => {
            try {
                const data = await requestAuth<MeResponse>(api("/api/users/me"));
                setMe(data);
            } catch (e: any) {
                setPageError(e?.message ?? "Failed to load");
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

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

    const refreshMe = async () => {
        const data = await requestAuth<MeResponse>(api("/api/users/me"));
        setMe(data);
    };

    // ---- API handlers ----
    const patchUsername = async (username: string) => {
        const data = await requestAuth<MeResponse>(api("/api/users/me/username"), {
            method: "PATCH",
            body: JSON.stringify({ username }),
        });
        setMe(data);
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
        // 백엔드가 MultiFile file 이라고 했으니 key는 "file"로
        form.append("file", processed);

        const data = await requestAuth<MeResponse>(api("/api/users/me/profile-image"), {
            method: "PUT",
            body: form,
        });
        setMe(data);
    };

    const deleteProfileImage = async () => {
        await requestAuth<null>(api("/api/users/me/profile-image"), { method: "DELETE" });
        await refreshMe(); // 204일 가능성 대비
    };

    if (loading) return <div className="p-10">Loading...</div>;
    if (!me) return <div className="p-10 text-sm text-neutral-600">{pageError ?? "No data"}</div>;

    return (
        <main className="max-w-xl mx-auto py-16 px-6">
            <div className="border border-neutral-200 p-8 space-y-8">
                <h1 className="text-xl font-semibold">내 정보</h1>

                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full border border-neutral-200 overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {me.profileImageUrl ? (
                                <img src={me.profileImageUrl} alt="profile" className="h-full w-full object-cover" />
                            ) : null}
                        </div>
                        <div>
                            <div className="text-sm">{me.nickname}</div>
                            <div className="text-xs text-neutral-500">{me.email}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setModal({ type: "profileImage" })}
                            className="border border-neutral-200 px-3 py-1 text-xs hover:bg-neutral-50"
                        >
                            이미지 변경
                        </button>
                        {me.profileImageUrl && (
                            <button
                                type="button"
                                onClick={deleteProfileImage}
                                className="border border-neutral-200 px-3 py-1 text-xs hover:bg-neutral-50"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </div>

                <Section label="Username" value={me.username} onEdit={() => setModal({ type: "username" })} />
                <Section label="Password" value="********" onEdit={() => setModal({ type: "password" })} />
                <Section label="Nickname" value={me.nickname} onEdit={() => setModal({ type: "nickname" })} />
                <Section label="Email" value={me.email} onEdit={() => setModal({ type: "email" })} />
            </div>

            <Modal open={!!modal} title={modalTitle} onClose={() => setModal(null)}>
                {modal?.type === "username" && (
                    <SingleFieldForm
                        initialValue={me.username}
                        label="새 username"
                        placeholder="username"
                        onSubmit={async (v) => {
                            await patchUsername(v);
                            setModal(null);
                        }}
                    />
                )}

                {modal?.type === "nickname" && (
                    <SingleFieldForm
                        initialValue={me.nickname}
                        label="새 nickname"
                        placeholder="nickname"
                        onSubmit={async (v) => {
                            await patchNickname(v);
                            setModal(null);
                        }}
                    />
                )}

                {modal?.type === "email" && (
                    <SingleFieldForm
                        initialValue={me.email}
                        label="새 email"
                        placeholder="email"
                        onSubmit={async (v) => {
                            await patchEmail(v);
                            setModal(null);
                        }}
                    />
                )}

                {modal?.type === "password" && (
                    <PasswordForm
                        onSubmit={async (oldPw, newPw) => {
                            await patchPassword(oldPw, newPw);
                            setModal(null);
                        }}
                    />
                )}

                {modal?.type === "profileImage" && (
                    <ProfileImageForm
                        onSubmit={async (file) => {
                            await putProfileImage(file);
                            setModal(null);
                        }}
                    />
                )}
            </Modal>
        </main>
    );
}

function Section({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div>
                <div className="text-sm text-neutral-500">{label}</div>
                <div className="mt-1">{value}</div>
            </div>
            <button type="button" onClick={onEdit} className="border border-neutral-200 px-3 py-1 text-xs hover:bg-neutral-50">
                수정
            </button>
        </div>
    );
}

function SingleFieldForm({
    initialValue,
    label,
    placeholder,
    onSubmit,
}: {
    initialValue: string;
    label: string;
    placeholder: string;
    onSubmit: (value: string) => Promise<void>;
}) {
    const [value, setValue] = useState(initialValue);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                const v = value.trim();
                if (!v) {
                    setErr("값을 입력해 주세요.");
                    return;
                }

                setSaving(true);
                try {
                    await onSubmit(v);
                } catch (e: any) {
                    setErr(e?.message ?? "Failed");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <div>
                <div className="text-xs text-neutral-600 mb-2">{label}</div>
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-50"
            >
                {saving ? "Saving..." : "저장"}
            </button>
        </form>
    );
}

function PasswordForm({ onSubmit }: { onSubmit: (oldPw: string, newPw: string) => Promise<void> }) {
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                if (!oldPw || !newPw) {
                    setErr("값을 입력해 주세요.");
                    return;
                }

                setSaving(true);
                try {
                    await onSubmit(oldPw, newPw);
                } catch (e: any) {
                    setErr(e?.message ?? "Failed");
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
                    className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            <div>
                <div className="text-xs text-neutral-600 mb-2">새 비밀번호</div>
                <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-50"
            >
                {saving ? "Saving..." : "저장"}
            </button>
        </form>
    );
}

function ProfileImageForm({ onSubmit }: { onSubmit: (file: File) => Promise<void> }) {
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                if (!file) return;

                setErr(null);
                setSaving(true);
                try {
                    await onSubmit(file);
                } catch (e: any) {
                    setErr(e?.message ?? "Failed");
                } finally {
                    setSaving(false);
                }
            }}
        >
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />

            {err && <p className="text-xs text-red-600">{err}</p>}

            <button
                type="submit"
                disabled={!file || saving}
                className="w-full border border-neutral-900 bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:opacity-50"
            >
                {saving ? "Uploading..." : "업로드"}
            </button>
        </form>
    );
}