"use client";

import type { CategoryNode } from "@/app/types/category";
import { useRouter, useSearchParams } from "next/navigation";

export default function CategoryNavClient({
    nickname,
    categories,
}: {
    nickname: string;
    categories: CategoryNode[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeId = searchParams.get("categoryId");

    const goAll = () => router.push(`/${nickname}/posts`);
    const goCategory = (categoryId: number) =>
        router.push(`/${nickname}/posts?categoryId=${categoryId}`);

    const itemBase =
        "w-full text-left text-sm rounded-md px-2 py-1 transition outline-none";
    const itemHover =
        "hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-1 focus-visible:ring-neutral-300";
    const itemActive = "bg-neutral-100 font-semibold text-neutral-900";
    const itemNormal = "text-neutral-700";

    const childNormal = "text-neutral-600";
    const childActive = "bg-neutral-100 font-semibold text-neutral-900";

    return (
        <nav className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">Categories</h2>
            </div>

            {/* 전체 포스트 */}
            <button
                type="button"
                onClick={goAll}
                className={[
                    "mb-4",
                    itemBase,
                    itemHover,
                    activeId === null ? itemActive : itemNormal,
                ].join(" ")}
            >
                전체 포스트
            </button>

            {/* 부모 간격 조금 */}
            <ul className="space-y-4">
                {categories.map((parent) => {
                    const hasChildren = (parent.children?.length ?? 0) > 0;

                    // children 없는 부모는 “항목”으로 클릭 가능 (예: 미분류)
                    if (!hasChildren) {
                        const isActive = activeId === String(parent.id);

                        return (
                            <li key={parent.id}>
                                <button
                                    type="button"
                                    onClick={() => goCategory(parent.id)}
                                    className={[
                                        itemBase,
                                        itemHover,
                                        isActive ? itemActive : itemNormal,
                                    ].join(" ")}
                                >
                                    {parent.name}
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li key={parent.id}>
                            {/* ✅ 부모(클릭 불가) */}
                            <div className="w-full text-left text-sm text-neutral-700 px-2">
                                {parent.name}
                            </div>

                            {/* ✅ 자식: 항상 노출 */}
                            <ul className="mt-2 space-y-1 border-l border-neutral-200 pl-3">
                                {parent.children.map((child) => {
                                    const isChildActive = activeId === String(child.id);

                                    return (
                                        <li key={child.id}>
                                            <button
                                                type="button"
                                                onClick={() => goCategory(child.id)}
                                                className={[
                                                    itemBase,
                                                    itemHover,
                                                    isChildActive ? childActive : childNormal,
                                                ].join(" ")}
                                            >
                                                {child.name}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}