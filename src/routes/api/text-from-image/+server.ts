import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import vision from '@google-cloud/vision';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API キーが設定されていません。');
        return json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const client = new vision.ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id,
    });

    const imageBuffer = await image.arrayBuffer();

    const [result] = await client.documentTextDetection(Buffer.from(imageBuffer));

    const detectedText = result.fullTextAnnotation?.pages?.map((page) => page.blocks?.map((block) => {
        return block.paragraphs?.map((paragraph) => {
            return paragraph.words?.map((word) => {
                return word.symbols?.map((symbol) => symbol.text).join("")
            }).join("")
        }).join(" ")
    })).join(" ")

    return json({ detectedText });
};

// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
