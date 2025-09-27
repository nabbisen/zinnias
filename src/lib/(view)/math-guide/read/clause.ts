import type { ClauseItem } from "$lib/types/(view)/math-guide/clause-parse"
import { postFormData } from "$lib/(view)/common/api"

export async function clauseParse(text: string): Promise<ClauseItem[]> {
    const formData = new FormData()
    formData.append('text', text)

    const responseJson = await postFormData('/api/math-guide/read/clause-parse', formData)
    const result = responseJson.result as unknown as Record<string, unknown>
    const clauses = result.clauses as unknown as ClauseItem[]
    return clauses
}