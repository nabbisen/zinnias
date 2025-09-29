import type { MathGuideQuestionStep } from "$lib/types/(view)/math-guide/question-step"
import type { MathGuideQuestionStepStage } from "$lib/types/common/math-guide/question-step"
import { postJson } from "$lib/(view)/common/api"

export async function generateQuestionStepText(stepStage: MathGuideQuestionStepStage, questionStep: MathGuideQuestionStep): Promise<string> {
    const requestJson = {
        question: questionStep.question,
        stepStage: stepStage,
    } as Record<string, any>
    if (questionStep.imageWholeText) {
        requestJson.wholeText = questionStep.imageWholeText
    }
    if (questionStep.hasDiagram) {
        requestJson.imageBase64 = questionStep.image.base64
        requestJson.imageMime = questionStep.image.mime
    }

    const responseJson = await postJson('/api/math-guide/question-step', requestJson)
    const generatedText = responseJson.generatedText as unknown as string
    return generatedText
}
