import CategoryNavClient from "@/app/components/CategoryNavClient";
import { fetchPublicCategoriesTree } from "@/app/lib/categoryApi.public";

export default async function CategoryNav({ nickname }: { nickname: string }) {
    try {
        const categories = await fetchPublicCategoriesTree(nickname);
        return <CategoryNavClient nickname={nickname} categories={categories} />;
    } catch (e) {
        console.error("[CategoryNav] failed:", e);
        return null;
    }
}