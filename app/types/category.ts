export type CategoryNode = {
    id: number;
    name: string;
    description?: string;
    children: CategoryNode[];
};