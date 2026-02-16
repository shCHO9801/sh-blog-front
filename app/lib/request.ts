import { headers } from "next/headers";
import { ApiError, type ApiErrorResponse } from "@/types/error";

function isApiErrorResponse(x: any): x is ApiErrorResponse {
  return (
    x &&
    typeof x === "object" &&
    typeof x.status === "number" &&
    typeof x.message === "string" &&
    typeof x.code === "string" &&
    ("field" in x) && (x.field === null || typeof x.field === "string")
  );
}

export async function request<T>(path: string): Promise<T> {
  const h = await headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${proto}://${host}${path}`;

  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    if (isApiErrorResponse(body)) {
      throw new ApiError(body);
    }

    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}
