import { DESCRIBE_MAX_OUTPUT_TOKENS } from "$lib/constants/api/math-guide/question-step/describe"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseTokenMaxNumberPrompt } from "$lib/utils/api/math-guide/question-step"
import { type Part } from "@google-cloud/vertexai"

export function describePrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: '【タスク】 問題文の題意を説明してください。問題設定 (条件あるいは前提) と、問われていることについて、解説してください。' },
        { text: `【問題文】${question}` },
        { text: '【方針】タスクの問題文に沿って説明する。そこに専門用語があれば端的に用語解説する。原文の読点箇所等では適宜、文を区切って、なるべく短文の連なりになるように構成する。' },
        { text: `【制限】問題の解答は書かない。 ${responseTokenMaxNumberPrompt(DESCRIBE_MAX_OUTPUT_TOKENS)} 回答にあなた自身のメッセージは書かない。` },
        generateTonePrompt(generateTone),
    ]
    return prompt
}