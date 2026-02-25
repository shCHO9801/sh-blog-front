import Markdown from "@/app/components/Markdown";
import Shell from "@/app/components/Shell";
import { formatDateYmdDot } from "@/app/lib/format";
import { fetchPublicPostDetail } from "@/app/lib/postApi";
import { ApiError } from "@/types/error";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ nickname: string; postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname, postId } = await params;

  try {
    const data = await fetchPublicPostDetail(nickname, postId);
    const desc = data.content ? data.content.slice(0, 140) : "";
    return {
      title: data.title,
      description: desc,
      openGraph: { title: data.title, description: desc },
    };
  } catch {
    return { title: "Post", description: "ShBlog post" };
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { nickname, postId } = await params;

  try {
    const post = await fetchPublicPostDetail(nickname, postId);

    return (
      <Shell>
        <div className="mb-6">
          <Link
            href={`/${encodeURIComponent(nickname)}`}
            className="text-sm text-neutral-600 hover:text-black"
          >
            ← Back
          </Link>
        </div>

        <header className="border-b border-neutral-200 pb-6">
          <div className="text-xs text-neutral-500">
            {formatDateYmdDot(post.createdAt)}
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">
            {post.title}
          </h1>
        </header>

        <article className="mt-8">
          <Markdown content={post.content ?? ""} />
        </article>
      </Shell>
    );
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.code === "BLOG_001" || e.code === "POST_002") notFound();
    }
    throw e;
  }
}