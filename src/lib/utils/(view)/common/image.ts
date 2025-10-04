import { IMAGE_DEFAULT_MIME, IMAGE_QUALITY_FACTOR } from "$lib/constants/common/image";

export async function fileToBase64(file: File): Promise<string> {
    const dataUrl = await fileToDataUrl(file)
    return dataUrl.split(",")[1]
}

async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as string)
        }

        reader.onerror = (error) => {
            reject(error)
        }

        reader.readAsDataURL(file)
    })
}

export async function dataUrlToFile(dataUrl: string, fileName: string) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
}

export async function imageOptimize(
    image: File,
    resizeToWidth: number,
    resizeToHeight: number,
    brightness?: number,
    contrast?: number,
    grayscale?: boolean,
    quality?: number,
): Promise<Blob> {
    // create image
    const imageBitmap = await createImageBitmap(image);

    const originalWidth = imageBitmap.width;
    const originalHeight = imageBitmap.height;

    // aspect ratio keeping
    const maxTargetDimension = Math.max(resizeToWidth, resizeToHeight);

    let newWidth: number;
    let newHeight: number;

    const ratio = originalWidth / originalHeight;

    if (originalWidth > originalHeight) {
        newWidth = maxTargetDimension;
        newHeight = newWidth / ratio;
    } else {
        newHeight = maxTargetDimension;
        newWidth = newHeight * ratio;
    }

    // canvas api
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(newWidth);
    canvas.height = Math.floor(newHeight);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('2D context is not available.');
    }

    // filter
    if (brightness || contrast || grayscale) {
        let filters = []
        if (brightness) filters.push(`brightness(${brightness}%)`)
        if (contrast) filters.push(`contrast(${contrast}%)`)
        if (grayscale) filters.push(`grayscale(100%)`)
        ctx.filter = filters.join(' ')
    }

    // resize
    ctx.drawImage(
        imageBitmap,
        0, 0, originalWidth, originalHeight, // 元画像の全体を使用
        0, 0, newWidth, newHeight           // 計算した新しいサイズにリサイズして描画
    );

    // free memory
    imageBitmap.close();

    // result as blob
    const q = quality ?? IMAGE_QUALITY_FACTOR
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to create Blob from canvas.'));
            }
        }, IMAGE_DEFAULT_MIME, q);
    });
}