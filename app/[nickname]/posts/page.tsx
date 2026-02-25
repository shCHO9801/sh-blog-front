import CategoryNav from "@/app/components/CategoryNav";
import Header from "@/app/components/Header";
import PostList from "@/app/components/PostList";
import ProfileCard from "@/app/components/ProfileCard";
import Shell from "@/app/components/Shell";
import { fetchPublicBlog } from "@/app/lib/blogApi";
import { fetchPublicPosts } from "@/app/lib/postApi";
import { ApiError } from "@/types/error";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ nickname: string }>;
    searchParams: Promise<{
        categoryId?: string;
        page?: string;
    }>;
};

export default async function PostsPage({ params, searchParams }: Props) {
    const { nickname } = await params;
    const sp = await searchParams;

    const categoryId = sp.categoryId;
    const page = Number(sp.page ?? 0);

    try {
        const [blog, data] = await Promise.all([
            fetchPublicBlog(nickname),
            fetchPublicPosts(nickname, { categoryId, page, size: 20 }),
        ]);

        const categoryName = categoryId ? data.content?.[0]?.categoryName : undefined;

        return (
            <Shell>
                <Header
                    title={blog.title}
                    intro={categoryId ? (categoryName ?? "카테고리") : "전체 포스트"}
                    homeHref={`/${nickname}`}
                />

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
                    {/* 좌측: 목록 */}
                    <div className="space-y-6">
                        <PostList nickname={nickname} posts={data.content} />

                        <div className="mt-6 flex justify-center gap-4 text-sm">
                            {page > 0 && (
                                <a
                                    href={`/${nickname}/posts?page=${page - 1}${categoryId ? `&categoryId=${categoryId}` : ""
                                        }`}
                                    className="text-neutral-600 hover:text-neutral-900"
                                >
                                    이전
                                </a>
                            )}

                            {data.hasNext && (
                                <a
                                    href={`/${nickname}/posts?page=${page + 1}${categoryId ? `&categoryId=${categoryId}` : ""
                                        }`}
                                    className="text-neutral-600 hover:text-neutral-900"
                                >
                                    다음
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 우측: 사이드바 */}
                    <aside className="space-y-6">
                        <ProfileCard
                            nickname={blog.userNickName}
                            profileImageUrl={blog.userProfileImageUrl}
                        />
                        <CategoryNav nickname={nickname} />
                    </aside>
                </div>

                <footer className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
                    © {new Date().getFullYear()} {blog.title}
                </footer>
            </Shell>
        );
    } catch (e) {
        if (e instanceof ApiError && e.code === "BLOG_001") notFound();
        throw e;
    }
}