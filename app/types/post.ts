export type PublicPostItem = {
    postId: number;
    title: string;
    isPublic: boolean;
    createdAt: string;
    categoryName?: string;
};

export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
};

export type PostRecentTumbniail = {
    postId: number;
    title: string;
    summary: string,
    categoryName: string;
    createdAt: string;
}

export type PublicPostDetail = {
    postId: number;
    categoryId: number;
    title: string;
    content: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
};