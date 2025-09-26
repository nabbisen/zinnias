import sharp from "sharp";

const BRIGHNESS_FACTOR = 1.2
const CONTRAST_FACTOR = 1.1

export async function imageSharpen(file: File): Promise<Buffer<ArrayBufferLike>> {
    return await sharp(await file.arrayBuffer())
        .modulate({ brightness: BRIGHNESS_FACTOR })
        .linear(CONTRAST_FACTOR, -(128 * CONTRAST_FACTOR) + 128)
        .webp({ quality: 90 })
        .toBuffer()
}