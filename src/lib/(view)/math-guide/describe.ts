import type { MathGuideQuestionStep } from "$lib/types/(view)/math-guide/math-step"
import { postFormData } from "../common/api"

export async function describe(questionStep: MathGuideQuestionStep): Promise<string> {
    const formData = new FormData()
    formData.append('question', questionStep.question)
    if (questionStep.imageWholeText) {
        formData.append('wholeText', questionStep.imageWholeText)
    }
    if (questionStep.hasDiagram) {
        formData.append('imageBase64', questionStep.image.base64)
        formData.append('imageMime', questionStep.image.mime)
    }

    const responseJson = await postFormData('/api/math-guide/question-step/describe', formData)
    const generatedText = responseJson.generatedText as unknown as string
    return generatedText
}
