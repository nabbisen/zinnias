import Compressor from "compressorjs"

const DEFAULT_MAX_DIMENSION = 1024

export function compressImage(file: File, successCallback: (file: File) => void, errorCallback: ((err: Error) => void) | null, maxDimension?: number) {
    new Compressor(file, {
        quality: 0.8,
        maxWidth: maxDimension ?? DEFAULT_MAX_DIMENSION,
        maxHeight: maxDimension ?? DEFAULT_MAX_DIMENSION,
        mimeType: 'image/webp',

        success(file: File) {
            successCallback(file)
        },

        error(err) {
            if (errorCallback) {
                errorCallback(err)
            }
        },
    })
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (_err) {
        return false
    }
}
