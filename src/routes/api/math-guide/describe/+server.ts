
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
        { text: '次の 2 つを行ってください。' },
        { text: '【依頼タスク 1】 問題文の題意を説明してください。どのような問題条件あるいは前提で、問われているものが何かを解説してください。数学用語は初歩的なものを含めて適宜解説してください。回答のタイトルは「題意 (だいい)」としてください。' },
        { text: '【依頼タスク 2】 問題文の解き方を説明してください。着目するべきポイントがどこであり、どのように解き進めていくべきなのかという方向性を示してください。論理展開は、初学者がわかるように、易しいものにしてください。回答のタイトルは「解き方 (ときかた)」としてください。' },
        { text: '【タスク条件: 内容】最後の答えは書かず、相手に解く余地を残す。原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。' },
        { text: '【タスク条件: 解答書式】Markdown 形式の文字列で回答する。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。' },
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
