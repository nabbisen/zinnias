import type { ImageTextData } from "../common/image";

export interface MathGuideQuestionStep {
    question: string,
    hasDiagram: boolean,
    image: ImageTextData,
    imageWholeText: string | null,
}

export interface MathGuideQuestionInstruction {
    instruction: string,
    imageWholeText: string
    image: ImageTextData,
    hasDiagram: boolean,
}