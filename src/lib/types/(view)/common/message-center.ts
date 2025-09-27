export type MessageLevel = "info" | "warn" | "error"

export interface Message {
    messageId: string,
    content: string,
    level?: MessageLevel,
}