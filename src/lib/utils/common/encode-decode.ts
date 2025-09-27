export async function imageFileToBase64(image: File): Promise<string> {
    return Buffer.from(await image.arrayBuffer()).toString("base64")
}