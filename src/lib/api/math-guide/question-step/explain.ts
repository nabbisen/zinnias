import { MATH_PROMPT_RESPONSE_FORMAT, MATH_PROMPT_START } from "$lib/constants/api/math-guide"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseMaxlengthPrompt } from "$lib/utils/api/math-guide/question-step"
import type { Part } from "@google-cloud/vertexai"

const RESPONSE_MAXLENGTH = 800

export function explainPrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: MATH_PROMPT_START },
        { text: '【タスク】 問題文の解き方を説明してください。着目するべきポイントがどこであり、どのように解き進めていくべきなのかという方向性を示してください。' },
        { text: `【問題文】${question}` },
        { text: `${MATH_PROMPT_RESPONSE_FORMAT} ${responseMaxlengthPrompt(question, RESPONSE_MAXLENGTH)}` },
        { text: '【回答条件: 内容】最後の答えは書かず、相手に解く余地を残す。論理展開は、初学者がわかるように、易しいものにする。問題の条件設定や前提事項の再確認は、特別必要が無い限り、書かない。冒頭はタスクへの回答から始める (挨拶は書かない)。' },
        { text: '【補足: 相手へのフォロー】初学者にとって理解が難しいところや、要素が複雑に絡み合うところには、適宜、理解の助けになる観点や例えを入れる。' },
        generateTonePrompt(generateTone),
    ]
    return prompt
}