import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateTurnstile } from '$lib/utils/turnstile';
import { Translate } from '@google-cloud/translate/build/src/v2';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(request.headers)) return json({ error: 'リクエストトークンが不正です。' }, { status: 403 });

    const requestJson = await request.json() as Record<string, any>
    const text = requestJson.text
    const targetLanguage = requestJson.targetLanguage

    if (!text) {
        return json({ error: 'テキストが見つかりません。' }, { status: 400 });
    }
    if (!targetLanguage) {
        return json({ error: 'ほんやくたいしょうが見つかりません。' }, { status: 400 });
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const translate = new Translate({ credentials })

    try {
        const [translation] = await translate.translate(text, targetLanguage);
        return json({
            translation
        })
    } catch (error) {
        console.error('Translation error:', error);
        return json({ error: 'ほんやくにしっぱい' }, { status: 500 });
    }
};

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
