import { EXPLAIN_MAX_OUTPUT_TOKENS, MATH_PROMPT_RESPONSE_FORMAT } from "$lib/constants/api/math-guide"
import type { GenerateTone } from "$lib/types/common/prompt"
import { generateTonePrompt } from "$lib/utils/api/common/generate"
import { responseTokenMaxNumberPrompt } from "$lib/utils/api/math-guide/question-step"
import type { Part } from "@google-cloud/vertexai"



export function explainPrompt(question: string, generateTone: GenerateTone): Part[] {
    const prompt: Part[] = [
        { text: '【タスク】 問題文の解き方を説明してください。着目するべきポイントがどこであり、どのように解き進めていくべきなのかという方向性を、具体的な内容に落とし込んで示してください。' },
        { text: `【問題文】${question}` },
        { text: `【回答書式】${MATH_PROMPT_RESPONSE_FORMAT} ${responseTokenMaxNumberPrompt(EXPLAIN_MAX_OUTPUT_TOKENS)}` },
        { text: '【回答内容】最後の答えは書かず、相手に解く余地を残す。論理展開は、初学者がわかるように、易しいものにする。 回答にあなた自身のメッセージは書かない。' },
        { text: '【回答内容に関する補足: 内容が難しい部分への気配り】もしも初学者にとって理解が難しいところや、あるいは内容が複雑なところがあれば、そこには適宜、理解の助けになる観点や例えを入れても良い。' },
        generateTonePrompt(generateTone),
    ]
    return prompt
}