import { formatDateYmdDot } from "@/app/lib/format";
import type { PostRecentTumbniail } from "@/app/types/post";
import Link from "next/link";

type Props = {
  nickname: string;
  posts: PostRecentTumbniail[];
};

export default function PostGrid({ nickname, posts }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <div className="text-xs text-neutral-500">최근 6개</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.postId}
            href={`/${encodeURIComponent(nickname)}/posts/${post.postId}`}
            className="block"
          >
            <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-black">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{post.categoryName}</span>
                <span>{formatDateYmdDot(post.createdAt)}</span>
              </div>

              <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>

              {post.summary && (
                <p className="mt-2 text-sm leading-relaxed text-neutral-700 line-clamp-2">
                  {post.summary}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}