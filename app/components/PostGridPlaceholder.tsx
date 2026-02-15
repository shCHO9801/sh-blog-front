export default function PostGridPlaceholder() {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <div className="text-xs text-neutral-500">최신순 · (placeholder)</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <article
            key={i}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-black"
          >
            <div className="text-xs text-neutral-500">2026.02.13</div>
            <div className="mt-2 text-lg font-semibold">샘플 포스트 #{i + 1}</div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              여기는 목록 카드 UI 자리. 다음 단계에서 실제 포스트 API 붙일 예정.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
