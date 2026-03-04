"use client";

import Header from "@/app/components/Header";
import Shell from "@/app/components/Shell";
import { clearAuth, getAccessToken, getNickname, isTokenExpired } from "@/app/lib/authStorage";
import CategoriesPanel from "@/app/mypage/_components/CategoriesPanel";
import ProfilePanel from "@/app/mypage/_components/ProfilePanel";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Tab = "profile" | "categories";

export default function MyPage() {
    const router = useRouter();
    const sp = useSearchParams();

    const nickname = useMemo(() => getNickname(), []);
    const [tab, setTab] = useState<Tab>("profile");

    useEffect(() => {
        const token = getAccessToken();
        if (!token || isTokenExpired()) {
            clearAuth();
            router.replace("/login");
        }
    }, [router]);

    // /mypage?tab=categories 로 직접 접근 가능하게
    useEffect(() => {
        const q = sp.get("tab");
        if (q === "categories") setTab("categories");
        else setTab("profile");
    }, [sp]);

    const homeHref = nickname ? `/${nickname}` : "/";

    const onSelect = (next: Tab) => {
        setTab(next);
        router.replace(`/mypage?tab=${next}`, { scroll: false });
    };

    return (
        <Shell>
            <Header
                title="My Page"
                intro="계정 정보 수정 및 카테고리를 관리합니다."
                homeHref={homeHref}
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* 왼쪽 목차 */}
                <aside className="space-y-2">
                    <button
                        type="button"
                        onClick={() => onSelect("profile")}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${tab === "profile"
                                ? "border-neutral-900 bg-neutral-50"
                                : "border-neutral-200 hover:bg-neutral-50"
                            }`}
                    >
                        내 정보 수정
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelect("categories")}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${tab === "categories"
                                ? "border-neutral-900 bg-neutral-50"
                                : "border-neutral-200 hover:bg-neutral-50"
                            }`}
                    >
                        카테고리
                    </button>
                </aside>

                {/* 오른쪽 내용 */}
                <section>
                    {tab === "profile" ? <ProfilePanel /> : <CategoriesPanel />}
                </section>
            </div>

            <footer className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
                © {new Date().getFullYear()} My Page
            </footer>
        </Shell>
    );
}