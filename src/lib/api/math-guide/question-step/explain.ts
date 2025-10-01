import { EXPLAIN_MAX_OUTPUT_TOKENS } from "$lib/constants/api/math-guide/question-step/explain"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseTokenMaxNumberPrompt } from "$lib/utils/api/math-guide/question-step"
import { type Part } from "@google-cloud/vertexai"

export function explainPrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: '【タスク】 問題文の解き方を説明してください。まず解答の土台となる戦略・着眼点を 3 つ以内に絞ってそれぞれ簡潔に述べなさい。次にマクロな観点からの解決までの道のりを簡潔に述べなさい。' },
        { text: `【問題文】${question}` },
        { text: '【回答条件】最後の答えは書かない (相手に解く余地を残す)。問題文から与えられた情報と目的の再確認は書かない。' },
        { text: `【制限】${responseTokenMaxNumberPrompt(EXPLAIN_MAX_OUTPUT_TOKENS)}` },
        generateTonePrompt(generateTone),
    ]
    return prompt
}