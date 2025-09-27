import type { MathGuideQuestionStep } from "$lib/types/(view)/math-guide/question-step"
import type { MathGuideQuestionStepStage } from "$lib/types/common/math-guide/question-step"
import { postFormData } from "../common/api"

export async function generateQuestionStepText(stepStage: MathGuideQuestionStepStage, questionStep: MathGuideQuestionStep): Promise<string> {
    const formData = new FormData()

    formData.append('question', questionStep.question)
    if (questionStep.imageWholeText) {
        formData.append('wholeText', questionStep.imageWholeText)
    }
    if (questionStep.hasDiagram) {
        formData.append('imageBase64', questionStep.image.base64)
        formData.append('imageMime', questionStep.image.mime)
    }

    formData.append('stepStage', stepStage)

    const responseJson = await postFormData('/api/math-guide/question-step', formData)
    const generatedText = responseJson.generatedText as unknown as string
    return generatedText
}
