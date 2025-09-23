import { loading } from "$lib/stores/loading-effect.svelte"

export async function generateEasierExpression(text: string, proficiencyLevel: number): Promise<string> {
    loading.start()

    const response: Response | void = await fetch('/api/easier-expression', {
        method: 'POST',
        headers: {
            "CF-TURNSTILE-RESPONSE": (document.querySelector("input[name=\"cf-turnstile-response\"]") as unknown as HTMLInputElement).value
        },
        body: JSON.stringify({
            text,
            proficiencyLevel,
        }),
    }).catch((error) => {
        console.error('クエリ中にエラーが発生しました:', error)
        alert('クエリに失敗しました。')
    }).finally(() => {
        loading.stop()
    })

    if (!response) return ""

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseJson: Record<string, any> = await response.json()

    return responseJson.generatedText as string
}