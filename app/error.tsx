"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white text-black">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">에러가 발생했습니다</h1>
                <p className="mt-3 text-neutral-600">{error.message}</p>
                <button onClick={() => reset()} className="mt-5 border px-4 py-2 text-sm">
                    다시 시도
                </button>
            </div>
        </div>
    );
}
