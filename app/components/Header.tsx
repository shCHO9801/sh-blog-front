export default function Header({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="text-xs tracking-widest text-neutral-500">SHBLOG</div>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {intro}
        </p>
      </div>
    </header>
  );
}
