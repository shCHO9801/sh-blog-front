// app/[nickname]/posts/CategoryCreateButton.tsx
"use client";

import { getAccessToken, isTokenExpired } from "@/app/lib/authStorage";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
    categoryId?: string;
};

export default function CategoryCreateButton({ categoryId }: Props) {
    const [canWrite, setCanWrite] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            setCanWrite(false);
            return;
        }
        setCanWrite(true);
    }, []);

    if (!canWrite) return null;

    const href = categoryId
        ? `/admin/posts/new?categoryId=${encodeURIComponent(categoryId)}`
        : "/admin/posts/new";

    return (
        <Link
            href={href}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:border-black hover:text-black"
        >
            새 글 작성
        </Link>
    );
}