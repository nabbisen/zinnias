export function responseTokenMaxNumberPrompt(number: number): string {
    return `回答トークン数の制限 = ${number} 以下。末尾が途切れて終わるのは NG。適宜内容を要約する。`
}
