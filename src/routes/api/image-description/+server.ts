import { fail, json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { VertexAI } from '@google-cloud/vertexai';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) return json({ error: 'リクエストトークンが不正です。' }, { status: 403 });

    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return fail(400, { message: '画像ファイルが見つからないか、形式が不正です。' });
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return fail(500, { message: 'サーバー設定エラー' });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const vertex_ai = new VertexAI({
        project: credentials.project_id,
        location: credentials.location,
        googleAuthOptions: {
            credentials,
        },
    });

    const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
    });

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const requestPayload = {
        contents: [
            {
                role: 'user',
                parts: [
                    { text: 'この画像について説明してください。【条件】正確さを重視して、わかりやすく丁寧に説明する。回答は日本語で生成する。文脈に沿って適切に改行を入れる。テーマまたは内容が大きく変わるところには明示的な区切りを付ける。回答内容は生成文章のみに限定する。' },
                    {
                        inlineData: {
                            mimeType: image.type,
                            data: imageBase64,
                        },
                    },
                ],
            },
        ],
    }

    const result = await generativeModel.generateContent(requestPayload)

    if (!result.response.candidates) {
        console.error('生成に失敗しました。');
        return json({ error: 'サーバー処理エラー' }, { status: 500 });
    }

    const generatedText = result.response.candidates[0].content.parts.map((part) => part.text).join("");

    return json({ generatedText });
};

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
