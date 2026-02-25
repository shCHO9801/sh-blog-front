import Banner from "@/app/components/Banner";
import CategoryNav from "@/app/components/CategoryNav";
import Header from "@/app/components/Header";
import PostGrid from "@/app/components/PostGrid";
import ProfileCard from "@/app/components/ProfileCard";
import Shell from "@/app/components/Shell";
import { fetchPublicBlog } from "@/app/lib/blogApi";
import { fetchPostRecentTumbniail } from "@/app/lib/postApi";
import { ApiError } from "@/types/error";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ nickname: string }>;
  searchParams: {
    categoryId?: string;
    page?: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;

  try {
    const blog = await fetchPublicBlog(nickname);
    return {
      title: blog.title,
      description: blog.intro,
      openGraph: {
        title: blog.title,
        description: blog.intro,
        images: blog.bannerImageUrl ? [blog.bannerImageUrl] : [],
      },
    };
  } catch {
    return { title: "ShBlog", description: "Black & White minimal blog" };
  }
}

export default async function BlogHomePage({ params }: Props) {
  const { nickname } = await params;

  try {
    const [blog, posts] = await Promise.all([
      fetchPublicBlog(nickname),
      fetchPostRecentTumbniail(nickname),
    ]);

    return (
      <Shell>
        <Header title={blog.title} intro={blog.intro} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <Banner imageUrl={blog.bannerImageUrl} />
            <PostGrid nickname={nickname} posts={posts} />
          </div>

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