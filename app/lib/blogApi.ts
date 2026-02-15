import type { PublicBlogResponse } from "@/app/types/blog";
import { headers } from "next/headers";

export async function fetchPublicBlog(nickname: string): Promise<PublicBlogResponse> {
  const h = await headers();
  const host = h.get("host"); // 예: localhost:3000 또는 shblog.shhome.synology.me
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";

  const url = `${proto}://${host}/api/blog/public/${encodeURIComponent(nickname)}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch blog meta: ${res.status}`);
  }

  return res.json();
}
