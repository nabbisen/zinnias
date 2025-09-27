import { Jimp } from "jimp";

export const DEFAULT_IMAGE_MIME = "image/png"

const MAX_DIMENSION = 1024
const BRIGHNESS_FACTOR = 0.2
const CONTRAST_FACTOR = 0.1

export async function imageOptimize(file: File): Promise<Buffer<ArrayBufferLike>> {
    return (await Jimp.read(await file.arrayBuffer()))
        .brightness(BRIGHNESS_FACTOR)
        .contrast(CONTRAST_FACTOR)
        .scaleToFit({ w: MAX_DIMENSION, h: MAX_DIMENSION })
        .getBuffer(DEFAULT_IMAGE_MIME)
}
