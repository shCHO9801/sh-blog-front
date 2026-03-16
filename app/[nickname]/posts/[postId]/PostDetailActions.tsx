// app/[nickname]/posts/[postId]/PostDetailActions.tsx
"use client";

import { getAccessToken, isTokenExpired } from "@/app/lib/authStorage";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
    postId: string;
};

export default function PostDetailActions({ postId }: Props) {
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            setCanEdit(false);
            return;
        }
        setCanEdit(true);
    }, []);

    if (!canEdit) return null;

    return (
        <Link
            href={`/admin/posts/${postId}/edit`}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:border-black hover:text-black"
        >
            수정
        </Link>
    );
}