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
        { text: '【目的】 問題文の日本語を、非日本語話者向けに解説します。すなわち問題文を、ひらがなを交えながら、平易な表現の日本語で解説します。' },
        { text: '【依頼タスク】 次の手順に沿って回答を生成してください。' },
        { text: '【手順 1】 画像からテキストを抽出して問題文を日本語の文章として組み立ててください。単語の間の不自然な空白は削除してください。原文以外の表現を付加してはいけません。図は適宜無視してください。' },
        { text: '【手順 2】 依頼タスク結果 1 の結果テキストを、文脈のブロックあるいは意味のブロックに区切ってください。これを解説の単位にします。' },
        { text: '【手順 3】 区切ったブロックごとに、括弧書きでひらがな読みを添えてください。' },
        { text: '【手順 4】 区切ったブロックごとに、内容を平易な日本語で説明してください。 条件 = ひらがな中心の既述にする。説明に使って良い表現と漢字は、日本語能力試験の N5 まで。 (すなわち N1 から N4 の内容は使用不可)' },
        { text: '【タスク条件 (内容)】 原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。日本語の意味を解説する。題意に少しだけ触れることは許容するが、問題の解法や解答には決して触れない。' },
        { text: '【タスク条件 (書式)】 回答は Markdown 形式で生成する。' },
        { text: '【タスク条件 (原文を引用する箇所)】 引用部分は "> " 始まりを付加する。' },
        { text: '【回答条件】回答は日本語で生成する。回答内容は生成文章のみに限定して、あなた自身のメッセージは含めない。' },
    ]

    const candidate = await process(platform?.env as Env, request.headers, prompt, image)

    const generatedText = candidate.content.parts.map((part) => part.text).join("")

    return json({ generatedText })
}

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
