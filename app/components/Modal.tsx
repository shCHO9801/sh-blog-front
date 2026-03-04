"use client";

import { ReactNode, useEffect } from "react";

export default function Modal({
    open,
    title,
    children,
    onClose,
}: {
    open: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-label="close"
            />
            <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-neutral-600 hover:text-neutral-900"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-5">{children}</div>
            </div>
        </div>
    );
}