// app/admin/posts/AdminPostsClient.tsx
"use client";

import { clearAuth, getAccessToken, isTokenExpired } from "@/app/lib/authStorage";
import { deleteMyPost, fetchMyPosts, patchPostPublic } from "@/app/lib/postAdminApi";
import type { MyPostItem, PageResponse } from "@/app/types/post";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPostsClient() {
    const router = useRouter();
    const [data, setData] = useState<PageResponse<MyPostItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const load = async () => {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetchMyPosts({ page: 0, size: 20 });
            setData(res);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            clearAuth();
            router.replace("/login");
            return;
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const onTogglePublic = async (postId: number, next: boolean) => {
        setErr(null);
        try {
            await patchPostPublic(postId, next);
            await load();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "변경에 실패했습니다.");
        }
    };

    const onDelete = async (postId: number) => {
        const ok = window.confirm("정말 삭제할까요?");
        if (!ok) return;

        setErr(null);
        try {
            await deleteMyPost(postId);
            await load();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "삭제에 실패했습니다.");
        }
    };

    return (
        <section>
            <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                    {data ? `총 ${data.totalElements}개` : ""}
                </div>

                <Link
                    href="/admin/posts/new"
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:border-black"
                >
                    새 글 작성
                </Link>
            </div>

            {err && (
                <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-red-600">
                    {err}
                </p>
            )}

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white">
                {loading ? (
                    <div className="p-6 text-sm text-neutral-600">로딩 중...</div>
                ) : !data || data.content.length === 0 ? (
                    <div className="p-6 text-sm text-neutral-600">게시글이 없습니다.</div>
                ) : (
                    <ul className="divide-y divide-neutral-200">
                        {data.content.map((p) => (
                            <li key={p.postId} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <span>{p.categoryName}</span>
                                            <span>·</span>
                                            <span>{new Date(p.createdAt).toLocaleString()}</span>
                                        </div>

                                        <div className="mt-2 flex items-center gap-3">
                                            <Link
                                                href={`/admin/posts/${p.postId}/edit`}
                                                className="truncate text-base font-semibold hover:underline"
                                            >
                                                {p.title}
                                            </Link>

                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] ${p.isPublic
                                                    ? "border-neutral-200 text-neutral-700"
                                                    : "border-neutral-200 text-neutral-500"
                                                    }`}
                                            >
                                                {p.isPublic ? "PUBLIC" : "PRIVATE"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onTogglePublic(p.postId, !p.isPublic)}
                                            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs hover:border-black"
                                        >
                                            {p.isPublic ? "비공개" : "공개"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(p.postId)}
                                            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 hover:border-black"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}