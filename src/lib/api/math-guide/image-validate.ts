import type { GenerateContentCandidate, Part } from "@google-cloud/vertexai"
import { imageProcess } from "."

export async function mathGuideImageValidate(platformEnv: Env | undefined, base64Image: string): Promise<boolean> {
    const prompt: Part[] = [
        { text: '画像が学習教材の数学の問題かどうかを分析して、それが true である場合、回答を 1 とする。それ以外の場合、回答を 0 とする。' },
        { text: '回答は単一の数値で生成する。それ以外のものは一切出力しない。' },
    ]

    let candidate: GenerateContentCandidate
    try {
        candidate = await imageProcess(platformEnv, prompt, base64Image)
    } catch (error: any) {
        throw error
    }

    const validated = candidate.content.parts[0].text === "1" ? true : false
    return validated
}
