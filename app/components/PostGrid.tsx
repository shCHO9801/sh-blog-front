// import type { PublicPostItem } from "@/app/types/post";

// type Props = {
//     posts: PublicPostItem[];
// };

// export default function PostGrid({ posts }: Props) {
//     if (posts.length === 0) {
//         return (
//             <div className="rounded-2xl border border-neutral-200 p-6 text-center text-neutral-500">
//                 아직 작성된 글이 없습니다.
//             </div>
//         );
//     }

//     return (
//         <div className="grid gap-4 md:grid-cols-2">
//             {posts.map((post) => (
//                 <article
//                     key={post.postId}
//                     className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-black"
//                 >
//                     <div className="text-xs text-neutral-500">
//                         {new Date(post.createdAt).toLocaleDateString()}
//                     </div>

//                     <div className="mt-2 text-lg font-semibold">
//                         {post.title}
//                     </div>
//                 </article>
//             ))}
//         </div>
//     );
// }

import type { PostRecentTumbniail } from "@/app/types/post";
import { formatDateYmdDot } from "@/app/lib/format";

type Props = {
  posts: PostRecentTumbniail[];
};

export default function PostGrid({ posts }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <div className="text-xs text-neutral-500">최근 6개</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.postId}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-black"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{post.categoryName}</span>
              <span>{formatDateYmdDot(post.createdAt)}</span>
            </div>

            <h3 className="mt-2 text-lg font-semibold">
              {post.title}
            </h3>

            {post.summary && (
              <p className="mt-2 text-sm leading-relaxed text-neutral-700 line-clamp-2">
                {post.summary}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}