import type { ImageTextData } from "../common/image";

export interface MathGuideQuestion {
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