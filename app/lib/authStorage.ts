const TOKEN_KEY = "shblog_access_token";
const EXPIRES_AT_KEY = "shblog_expires_at";
const NICKNAME_KEY = "shblog_nickname";

export function saveAuth(accessToken: string, expiresIn: number, nickname: string) {
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    localStorage.setItem(NICKNAME_KEY, nickname);
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(NICKNAME_KEY);
}

export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getNickname(): string | null {
    return localStorage.getItem(NICKNAME_KEY);
}

export function isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() > Number(expiresAt);
}