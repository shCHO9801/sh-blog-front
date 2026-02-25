"use client";

import { signIn } from "@/app/lib/authApi";
import { saveAuth } from "@/app/lib/authStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            const res = await signIn({ username, password });
            saveAuth(res.accessToken, res.expiresIn, res.nickname);

            router.push(`/${res.nickname}`);
            router.refresh();
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "로그인에 실패했습니다.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-dvh bg-white">
            {/* ✅ 메인과 동일 정렬 */}
            <div className="mx-auto max-w-5xl px-6 pt-10">
                <Link
                    href="/"
                    className="text-xs tracking-widest text-neutral-500 hover:text-neutral-900"
                >
                    SHBLOG
                </Link>
            </div>

            {/* ✅ 로그인 카드 */}
            <div className="mx-auto flex max-w-5xl px-6 pt-20">
                <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
                    <h1 className="text-2xl font-semibold">Login</h1>
                    <p className="mt-2 text-sm text-neutral-600">관리자 로그인</p>

                    <form onSubmit={onSubmit} className="mt-8 space-y-4">
                        <div>
                            <label className="text-sm text-neutral-700">Username</label>
                            <input
                                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-300"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-neutral-700">Password</label>
                            <input
                                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-300"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        {errorMsg && (
                            <p className="text-sm text-red-600">{errorMsg}</p>
                        )}

                        {/* ✅ 로그인 버튼 강조 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md border border-black bg-white px-3 py-2 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
                        >
                            {loading ? "로그인 중..." : "Login"}
                        </button>
                    </form>

                    {/* ✅ 미니멀 뒤로가기 */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-xs text-neutral-500 hover:text-neutral-900"
                        >
                            ← 뒤로가기
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}