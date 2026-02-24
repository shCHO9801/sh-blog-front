import { request } from "@/app/lib/request";
import type { PageResponse, PostRecentTumbniail, PublicPostDetail, PublicPostItem } from "@/app/types/post";

export function fetchPublicPosts(nickname: string) {
    return request<PageResponse<PublicPostItem>>(
        `/api/posts/public/${encodeURIComponent(nickname)}`
    );
}

export function fetchPostRecentTumbniail(nickname: string): Promise<PostRecentTumbniail[]> {
    return request<PostRecentTumbniail[]>(
        `/api/posts/public/${encodeURIComponent(nickname)}/thumbnails`
    );
}

export function fetchPublicPostDetail(
    nickname: string,
    postId: string
): Promise<PublicPostDetail> {
    return request<PublicPostDetail>(
        `/api/posts/public/${encodeURIComponent(
            nickname
        )}/posts/${encodeURIComponent(postId)}`
    );
}
