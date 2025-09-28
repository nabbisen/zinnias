import { IMAGE_BRIGHNESS_FACTOR, IMAGE_CONTRAST_FACTOR, IMAGE_DEFAULT_MIME, IMAGE_MAX_DIMENSION, IMAGE_VERTEX_DIMENSION_UNIT } from "$lib/constants/common/image";
import * as photon from "@cf-wasm/photon"

export function imageOptimize(file: File): Buffer<ArrayBufferLike> {
    const phtn = photon.PhotonImage.new_from_blob(file as Blob)
    photon.grayscale(phtn)
    photon.adjust_brightness(phtn, IMAGE_BRIGHNESS_FACTOR)
    photon.adjust_contrast(phtn, IMAGE_CONTRAST_FACTOR)
    resizeWithAspectRatioKept(phtn, IMAGE_MAX_DIMENSION)
    return Buffer.from(phtn.get_bytes())
}

export function imageDownscale(file: File): Buffer<ArrayBufferLike> {
    const phtn = photon.PhotonImage.new_from_blob(file as Blob)
    resizeWithAspectRatioKept(phtn, IMAGE_VERTEX_DIMENSION_UNIT)
    return Buffer.from(phtn.get_bytes())
}

function resizeWithAspectRatioKept(phtn: photon.PhotonImage, maxDimension: number): photon.PhotonImage {
    const originalWidth = phtn.get_width()
    const originalHeight = phtn.get_height()

    let width: number
    let height: number

    if (originalWidth < originalHeight) {
        height = maxDimension
        width = height * (originalWidth / originalHeight)
    } else {
        width = maxDimension
        height = width * (originalHeight / originalWidth)
    }

    photon.resize(phtn, width, height, photon.SamplingFilter.Triangle)

    return phtn
}