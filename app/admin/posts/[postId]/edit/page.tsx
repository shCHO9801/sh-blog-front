// app/admin/posts/[postId]/edit/page.tsx
import AdminPostEditor from "@/app/admin/posts/_components/AdminPostEditor";
import Header from "@/app/components/Header";
import Shell from "@/app/components/Shell";

type Props = {
    params: Promise<{ postId: string }>;
};

export default async function AdminPostEditPage({ params }: Props) {
    const { postId } = await params;

    return (
        <Shell>
            <Header
                title="Edit Post"
                intro="게시글을 수정합니다."
                homeHref="/admin/posts"
            />
            <div className="mt-8">
                <AdminPostEditor mode="edit" postId={Number(postId)} />
            </div>
        </Shell>
    );
}