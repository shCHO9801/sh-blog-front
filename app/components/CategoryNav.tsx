import CategoryNavClient from "@/app/components/CategoryNavClient";
import { fetchPublicCategoriesTree } from "@/app/lib/categoryApi";

export default async function CategoryNav({ nickname }: { nickname: string }) {
    try {
        const categories = await fetchPublicCategoriesTree(nickname);
        return <CategoryNavClient nickname={nickname} categories={categories} />;
    } catch (e) {
        // 403/401/404 등 어떤 이유든 네비만 숨기고 홈은 정상 렌더
        // 필요하면 콘솔 로그만 남김
        console.error("[CategoryNav] failed:", e);

        return null;
    }
}