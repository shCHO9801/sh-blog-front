// app/lib/postAdminApi.ts
import { requestAuth } from "@/app/lib/requestAuth";
import type {
    CreatePostRequest,
    MyPostDetail,
    MyPostItem,
    PageResponse,
    UploadImageResponse,
} from "@/app/types/post";

function api(path: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    return base ? `${base}${path}` : path;
}

export function fetchMyPosts(options?: { page?: number; size?: number }) {
    const page = options?.page ?? 0;
    const size = options?.size ?? 20;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    return requestAuth<PageResponse<MyPostItem>>(
        api(`/api/posts/me?${params.toString()}`)
    );
}

export function fetchMyPostDetail(postId: number | string) {
    return requestAuth<MyPostDetail>(
        api(`/api/posts/me/posts/${encodeURIComponent(String(postId))}`)
    );
}

export function createPost(input: CreatePostRequest) {
    return requestAuth<MyPostDetail>(api("/api/posts"), {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function patchPostTitle(postId: number, title: string) {
    return requestAuth<any>(api(`/api/posts/me/posts/${postId}/title`), {
        method: "PATCH",
        body: JSON.stringify({ title }),
    });
}

export function patchPostPublic(postId: number, isPublic: boolean) {
    return requestAuth<any>(api(`/api/posts/me/posts/${postId}/public`), {
        method: "PATCH",
        body: JSON.stringify({ isPublic }),
    });
}

export function patchPostContent(postId: number, content: string) {
    return requestAuth<any>(api(`/api/posts/me/posts/${postId}/content`), {
        method: "PATCH",
        body: JSON.stringify({ content }),
    });
}

export function patchPostCategory(postId: number, categoryId: number) {
    return requestAuth<any>(api(`/api/posts/me/posts/${postId}/category`), {
        method: "PATCH",
        body: JSON.stringify({ categoryId }),
    });
}

export function deleteMyPost(postId: number) {
    return requestAuth<any>(api(`/api/posts/me/posts/${postId}`), {
        method: "DELETE",
    });
}

export async function uploadPostImage(file: File): Promise<UploadImageResponse> {
    const fd = new FormData();
    fd.append("file", file);

    return requestAuth<UploadImageResponse>(api("/api/files/upload/images"), {
        method: "POST",
        body: fd,
    });
}