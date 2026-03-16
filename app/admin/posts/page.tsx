// app/admin/posts/page.tsx
import AdminPostsClient from "@/app/admin/posts/AdminPostsClient";
import Header from "@/app/components/Header";
import Shell from "@/app/components/Shell";

export default function AdminPostsPage() {
    return (
        <Shell>
            <Header
                title="Admin Posts"
                intro="내 게시글을 관리합니다."
                homeHref="/"
            />
            <div className="mt-8">
                <AdminPostsClient />
            </div>
        </Shell>
    );
}