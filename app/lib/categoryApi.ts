import { request } from "@/app/lib/request";
import type { CategoryNode } from "@/types/category";

type RawCategory = {
    categoryId: number;
    name: string;
    description?: string;
    children: Array<{
        id: number; // child는 id
        name: string;
        description?: string;
    }>;
};

function normalize(raw: RawCategory[]): CategoryNode[] {
    return raw.map((c) => ({
        id: c.categoryId,
        name: c.name,
        description: c.description,
        children: (c.children ?? []).map((ch) => ({
            id: ch.id,
            name: ch.name,
            description: ch.description,
            children: [],
        })),
    }));
}

export async function fetchPublicCategoriesTree(
    nickname: string
): Promise<CategoryNode[]> {
    const data = await request<RawCategory[]>(
        `/api/category/public/${encodeURIComponent(nickname)}`
    );
    return normalize(data);
}