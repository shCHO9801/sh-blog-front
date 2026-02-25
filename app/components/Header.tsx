import AuthStatus from "@/app/components/AuthStatus";
import Link from "next/link";

export default function Header({
  title,
  intro,
  homeHref,
}: {
  title: string;
  intro: string;
  homeHref?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex-1">
        {homeHref ? (
          <Link
            href={homeHref}
            className="inline-block text-xs tracking-widest text-neutral-500 hover:text-neutral-900"
          >
            SHBLOG
          </Link>
        ) : (
          <div className="text-xs tracking-widest text-neutral-500">SHBLOG</div>
        )}

        <h1 className="mt-3 text-4xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {intro}
        </p>
      </div>

      {/* ✅ 우측 상단 로그인/닉네임/로그아웃 */}
      <div className="pt-1">
        <AuthStatus />
      </div>
    </header>
  );
}