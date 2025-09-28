import { MATH_PROMPT_RESPONSE_FORMAT, MATH_PROMPT_START } from "$lib/constants/api/math-guide"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseMaxlengthPrompt } from "$lib/utils/api/math-guide/question-step"
import type { Part } from "@google-cloud/vertexai"

const RESPONSE_MAXLENGTH = 1000

export function solvePrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: MATH_PROMPT_START },
        { text: '【タスク】問題の解答を、解答までの道筋とともに、示してください。論理展開は、初学者がわかるように、易しいものにしてください。' },
        { text: `【問題文】${question}` },
        { text: `${MATH_PROMPT_RESPONSE_FORMAT} ${responseMaxlengthPrompt(question, RESPONSE_MAXLENGTH)}` },
        { text: '【回答条件】回答にあなた自身のメッセージは書かない。' },
        { text: '【補足: 解法の選択】初学者向けの標準的な解法が複数ある場合、最も人気のあるものを解説する。回答文字数に余裕があり、かつ、他に人気の近い標準的な解法がある場合、それに関するヒントを添える。 (標準的な解法が単一の場合は、それだけを解説する。)' },
        generateTonePrompt(generateTone),
    ]
    return prompt
}
