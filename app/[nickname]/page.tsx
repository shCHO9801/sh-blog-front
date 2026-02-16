import Banner from "@/app/components/Banner";
import Header from "@/app/components/Header";
import PostGridPlaceholder from "@/app/components/PostGridPlaceholder";
import ProfileCard from "@/app/components/ProfileCard";
import Shell from "@/app/components/Shell";
import { fetchPublicBlog } from "@/app/lib/blogApi";
import { ApiError } from "@/types/error";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ nickname: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;

  try {
    const data = await fetchPublicBlog(nickname);
    return {
      title: data.title,
      description: data.intro,
      openGraph: {
        title: data.title,
        description: data.intro,
        images: data.bannerImageUrl ? [data.bannerImageUrl] : [],
      },
    };
  } catch {
    // 메타데이터는 실패해도 페이지 자체를 404로 보내기보단 fallback이 보통 더 안정적
    return { title: "ShBlog", description: "Black & White minimal blog" };
  }
}

export default async function BlogHomePage({ params }: Props) {
  const { nickname } = await params;

  try {
    const data = await fetchPublicBlog(nickname);

    return (
      <Shell>
        <Header title={data.title} intro={data.intro} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <Banner imageUrl={data.bannerImageUrl} />
            <PostGridPlaceholder />
          </div>

          <ProfileCard
            nickname={data.userNickName}
            profileImageUrl={data.userProfileImageUrl}
          />
        </div>

        <footer className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} {data.title}
        </footer>
      </Shell>
    );
  } catch (e) {
    // ✅ 백엔드 에러코드 기반 분기
    if (e instanceof ApiError && e.code === "BLOG_001") {
      notFound(); // => app/not-found.tsx 렌더
    }

    // ✅ 그 외는 전역 에러 페이지(app/error.tsx)로
    throw e;
  }
}
