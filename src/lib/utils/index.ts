import Compressor from "compressorjs"

export function compressImage(file: File, successCallback: (file: File) => void, errorCallback: (err: Error) => void | null) {
    new Compressor(file, {
        quality: 0.7,
        maxWidth: 1280,
        maxHeight: 1280,
        mimeType: 'image/jpeg',

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
