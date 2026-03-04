// app/lib/categoryApi.me.ts
import { requestAuth } from "@/app/lib/requestAuth";

export type CategoryTreeResponse = Array<{
    categoryId: number; // root id
    name: string;
    description: string;
    children: Array<{
        id: number; // child id
        name: string;
        description: string;
    }>;
}>;

export type CategoryNode = {
    id: number;
    name: string;
    description: string;
    parentId: number | null;
    rootId: number;
    isRoot: boolean;
};

export type RootCategory = {
    id: number;
    name: string;
    description: string;
};

function api(path: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    return base ? `${base}${path}` : path;
}

export function normalizeTree(tree: CategoryTreeResponse) {
    const roots: RootCategory[] = tree.map((r) => ({
        id: r.categoryId,
        name: r.name,
        description: r.description ?? "",
    }));

    const nodesByRoot: Record<number, CategoryNode[]> = {};

    for (const r of tree) {
        const rootId = r.categoryId;
        nodesByRoot[rootId] = [
            {
                id: r.categoryId,
                name: r.name,
                description: r.description ?? "",
                parentId: null,
                rootId,
                isRoot: true,
            },
            ...(r.children ?? []).map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description ?? "",
                parentId: rootId,
                rootId,
                isRoot: false,
            })),
        ];
    }

    return { roots, nodesByRoot };
}

export async function fetchMyCategoryTree() {
    return requestAuth<CategoryTreeResponse>(api("/api/category/me"));
}

export async function createCategory(input: {
    name: string;
    description: string;
    parentId: number | null; // null => root
}) {
    return requestAuth<any>(api("/api/category"), {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function updateCategory(
    id: number,
    input: { name: string; description: string; parentId: number | null }
) {
    return requestAuth<any>(api(`/api/category/me/${id}`), {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export async function deleteCategory(id: number) {
    return requestAuth<any>(api(`/api/category/me/${id}`), {
        method: "DELETE",
    });
}