import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Part } from '@google-cloud/vertexai';
import { generateWithImage } from '$lib/api/math-guide';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { imageFileToBase64 } from '$lib/utils/encode-decode';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    const prompt: Part[] = [
        { text: '【依頼タスク】 問題の解答を、解答までの道筋とともに、示してください。問題が小問に分かれている場合、小問ごとに解説してください。論理展開は、初学者がわかるように、易しいものにしてください。' },
        { text: '【タスク条件: 解法の選択】初学者向けの標準的な解法が複数ある場合、最も人気のあるものを解説し、かつ、他の解法のヒントを添える。 (標準的な解法が単一の場合は、それだけを解説する。)' },
        { text: '【タスク条件: 回答書式】Markdown 形式の文字列で回答する。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。' },
        { text: '【タスク条件: 回答時留意事項】正確さを重視して、わかりやすく丁寧に説明する。' },
        { text: '【回答条件】回答は日本語で生成する。 回答内容は生成文章のみに限定して、あなた自身のメッセージは含めない。' },
    ]

    const candidate = await generateWithImage(platform?.env as Env, prompt, await imageFileToBase64(image))

    const generatedText = candidate.content.parts.map((part) => part.text).join("")

    return json({ generatedText })
}
