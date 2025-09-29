export function responseTokenMaxNumberPrompt(number: number): string {
    return `回答トークン数の制限 = ${number} 以下に収める (必要に応じて内容を要約する)。回答途中で途切れて終わらないようにする。`
}
