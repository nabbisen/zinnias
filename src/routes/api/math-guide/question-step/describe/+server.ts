
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Part } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { generate } from '$lib/api/math-guide';
import { AI_QUERY_API_INPUT_TEXT_MAXLENGTH, MATH_PROMPT_START } from '$lib/constants/api/math-guide';
import { DEFAULT_IMAGE_MIME } from '$lib/api/common/image';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const formData = await request.formData()
    const question = formData.get("question")?.toString().trim()
    const wholeText = formData.get("wholeText")?.toString().trim()
    const imageBase64 = formData.get("imageBase64")?.toString()
    const imageMime = formData.get("imageMime")?.toString()

    if (!question) {
        throw json({ error: '問題文がありません。' }, { status: 403 })
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < question!.length) {
        throw json({ error: '問題文が長すぎます。' }, { status: 403 })
    }

    let prompt: Part[] = [
        { text: MATH_PROMPT_START },
        { text: '【タスク】 問題文の題意を説明してください。問題条件あるいは前提が何で、問われているものが何なのかを、解説してください。数学用語は、初歩的なものを含めて、適宜解説してください。' },
        { text: `【問題文】${question}` },
        { text: '【回答書式】Markdown 形式の文字列。テキスト言語は日本語。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。 回答文字数は 500 以内' },
        { text: '【回答条件: 内容】最後の答えは書かず、相手に解く余地を残す。' },
        // { text: '【回答口調】原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。' },
        // { text: '【回答口調】熱血漢で、雰囲気を盛り上げてひっぱっていく。節度は持つ' },
        // { text: '【回答口調】勉強につまずいて傷ついている子供のそばに優しく寄り添う' },
        // { text: '【回答口調】学者肌で訥々と。回答字数に余裕がある時は、知的好奇心を刺激する興味深いエピソードを交える' },
        { text: '【回答口調】クラスメートが同じ子どもの目線でさばさばと説明する口調' },
    ]

    if (wholeText || imageBase64) {
        const addition: Part[] = [
            { text: '次の内容は補足情報です。回答時の参考にしてください。これらに関する情報を回答に含めることは不要です。' },
        ]
        if (wholeText) {
            addition.push(
                { text: '* 今回の問題は全体の一部である。問題文全体は以下の通り:' },
                { text: `${wholeText}` },
            )
        }
        if (imageBase64) {
            addition.push(
                { text: '* 今回の問題にはダイアグラムが含まれている。問題文全体の画像は以下の通り。この中のダイアグラム部分を参考にする:' },
                {
                    inlineData: {
                        mimeType: imageMime ?? DEFAULT_IMAGE_MIME,
                        data: imageBase64,
                    },
                },
            )
        }

        prompt = [
            ...prompt,
            ...addition
        ]
    }

    const candidate = await generate(platform?.env as Env, prompt)

    const generatedText = candidate.content.parts.map((part) => part.text).join("")

    return json({ generatedText })
}
