import { request } from "@/app/lib/request";
import type { PageResponse, PublicPostItem, PostRecentTumbniail } from "@/app/types/post";

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
