"use client";

import { clearAuth, getAccessToken, getNickname, isTokenExpired } from "@/app/lib/authStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthStatus() {
    const router = useRouter();
    const [nickname, setNickname] = useState<string | null>(null);

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            clearAuth();
            setNickname(null);
            return;
        }
        setNickname(getNickname());
    }, []);

    const onLogout = () => {
        clearAuth();
        setNickname(null);
        router.refresh();
    };

    if (!nickname) {
        return (
            <Link
                href="/login"
                className="text-xs text-neutral-600 hover:text-neutral-900"
            >
                Login
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-700">{nickname}</span>
            <button
                type="button"
                onClick={onLogout}
                className="text-xs text-neutral-600 hover:text-neutral-900"
            >
                Logout
            </button>
        </div>
    );
}