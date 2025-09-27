import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { Translate } from '@google-cloud/translate/build/src/v2';
import { AI_QUERY_API_INPUT_TEXT_MAXLENGTH } from '$lib/constants/api/math-guide';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) return json({ error: 'リクエストトークンが不正です。' }, { status: 403 });

    const requestJson = await request.json() as Record<string, any>
    const text = requestJson.text
    const targetLanguage = requestJson.targetLanguage

    if (!text) {
        return json({ error: 'テキストがありません。' }, { status: 400 });
    }
    if (!targetLanguage) {
        return json({ error: 'ほんやくたいしょうげんごのしていがありません。' }, { status: 400 });
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < text!.length) {
        throw json({ error: 'テキストが長すぎます。' }, { status: 403 })
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
}
