export default function Banner({ imageUrl }: { imageUrl: string }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="banner"
          className="h-56 w-full rounded-xl object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white">
          <div className="text-sm text-neutral-500">banner (placeholder)</div>
        </div>
      )}
    </section>
  );
}
