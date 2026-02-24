"use client";

import type { CategoryNode } from "@/types/category";
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

    return (
        <nav className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">Categories</h2>
            </div>

            {/* ✅ 전체 포스트: 박스 제거, 텍스트 버튼 */}
            <button
                type="button"
                onClick={goAll}
                className={[
                    "mb-4 w-full text-left text-sm",
                    activeId === null
                        ? "font-semibold text-neutral-900"
                        : "text-neutral-700 hover:text-neutral-900",
                ].join(" ")}
            >
                전체 포스트
            </button>

            {/* ✅ 부모 간격 조금 */}
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
                                        "w-full text-left text-sm",
                                        isActive
                                            ? "font-semibold text-neutral-900"
                                            : "text-neutral-700 hover:text-neutral-900",
                                    ].join(" ")}
                                >
                                    {parent.name}
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li key={parent.id}>
                            {/* ✅ 부모: 전체 포스트와 같은 글자 형태(텍스트) + 클릭 불가 */}
                            <div className="w-full text-left text-sm text-neutral-700">
                                {parent.name}
                            </div>

                            {/* ✅ 자식: 항상 노출 */}
                            <ul className="mt-2 space-y-1 border-l border-neutral-200 pl-3">
                                {parent.children.map((child) => {
                                    const childActive = activeId === String(child.id);
                                    return (
                                        <li key={child.id}>
                                            <button
                                                type="button"
                                                onClick={() => goCategory(child.id)}
                                                className={[
                                                    "w-full text-left text-sm",
                                                    childActive
                                                        ? "font-semibold text-neutral-900"
                                                        : "text-neutral-600 hover:text-neutral-900",
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