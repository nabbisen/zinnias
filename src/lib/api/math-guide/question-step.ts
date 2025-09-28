import { json } from "@sveltejs/kit"
import { validateTurnstile } from "../common/turnstile"
import { AI_QUERY_API_INPUT_TEXT_MAXLENGTH, MATH_PROMPT_START } from "$lib/constants/api/math-guide"
import type { Part } from "@google-cloud/vertexai"
import type { GenerateTone } from "$lib/types/common/prompt"
import { IMAGE_DEFAULT_MIME } from "$lib/constants/common/image"
import type { MathGuideQuestionStepStage } from "$lib/types/common/math-guide/question-step"
import { generate } from "."
import { describePrompt } from "./question-step/describe"
import { explainPrompt } from "./question-step/explain"
import { solvePrompt } from "./question-step/solve"

export async function questionStep(platformEnv: Env | undefined, requestHeaders: Headers, formData: FormData) {
    if (!await validateTurnstile(platformEnv?.CLOUDFLARE_TURNSTILE_SECRET || "", requestHeaders)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const question = formData.get("question")?.toString().trim()
    const wholeText = formData.get("wholeText")?.toString().trim()
    const imageBase64 = formData.get("imageBase64")?.toString()
    const imageMime = formData.get("imageMime")?.toString()

    const stepStage = formData.get("stepStage") as MathGuideQuestionStepStage
    const generateTone = formData.get("generateTone") as GenerateTone

    if (!question) {
        throw json({ error: '問題文がありません。' }, { status: 403 })
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < question!.length) {
        throw json({ error: '問題文が長すぎます。' }, { status: 403 })
    }

    const prompt: Part[] = []
    switch (stepStage) {
        case "describe": prompt.push(...describePrompt(question, generateTone)); break;
        case "explain": prompt.push(...explainPrompt(question, generateTone)); break;
        case "solve": prompt.push(...solvePrompt(question, generateTone)); break;
        default: throw json({ error: 'ステージがありません。' }, { status: 403 })
    }

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
                        mimeType: imageMime ?? IMAGE_DEFAULT_MIME,
                        data: imageBase64,
                    },
                },
            )
        }

        prompt.push(...addition)
    }

    const candidate = await generate(platformEnv, prompt)

    const generatedText = candidate.content.parts.map((part) => part.text).join("")

    return json({ generatedText })
}


