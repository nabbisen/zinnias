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
            { text: '今回の問題にはダイアグラムが含まれており、参考情報として問題の画像を上に示す。ダイアグラムは、この画像中に示されている。' }
        )
    }

    ret.push(
        { text: '【前提: 注意喚起】回答時、今回のタスクで問われていることに集中する。' },
        { text: '【前提: 注意喚起の補足: 回答に含めないもの】今回のタスク対象以外の内容は、回答には通常含めない。問題文全体の整理もこの「含めない」ものに該当する。例えば今回の対象が小問の 4 がであれば、生成対象は小問の 4 に関するものとする。 ただし今回の問題文と強く関連する箇所は、例外。' },
        { text: '【前提: 注意喚起の補足: 今回タスク対象が問題文全体の一部としての小問である可能性】問題文全体が小問に分かれており、その構成が先頭から順番に解かれることを意図しているケースがある。今回のタスク対象が小問である場合、このケースに該当するかを事前に判定する。判定結果が「該当する」である場合、今回のタスク対象より前の小問はすべて解かれている前提とする (適宜、必要分は事前に解くが、それらの過程は回答に含めない)。' },
    )

    return ret
}