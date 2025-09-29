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

export async function questionStep(platformEnv: Env | undefined, requestHeaders: Headers, requestJson: Record<string, unknown>) {
    if (!await validateTurnstile(platformEnv?.CLOUDFLARE_TURNSTILE_SECRET || "", requestHeaders)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const question = requestJson.question?.toString().trim()
    const wholeText = requestJson.wholeText?.toString().trim()
    const imageBase64 = requestJson.imageBase64?.toString()
    const imageMime = requestJson.imageMime?.toString()

    const stepStage = requestJson.stepStage as MathGuideQuestionStepStage
    const generateTone = requestJson.generateTone as GenerateTone

    if (!question) {
        throw json({ error: '問題文がありません。' }, { status: 403 })
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < question!.length) {
        throw json({ error: '問題文が長すぎます。' }, { status: 403 })
    }

    const prompt: Part[] = premiseFullContext(wholeText, imageBase64, imageMime)

    switch (stepStage) {
        case "describe": prompt.push(...describePrompt(question, generateTone)); break;
        case "explain": prompt.push(...explainPrompt(question, generateTone)); break;
        case "solve": prompt.push(...solvePrompt(question, generateTone)); break;
        default: throw json({ error: 'ステージがありません。' }, { status: 403 })
    }

    const candidate = await generate(platformEnv, prompt)

    const generatedText = candidate.content.parts.map((part) => part.text).join("")

    return json({ generatedText })
}

function premiseFullContext(wholeText: string | undefined, imageBase64: string | undefined, imageMime: string | undefined): Part[] {
    const ret: Part[] = [{ text: MATH_PROMPT_START }]

    if (!wholeText && !imageBase64) return ret

    ret.push(
        { text: '【前提: 全体像の提示】問題文全体は以下の内容である。回答生成時の参考情報にすること。' },
    )

    if (wholeText) {
        ret.push(
            { text: '問題文全体 =' },
            { text: `${wholeText}` },
        )
    }

    if (imageBase64) {
        ret.push(
            { text: '問題文全体の画像 =' },
            {
                inlineData: {
                    mimeType: imageMime ?? IMAGE_DEFAULT_MIME,
                    data: imageBase64,
                },
            },
            { text: '今回の問題には上に示すようにダイアグラムが含まれている。' }
        )
    }

    ret.push(
        { text: '【前提: 回答内容】今回のタスクで問われていることを回答の中心とする。' },
        { text: '【前提: 回答内容の補足: 例外】問題文を構成する小問群の間の関連性が高く、先頭から順番に解くように誘導されている場合がある。この場合は今回のタスクの前段の問題を事前に解く。 特に図形問題でこの傾向が強い。' },
    )

    return ret
}