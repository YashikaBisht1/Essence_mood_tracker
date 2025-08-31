/**
 * Simple agent memory store to keep last N messages per thread.
 * Thread ID is derived from: userId + personaId + agentId
 *
 * This is a lightweight, LangGraph-style memory layer:
 * - retrieve(threadId): get history
 * - append(threadId, ...messages): save
 *
 * Note: In a stateless environment, consider persisting this to KV/DB.
 */

export type ChatRole = "system" | "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
  timestamp: string // ISO string
}

const MAX_MEMORY_MESSAGES = 100

class AgentMemoryStore {
  private store = new Map<string, ChatMessage[]>()

  getHistory(threadId: string): ChatMessage[] {
    return this.store.get(threadId) || []
  }

  append(threadId: string, ...msgs: ChatMessage[]) {
    const existing = this.getHistory(threadId)
    const next = [...existing, ...msgs]
    // Sliding window
    const pruned = next.slice(Math.max(0, next.length - MAX_MEMORY_MESSAGES))
    this.store.set(threadId, pruned)
  }

  clear(threadId: string) {
    this.store.delete(threadId)
  }
}

export const agentMemory = new AgentMemoryStore()

export type AgentId = "persona" | "ritual" | "mood" | "shadow"

export function getThreadId(userId: string, personaId: string, agent: AgentId) {
  return `${userId}::${personaId}::${agent}`
}
