// app/lib/authStorage.ts
const TOKEN_KEY = "shblog_access_token";
const EXPIRES_AT_KEY = "shblog_expires_at";
const NICKNAME_KEY = "shblog_nickname";

function isBrowser() {
    return typeof window !== "undefined";
}

export function saveAuth(accessToken: string, expiresIn: number, nickname: string) {
    if (!isBrowser()) return;

    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    localStorage.setItem(NICKNAME_KEY, nickname);
}

export function clearAuth() {
    if (!isBrowser()) return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(NICKNAME_KEY);
}

export function getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getNickname(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(NICKNAME_KEY);
}

export function isTokenExpired(): boolean {
    // 서버에서는 "만료로 간주"가 안전 (보호 페이지 접근 차단)
    if (!isBrowser()) return true;

    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;

    const exp = Number(expiresAt);
    if (!Number.isFinite(exp)) return true;

    return Date.now() > exp;
}