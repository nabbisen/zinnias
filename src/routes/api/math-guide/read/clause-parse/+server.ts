import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Part } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { generate } from '$lib/api/math-guide';
import { AI_QUERY_API_INPUT_TEXT_MAXLENGTH } from '$lib/constants/api/math-guide';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const formData = await request.formData()
    const text = formData.get('text')?.toString().trim()

    if (!text) {
        return json({ error: 'テキストがありません。' }, { status: 400 });
    }
    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < text!.length) {
        throw json({ error: 'テキストが長すぎます。' }, { status: 403 })
    }

    const prompt: Part[] = [
        { text: ' 次の手順に沿って回答を生成する。回答は JSON データ' },
        { text: '【手順 1】下記テキストを、日本語の文節単位に分解する。' },
        { text: `【テキスト】${text}` },
        { text: '【手順 2】文節ごとに、以下の 2 つを生成する:' },
        { text: '【手順 2-1】句中の漢字をカタカナ読みに変えた文字列。カタカナ読みの両端に半角スペースを添える (JSON の key = kana)' },
        { text: '【手順 2-2】句の内容を端的に、かつ、漢字を極力使わない非常に易しい表現で、説明した文字列。この説明では原文をそのままなぞってはならない (JSON の key = desc)' },
        { text: '【手順 2 の補足: データ構造】key を clauses として value に array をセットする。その array の中身は key が txt である原文文字列と 手順 2. の結果がセットされたオブジェクトのリストとする。手順 2. の結果の形式は `{kana:"...",desc:"..."}` とする。' },
        { text: '【回答の例】 {clauses:[{txt:"ここは",kana:"ここは、",desc:"(説明)"}},{txt:"快適だ",kana:"カイテキ だ",desc:"(説明)"}]}' },
    ]

    const candidate = await generate(platform?.env as Env, prompt)

    const jsonStr = candidate.content.parts.map((part) => part.text).join("").replace(/^```json/, "").replace(/```$/, "")
    const result = JSON.parse(jsonStr)

    return json({ result })
}
