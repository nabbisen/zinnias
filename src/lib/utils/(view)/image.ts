import type { ImageTextData } from "$lib/types/(view)/common/image";

export function imageTextDataToDataUrl(imageTextData: ImageTextData): string {
    return `data:${imageTextData.mime};base64,${imageTextData.base64}`
}