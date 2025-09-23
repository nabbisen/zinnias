import { loading } from "$lib/stores/loading-effect.svelte"

export async function generateImageDescription(file: File): Promise<string> {
    loading.start()

    const formData = new FormData()
    formData.append('image', file, file.name)

    const response: Response | void = await fetch('/api/image-description', {
        method: 'POST',
        headers: {
            "CF-TURNSTILE-RESPONSE": (document.querySelector("input[name=\"cf-turnstile-response\"]") as unknown as HTMLInputElement).value
        },
        body: formData,
    }).catch((error) => {
        console.error('アップロード中にエラーが発生しました:', error)
        alert('アップロードに失敗しました。')
    }).finally(() => {
        turnstile.reset()
        loading.stop()
    })

    if (!response) return ""

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseJson: Record<string, any> = await response.json()
    return responseJson.generatedText as string
}