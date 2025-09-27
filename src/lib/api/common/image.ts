import sharp from "sharp";

export const DEFAULT_IMAGE_MIME = "image/webp"

const MAX_DIMENSION = 1024
const BRIGHNESS_FACTOR = 1.2
const CONTRAST_FACTOR = 1.1

export async function imageOptimize(file: File): Promise<Buffer<ArrayBufferLike>> {
    return await sharp(await file.arrayBuffer())
        .modulate({ brightness: BRIGHNESS_FACTOR })
        .linear(CONTRAST_FACTOR, -(128 * CONTRAST_FACTOR) + 128)
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' })
        .webp({ quality: 90 })
        .toBuffer()
}
