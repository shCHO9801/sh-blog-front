import type { PublicBlogResponse } from "@/app/types/blog";
import { request } from "@/app/lib/request";

export function fetchPublicBlog(nickname: string): Promise<PublicBlogResponse> {
  return request<PublicBlogResponse>(`/api/blog/public/${encodeURIComponent(nickname)}`);
}
