import type { ImageTextData } from "../common/image";

export interface MathGuideQuestion {
    question: string | null,
    hasDiagram: boolean,
    image: ImageTextData,
    imageWholeText: string,
}