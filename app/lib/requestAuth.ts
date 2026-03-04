import { clearAuth, getAccessToken, isTokenExpired } from "@/app/lib/authStorage";

export class AuthError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "AuthError";
    }
}

export async function requestAuth<T>(url: string, init: RequestInit = {}): Promise<T> {
    const token = getAccessToken();
    if (!token || isTokenExpired()) {
        clearAuth();
        throw new AuthError("Token missing or expired");
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const isForm = init.body instanceof FormData;
    const method = init.method?.toUpperCase() ?? "GET";
    if (!isForm && method !== "GET") {
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, { ...init, headers });

    // ✅ 401/403 모두 인증 실패로 처리
    if (res.status === 401 || res.status === 403) {
        clearAuth();
        throw new AuthError("Unauthorized");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed: ${res.status}`);
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
}