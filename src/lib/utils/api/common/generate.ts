import type { GenerateTone } from "$lib/types/common/prompt"
import type { Part } from "@google-cloud/vertexai"

export function generateTonePrompt(generateTone: GenerateTone): Part {
    const POLITE_TONE_PROMPT = { text: '【回答口調】原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。' }
    switch (generateTone) {
        case "polite": return POLITE_TONE_PROMPT
        case "passionate": return { text: '【回答口調】熱血漢で、雰囲気を盛り上げてひっぱっていく。節度は持つ' }
        case "kind": return { text: '【回答口調】勉強につまずいて傷ついている子供のそばに優しく寄り添う' }
        case "inquisitive": return { text: '【回答口調】学者肌で訥々と。回答字数に余裕がある時は、知的好奇心を刺激する興味深いエピソードを交える' }
        case "casual": return { text: '【回答口調】クラスメートが同じ子どもの目線でさばさばと説明する口調' }
        default: return POLITE_TONE_PROMPT
    }
}
