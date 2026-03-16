// app/admin/posts/new/page.tsx
import AdminPostEditor from "@/app/admin/posts/_components/AdminPostEditor";
import Header from "@/app/components/Header";
import Shell from "@/app/components/Shell";

type Props = {
    searchParams: Promise<{
        categoryId?: string;
    }>;
};

export default async function AdminPostNewPage({ searchParams }: Props) {
    const sp = await searchParams;
    const initialCategoryId = sp.categoryId ? Number(sp.categoryId) : undefined;

    return (
        <Shell>
            <Header
                title="New Post"
                intro="새 게시글을 작성합니다."
                homeHref="/admin/posts"
            />
            <div className="mt-8">
                <AdminPostEditor
                    mode="create"
                    initialCategoryId={
                        Number.isFinite(initialCategoryId) ? initialCategoryId : undefined
                    }
                />
            </div>
        </Shell>
    );
}