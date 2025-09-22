import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VertexAI } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/utils/turnstile';

const DEFAULT_PROFICIENCY_LEVEL: number = 3

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(request.headers)) return json({ error: 'リクエストトークンが不正です。' }, { status: 403 });

    const requestJson = await request.json() as Record<string, any>
    const text = requestJson.text

    if (!text) {
        return json({ error: 'テキストが見つかりません。' }, { status: 400 });
    }

    const proficiencyLevel = requestJson.proficiencyLevel ?? DEFAULT_PROFICIENCY_LEVEL

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return json({ error: 'サーバー設定エラー' }, { status: 500 });
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

    const proficiencyCondition = 0 <= proficiencyLevel ? `使える語彙と文法を、日本語能力試験 N${proficiencyLevel} レベルまでのものに限定する。` : "使える語彙と文法を日本語能力試験不合格者に合わせて、かつ全体をひらがなとカタカナ中心で構成する。"
    const prompt = `以下の文章を、非日本語話者が理解しやすい、平易なものにしなさい。条件: ${proficiencyCondition} なるべく短文主義を採用し、かつ、文脈の流れは切らないようには文量のバランス配分をする。主語および目的語があいまいにならないように注意する。回答は生成文章のみに限定する。
【もとの文章】
${text}`;

    const result = await generativeModel.generateContent(prompt)

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
