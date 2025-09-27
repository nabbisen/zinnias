import type { ImageTextData } from "$lib/types/(view)/common/image";

export function imageTextDataToDataUrl(imageTextData: ImageTextData): string {
    return `data:${imageTextData.mime};base64,${imageTextData.base64}`
}

// export function imageTextDataToBlob(imageTextData: ImageTextData): Blob {
//     const bstr = atob(imageTextData.base64)
//     let n = bstr.length
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new Blob([u8arr], { type: imageTextData.mime });
// }
