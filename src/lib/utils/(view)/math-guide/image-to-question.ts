import { IMAGE_BRIGHTNESS_FACTOR, IMAGE_CONTRAST_FACTOR, IMAGE_DEFAULT_MIME, IMAGE_MAX_DIMENSION, IMAGE_VERTEX_DIMENSION_UNIT } from "$lib/constants/common/image"
import type { QuestionImage } from "$lib/types/(view)/math-guide/image-select"
import { fileToBase64, imageOptimize } from "../common/image"

export async function fileToQuestionImage(file: File): Promise<QuestionImage> {
    const imageBuffer = await imageOptimize(
        file,
        IMAGE_MAX_DIMENSION,
        IMAGE_MAX_DIMENSION,
        IMAGE_BRIGHTNESS_FACTOR,
        IMAGE_CONTRAST_FACTOR,
        true
    )
    const imageBlob = new Blob([imageBuffer as BlobPart], { type: IMAGE_DEFAULT_MIME })
    const image = new File([imageBlob], 'image.dat')
    const imageBase64 = await fileToBase64(image)

    const downscaledImageBuffer = await imageOptimize(
        image,
        IMAGE_VERTEX_DIMENSION_UNIT,
        IMAGE_VERTEX_DIMENSION_UNIT
    )
    const downscaledImageBlob = new Blob([downscaledImageBuffer as BlobPart], {
        type: IMAGE_DEFAULT_MIME,
    })
    const downscaledImage = new File([downscaledImageBlob], 'downscaledImage.dat')
    const downscaledImageBase64 = await fileToBase64(downscaledImage)

    return {
        original: image,
        originalBase64: imageBase64,
        downscaled: downscaledImage,
        downscaledBase64: downscaledImageBase64,
    } as QuestionImage
}