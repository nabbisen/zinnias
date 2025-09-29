import { MATH_PROMPT_RESPONSE_FORMAT, MATH_PROMPT_START, SOLVE_RESPONSE_TOKEN_MAX_NUMBER } from "$lib/constants/api/math-guide"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseTokenMaxNumberPrompt } from "$lib/utils/api/math-guide/question-step"
import type { Part } from "@google-cloud/vertexai"

export function solvePrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: '【タスク】次の問題に解答してください。' },
        { text: `【問題文】${question}` },
        { text: `【回答内容】解答を論理展開を示しながら書く。論理展開は、初学者がわかる、易しいものにする。解法は初学者向きのものにして、高度な公式や複雑な定理は使わない。定理を使う場合は、該当する条件や紐づく対象を正確に書く (例えば三角形の相似条件を使う時は「２組の辺の比とその間の角がそれぞれ等しいから」のような条件を明記する)。` },
        { text: '【回答内容に関する補足: 解法の選択】初学者向けの標準的な解法が複数ある場合、最も人気の高いものを選ぶ。 回答文字数に余裕がある場合に限って、もしも他に人気が近くてかつ標準的な解法があれば、それに関するヒントを添えても良い。' },
        { text: `【回答書式】${MATH_PROMPT_RESPONSE_FORMAT}` },
        { text: `【回答条件】解答の最終形と関わりが無いものは、回答に書かない (例えば、あなたの試行錯誤の途中経過など)。 ${responseTokenMaxNumberPrompt(SOLVE_RESPONSE_TOKEN_MAX_NUMBER)} 回答にあなた自身のメッセージは書かない。` },
        generateTonePrompt(generateTone),
    ]
    return prompt
}
