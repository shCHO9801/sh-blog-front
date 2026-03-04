// app/mypage/page.tsx
import MyPageClient from "@/app/mypage/MyPageClient";
import { Suspense } from "react";

export default function MyPagePage() {
    return (
        <Suspense fallback={<div />}>
            <MyPageClient />
        </Suspense>
    );
}