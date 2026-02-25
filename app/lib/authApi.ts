import type { MeResponse, SignInRequest, SignInResponse } from "@/app/types/auth";

async function parseError(res: Response) {
    try {
        const data = await res.json();
        // 백엔드 에러 포맷이면 message 사용
        if (data?.message) return data.message as string;
    } catch {
        // ignore
    }
    return `HTTP ${res.status}`;
}

export async function signIn(payload: SignInRequest): Promise<SignInResponse> {
    const res = await fetch(`/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(await parseError(res));
    }

    return res.json();
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
    const res = await fetch(`/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(await parseError(res));
    }

    return res.json();
}