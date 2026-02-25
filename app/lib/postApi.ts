import { request } from "@/app/lib/request";
import type {
    PageResponse,
    PostRecentTumbniail,
    PublicPostDetail,
    PublicPostItem,
} from "@/app/types/post";

export function fetchPublicPosts(
    nickname: string,
    options?: {
        categoryId?: string;
        page?: number;
        size?: number;
    }
) {
    const page = options?.page ?? 0;
    const size = options?.size ?? 20;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    if (options?.categoryId) {
        return request<PageResponse<PublicPostItem>>(
            `/api/posts/public/${encodeURIComponent(
                nickname
            )}/categories/${encodeURIComponent(options.categoryId)}?${params.toString()}`
        );
    }

    return request<PageResponse<PublicPostItem>>(
        `/api/posts/public/${encodeURIComponent(nickname)}?${params.toString()}`
    );
}

// 아래는 그대로 유지
export function fetchPostRecentTumbniail(
    nickname: string
): Promise<PostRecentTumbniail[]> {
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