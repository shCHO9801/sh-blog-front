import { formatDateYmdDot } from "@/app/lib/format";
import type { PublicPostItem } from "@/app/types/post";
import Link from "next/link";

type Props = {
    nickname: string;
    posts: PublicPostItem[];
};

export default function PostList({ nickname, posts }: Props) {
    return (
        <section>
            <div className="flex items-end justify-between">
                <h2 className="text-xl font-semibold">Posts</h2>
            </div>

            <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                {posts.map((post) => (
                    <li key={post.postId}>
                        <Link
                            href={`/${encodeURIComponent(nickname)}/posts/${post.postId}`}
                            className="block px-5 py-4 transition hover:bg-neutral-50"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">
                                    {post.title}
                                </h3>
                                <div className="shrink-0 text-xs text-neutral-500">
                                    {formatDateYmdDot(post.createdAt)}
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}