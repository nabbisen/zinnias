import { error, json } from '@sveltejs/kit';
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
        return error(400, { message: 'テキストがありません。' });
    }

    if (!targetLanguage) {
        return error(400, { message: 'ほんやくたいしょうげんごのしていがありません。' });
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < text!.length) {
        throw error(403, { message: 'テキストが長すぎます。' })
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return error(500, { message: 'サーバー設定エラー' });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const translate = new Translate({ credentials })

    try {
        const [translation] = await translate.translate(text, targetLanguage);
        return json({
            translation
        })
    } catch (e: unknown) {
        console.error('Translation error:', e);
        return error(500, { message: 'ほんやくにしっぱい' });
    }
}
