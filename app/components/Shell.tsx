export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </main>
  );
}
