import type { Message } from "@/types/persona"

export class ConversationManager {
  private conversations: Map<string, Message[]> = new Map()
  private readonly maxMessages = 100 // Sliding window size

  addMessage(personaId: string, message: Message) {
    const messages = this.conversations.get(personaId) || []
    messages.push(message)

    // Implement sliding window
    if (messages.length > this.maxMessages) {
      messages.splice(0, messages.length - this.maxMessages)
    }

    this.conversations.set(personaId, messages)
    this.saveToStorage(personaId, messages)
  }

  getMessages(personaId: string): Message[] {
    return this.conversations.get(personaId) || []
  }

  getRecentContext(personaId: string, count = 10): Message[] {
    const messages = this.getMessages(personaId)
    return messages.slice(-count)
  }

  private saveToStorage(personaId: string, messages: Message[]) {
    try {
      localStorage.setItem(`conversation_${personaId}`, JSON.stringify(messages))
    } catch (error) {
      console.error("Failed to save conversation:", error)
    }
  }

  loadFromStorage(personaId: string) {
    try {
      const stored = localStorage.getItem(`conversation_${personaId}`)
      if (stored) {
        const messages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // Ensure timestamp is a Date object
        }))
        this.conversations.set(personaId, messages)
      }
    } catch (error) {
      console.error("Failed to load conversation:", error)
    }
  }

  clearConversation(personaId: string) {
    this.conversations.delete(personaId)
    localStorage.removeItem(`conversation_${personaId}`)
  }
}

export const conversationManager = new ConversationManager()
