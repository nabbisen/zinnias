import type { Message, MessageLevel } from "$lib/types/(view)/common/message-center"

const state: { messages: Message[] } = $state({
    messages: []
})

export const messages = {
    get all(): Message[] {
        return state.messages
    },
    pushInfo(...content: unknown[]) {
        pushMessage(content, "info")
    },
    pushWarn(...content: unknown[]) {
        pushMessage(content, "warn")
    },
    pushError(...content: unknown[]) {
        pushMessage(content, "error")
    },
    remove(messageId: string) {
        state.messages = state.messages.filter((x) => x.messageId !== messageId)
    }
}

function pushMessage(content: unknown[], level: MessageLevel) {
    const timestamp = new Date().toLocaleTimeString()
    const joinedContent = content.map((x) => {
        const s = (!(x instanceof String)) ? (x as any).toString() : x
        return s.trimEnd()
    }).join(" ")
    const timestampContent = `${joinedContent} (${timestamp})`
    const messageId = randomAsMessageId()

    state.messages.push({ messageId, content: timestampContent, level })

    if (["info", "warn"].includes(level)) {
        const timer = level === "warn" ? 10000 : 6000
        setTimeout(() => {
            messages.remove(messageId)
        }, timer)
    }
}

function randomAsMessageId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 8)
    return timestamp + randomPart
}