export async function generateEasierExpression(text: string, proficiencyLevel: number) {
    const response: Response | void = await fetch('/api/easier-expression', {
        method: 'POST',
        body: JSON.stringify({
            text,
            proficiencyLevel,
        }),
    }).catch((error) => {
        console.error('クエリ中にエラーが発生しました:', error)
        alert('クエリに失敗しました。')
    })
    if (!response) return

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseJson: Record<string, any> = await response.json()

    return responseJson.generatedText
}