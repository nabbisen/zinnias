import type { ImageTextData } from "$lib/types/(view)/common/image";

export function imageTextDataToDataUrl(imageTextData: ImageTextData): string {
    return `data:${imageTextData.mime};base64,${imageTextData.base64}`
}

export async function imageFileToBase64(file: File): Promise<string> {
    return Buffer.from(await file.arrayBuffer()).toString("base64")
}
