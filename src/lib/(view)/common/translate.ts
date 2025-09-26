import { loading } from "$lib/stores/loading-effect.svelte"

export async function translate(text: string, targetLanguage: string): Promise<string> {
    loading.start()

    const response: Response | void = await fetch('/api/translate', {
        method: 'POST',
        headers: {
            "CF-TURNSTILE-RESPONSE": (document.querySelector("input[name=\"cf-turnstile-response\"]") as unknown as HTMLInputElement).value
        },
        body: JSON.stringify({
            text,
            targetLanguage,
        }),
    }).catch((error) => {
        throw new Error('クエリ中にエラーが発生しました:', error)
    }).finally(() => {
        turnstile.reset()
        loading.stop()
    })

    if (!response) {
        throw new Error('クエリ応答が空でした')
    }

    if (!response.ok) {
        throw new Error(`クエリに失敗しました: ${response.body} (status = ${response.status})`)
    }

    const responseJson: Record<string, any> = await response.json()

    return responseJson.translation as string
}