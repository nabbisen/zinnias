import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessToken } from '$lib/auth/googleapis';

const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate`;

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const at = await accessToken(credentials.private_key, credentials.client_email)

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const requestBody = {
        requests: [
            {
                image: {
                    content: imageBase64
                },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            }
        ]
    };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${at}`,
        },
        body: JSON.stringify(requestBody)
    }).catch((error) => {
        console.error('サーバー処理中にエラーが発生しました:', error);
        return json({ error: 'サーバーで予期せぬエラーが発生しました。' }, { status: 500 });
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('API エラー:', result);
        return json({ error: 'API 呼出し失敗' }, { status: response.status });
    }

    // todo: type defs for google vision ai api
    const detectedText = (result as any).responses[0].fullTextAnnotation?.pages?.map((page: any) => page.blocks?.map((block: any) => {
        return block.paragraphs?.map((paragraph: any) => {
            return paragraph.words?.map((word: any) => {
                return word.symbols?.map((symbol: any) => symbol.text).join("")
            }).join("")
        }).join(" ")
    })).join(" ")

    return json({ detectedText });
};

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
