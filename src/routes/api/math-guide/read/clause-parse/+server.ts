import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Part } from '@google-cloud/vertexai';
import { process } from '$lib/api/math-guide';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    const prompt: Part[] = [
        { text: ' 次の手順に沿って回答を生成する。回答は JSON データ' },
        { text: '【手順 1】画像からテキストを抽出して、それらを一連の日本語の文章として組み立てる。単語の間の不自然な空白は削除する。原文以外の表現を付加しない。図は適宜無視する。' },
        { text: '【手順 2】依頼タスク結果 1 の結果テキストを、日本語の文節単位に分解する。' },
        { text: '【手順 3】文節ごとに、以下の 2 つを生成する:' },
        { text: '【手順 3-1】句中の漢字をカタカナ読みに変えた文字列。カタカナ読みの両端に半角スペースを添える (JSON の key = kana)' },
        { text: '【手順 3-2】句の内容を端的に非常に短く説明した文字列。この説明は易しい表現にする (JSON の key = desc)' },
        { text: '【手順 3 の補足: データ構造】key を clauses として value に array をセットする。その array の中身は key が txt である原文文字列と 手順 3. の結果がセットされたオブジェクトのリストとする。手順 3. の結果の形式は `{kana:"...",desc:"..."}` とする。' },
        { text: '【回答の具体例】 {clauses:[{txt:"ここは",kana:"ここは、",desc:"(説明)"}},{txt:"快適だ",kana:"カイテキ だ",desc:"(説明)"}]}' },
    ]

    const candidate = await process(platform?.env as Env, request.headers, prompt, image)

    let jsonStr = candidate.content.parts.map((part) => part.text).join("").replace(/^```json/, "").replace(/```$/, "")

    return json({ result: JSON.parse(jsonStr) })
}

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
