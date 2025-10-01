import { error, json } from "@sveltejs/kit"
import { validateTurnstile } from "../common/turnstile"
import { AI_QUERY_API_INPUT_TEXT_MAXLENGTH, DEFAULT_MAX_OUTPUT_TOKENS } from "$lib/constants/api/math-guide"
import type { GenerationConfig, Part, ResponseSchema } from "@google-cloud/vertexai"
import type { GenerateTone } from "$lib/types/common/prompt"
import { IMAGE_DEFAULT_MIME } from "$lib/constants/common/image"
import type { MathGuideQuestionStepStage } from "$lib/types/common/math-guide/question-step"
import { generate } from "."
import { describePrompt } from "./question-step/describe"
import { explainPrompt } from "./question-step/explain"
import { solvePrompt } from "./question-step/solve"
import { USER_CONTEXT_MAXLENGTH } from "$lib/constants/common/math-guide"
import { DESCRIBE_MAX_OUTPUT_TOKENS, DESCRIBE_RESPONSE_SCHEMA } from "$lib/constants/api/math-guide/question-step/describe"
import { EXPLAIN_MAX_OUTPUT_TOKENS, EXPLAIN_RESPONSE_SCHEMA } from "$lib/constants/api/math-guide/question-step/explain"
import { SOLVE_MAX_OUTPUT_TOKENS, SOLVE_RESPONSE_SCHEMA } from "$lib/constants/api/math-guide/question-step/solve"
import { GENERATION_CONFIG_TEMPERATURE, PROMPT_START } from "$lib/constants/api/math-guide/question-step"

export async function questionStep(platformEnv: Env | undefined, requestHeaders: Headers, requestJson: Record<string, unknown>): Promise<Response> {
    if (!await validateTurnstile(platformEnv?.CLOUDFLARE_TURNSTILE_SECRET || "", requestHeaders)) {
        throw error(403, { message: 'リクエストトークンが不正です。' })
    }

    const question = requestJson.question?.toString().trim()
    const wholeText = requestJson.wholeText?.toString().trim()
    const imageBase64 = requestJson.imageBase64?.toString()
    const imageMime = requestJson.imageMime?.toString()
    const userContext = requestJson.userContext?.toString()

    const stepStage = requestJson.stepStage as MathGuideQuestionStepStage
    const generateTone = requestJson.generateTone as GenerateTone

    if (!question) {
        throw error(403, { message: '問題文がありません。' })
    }

    if (AI_QUERY_API_INPUT_TEXT_MAXLENGTH < question!.length) {
        throw error(403, { message: '問題文が長すぎます。' })
    }

    if (userContext && USER_CONTEXT_MAXLENGTH < userContext.length) {
        throw error(403, { message: '入力が長すぎます。' })
    }

    const prompt: Part[] = []

    let responseSchema: ResponseSchema
    let maxOutputTokens: number
    switch (stepStage) {
        case "describe": {
            prompt.push(...describePrompt(question, generateTone))
            responseSchema = DESCRIBE_RESPONSE_SCHEMA
            maxOutputTokens = DESCRIBE_MAX_OUTPUT_TOKENS
            break
        }
        case "explain": {
            prompt.push(...explainPrompt(question, generateTone))
            responseSchema = EXPLAIN_RESPONSE_SCHEMA
            maxOutputTokens = EXPLAIN_MAX_OUTPUT_TOKENS
            break
        }
        case "solve": {
            prompt.push(...solvePrompt(question, generateTone))
            responseSchema = SOLVE_RESPONSE_SCHEMA
            maxOutputTokens = SOLVE_MAX_OUTPUT_TOKENS
            break
        }
        default: throw json({ error: 'ステージがありません。' }, { status: 403 })
    }

    prompt.push(...premiseFullContext(wholeText, imageBase64, imageMime))

    if (userContext) {
        prompt.push({ text: `【追加情報または補足指示】${userContext}` })
    }

    const generationConfig: GenerationConfig = {
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens: maxOutputTokens ? maxOutputTokens : DEFAULT_MAX_OUTPUT_TOKENS,
        temperature: GENERATION_CONFIG_TEMPERATURE,
        candidateCount: 1,
    }

    const candidate = await generate(platformEnv, prompt, generationConfig, maxOutputTokens)

    let generationText = candidate.content.parts.map((x) => x.text).join('')
    if (!generationText.endsWith('"\n}')) generationText += '"\n}'
    if (!generationText.endsWith('}')) generationText += '}'

    console.log(generationText)
    try {
        const generation = JSON.parse(generationText)
        return json({ generation })
    } catch (e: unknown) {
        return error(500, 'せいせいないようがふせいでした')
    }
}

function premiseFullContext(wholeText: string | undefined, imageBase64: string | undefined, imageMime: string | undefined): Part[] {
    const ret: Part[] = [{ text: PROMPT_START }]

    if (!wholeText && !imageBase64) return ret

    ret.push(
        { text: '【補足: 全体像の提示】問題文全体は以下の内容である。回答生成時の参考情報にすること。' },
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
        { text: '【補足: 回答内容】今回のタスク内容を回答の対象とする。' },
        { text: '【補足: 回答内容の補足: 例外】問題文を構成する小問群の間の関連性が高く、先頭から順番に解くように誘導されている場合がある。この場合は今回のタスクより前の小問群の答えを持った状態で始める (それらの答えを得る過程は出力に含めない)。 特に図形問題でこの傾向が強い。' },
    )

    return ret
}