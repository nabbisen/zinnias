import { SOLVE_MAX_OUTPUT_TOKENS } from "$lib/constants/api/math-guide/question-step/solve"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseTokenMaxNumberPrompt } from "$lib/utils/api/math-guide/question-step"
import { type Part } from "@google-cloud/vertexai"

export function solvePrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: '【タスク】次の問題に解答してください。解答に至る導出およびその結果としての答えを出力してください。' },
        { text: `【問題文】${question}` },
        { text: `【導出: 制約】中学校数学の範囲までで解決する。定理を使う場合、該当する条件や紐づく対象を正確に書く (例えば三角形の相似条件を使う時は「２組の辺の比とその間の角がそれぞれ等しいから」のような条件を明記する)。` },
        { text: `【導出: 制限】トークン数を使用可能数に収めよ: ${responseTokenMaxNumberPrompt(SOLVE_MAX_OUTPUT_TOKENS)} そこで計算の途中式は適宜 "..." 等に置き換えて省略する。 あなた自身のメッセージは書かない。` },
        generateTonePrompt(generateTone),
    ]
    return prompt
}
