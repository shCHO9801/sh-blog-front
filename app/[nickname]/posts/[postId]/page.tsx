// app/[nickname]/posts/[postId]/page.tsx
import Markdown from "@/app/components/Markdown";
import Shell from "@/app/components/Shell";
import { formatDateYmdDot } from "@/app/lib/format";
import { extractToc } from "@/app/lib/markdownToc";
import { fetchPublicPostDetail } from "@/app/lib/postApi";
import { ApiError } from "@/types/error";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostDetailActions from "./PostDetailActions";

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
    const toc = extractToc(post.content ?? "");

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
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-500">
                {formatDateYmdDot(post.createdAt)}
              </div>
              <h1 className="mt-2 text-3xl font-semibold leading-tight">
                {post.title}
              </h1>
            </div>

            <PostDetailActions postId={postId} />
          </div>
        </header>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
          <article>
            <Markdown content={post.content ?? ""} />
          </article>

          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-10 rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="text-xs font-medium tracking-wide text-neutral-500">
                  On this page
                </div>

                <nav className="mt-3">
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li
                        key={item.id}
                        className={
                          item.level === 1
                            ? "text-sm"
                            : item.level === 2
                              ? "pl-3 text-sm text-neutral-700"
                              : "pl-6 text-xs text-neutral-500"
                        }
                      >
                        <a
                          href={`#${item.id}`}
                          className="block truncate hover:text-black"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>
      </Shell>
    );
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.code === "BLOG_001" || e.code === "POST_002") notFound();
    }
    throw e;
  }
}