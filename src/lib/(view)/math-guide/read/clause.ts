import type { ClauseItem } from "$lib/types/(view)/math-guide/clause-parse"
import { postJson } from "$lib/(view)/common/api"

export async function clauseParse(text: string): Promise<ClauseItem[]> {
    const requestJson = { text }

    const responseJson = await postJson('/api/math-guide/read/clause-parse', requestJson)
    const result = responseJson.result as unknown as Record<string, unknown>
    const clauses = result.clauses as unknown as ClauseItem[]
    return clauses
}