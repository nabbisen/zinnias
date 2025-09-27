import type { ImageTextData } from "../common/image";

export interface MathGuideQuestionStep {
    question: string,
    hasDiagram: boolean,
    image: ImageTextData,
    imageWholeText: string | null,
}

export interface MathGuideImageText {
    imageWholeText: string
    image: ImageTextData,
    hasDiagram: boolean,
}