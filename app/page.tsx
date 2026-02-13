export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">ShBlog</h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold">
              프론트엔드 준비 완료
            </h2>
            <p className="text-gray-600 mt-2">
              이제 백엔드 API 연결을 시작합니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
