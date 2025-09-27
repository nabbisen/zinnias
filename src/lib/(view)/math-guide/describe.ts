import type { MathGuideQuestion } from "$lib/types/(view)/math-guide/question"
import { postFormData } from "../common/api"

export async function describe(question: MathGuideQuestion): Promise<string> {
    const formData = new FormData()
    formData.append('question', question.question)
    if (question.imageWholeText) {
        formData.append('wholeText', question.imageWholeText)
    }
    if (question.hasDiagram) {
        formData.append('imageBase64', question.image.base64)
        formData.append('imageMime', question.image.mime)
    }

    const responseJson = await postFormData('/api/math-guide/describe', formData)
    const generatedText = responseJson.generatedText as unknown as string
    return generatedText
}
