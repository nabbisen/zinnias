const RESPONSE_LENGTH_SCALE_ON_QUESTION = 10

export function responseMaxlengthPrompt(question: string, maxlength: number): string {
    return `回答文字数は ${responseMaxlength(question, maxlength)} 以下`
}

function responseMaxlength(question: string, maxlength: number): number {
    return Math.min(question.length * RESPONSE_LENGTH_SCALE_ON_QUESTION, maxlength)
}