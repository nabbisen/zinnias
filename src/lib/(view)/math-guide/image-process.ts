import { loading } from "$lib/stores/loading-effect.svelte"
import type { ClauseItem } from "$lib/types/(view)/math-guide/clause-parse"
import { postFormData } from "../common/api"

export async function generateMathGuide(file: File, processor: string): Promise<string> {
    loading.start()

    const formData = new FormData()
    formData.append('image', file, file.name)

    const response: Response | void = await fetch(`/api/math-guide/${processor}`, {
        method: 'POST',
        headers: {
            "CF-TURNSTILE-RESPONSE": (document.querySelector("input[name=\"cf-turnstile-response\"]") as unknown as HTMLInputElement).value
        },
        body: formData,
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
    return responseJson.generatedText as string
}


export async function imageValidateAnalyze(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file, file.name)

    const responseJson = await postFormData('/api/math-guide/image-validate-analyze', formData)
    return responseJson.analyzed
}

export async function clauseParse(file: File): Promise<ClauseItem[]> {
    const formData = new FormData()
    formData.append('image', file, file.name)

    const responseJson = await postFormData('/api/math-guide/read/clause-parse', formData)
    return responseJson.result
}