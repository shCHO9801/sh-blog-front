export async function resizeProfileImage(file: File): Promise<File> {
    const img = await loadImage(file);

    // 중앙 정사각형 크롭
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;

    const targetSize = 512;

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // ✅ 원형은 UI에서만 처리(rounded-full). 업로드는 정사각으로 충분.
    ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
    return new File([blob], replaceExt(file.name, "jpg"), { type: "image/jpeg" });
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Blob failed"))),
            type,
            quality
        );
    });
}

function replaceExt(name: string, ext: string) {
    return name.replace(/\.[^.]+$/, "") + "." + ext;
}