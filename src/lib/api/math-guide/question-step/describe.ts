import { MATH_PROMPT_RESPONSE_FORMAT, MATH_PROMPT_START } from "$lib/constants/api/math-guide"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseMaxlengthPrompt } from "$lib/utils/api/math-guide/question-step"
import type { Part } from "@google-cloud/vertexai"

const RESPONSE_MAXLENGTH = 400

export function describePrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: MATH_PROMPT_START },
        { text: '【タスク】 問題文の題意を説明してください。問題条件あるいは前提が何で、問われているものが何なのかを、解説してください。数学用語は、初歩的なものを含めて、適宜解説してください。' },
        { text: `【問題文】${question}` },
        { text: `${MATH_PROMPT_RESPONSE_FORMAT} ${responseMaxlengthPrompt(question, RESPONSE_MAXLENGTH)}` },
        { text: '【回答条件: 内容】原文に沿って、わかりやすく丁寧に説明する。原文の読点箇所等では適宜、文を区切って、なるべく短文の連なりになるように構成する。問題の解答は書かない。回答にあなた自身のメッセージは書かない。' },
        generateTonePrompt(generateTone),
    ]
    return prompt
}