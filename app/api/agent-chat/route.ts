import { NextResponse } from "next/server"
import "server-only"
import { agentMemory, getThreadId, type ChatMessage, type AgentId } from "@/lib/agent-memory"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// A tiny helper to format memory context into a compact transcript
function formatMemoryContext(history: ChatMessage[], maxChars = 2000) {
  const lines = history.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  let out = ""
  for (let i = Math.max(0, lines.length - 1); i >= 0; i--) {
    const candidate = `${lines[i]}\n${out}`
    if (candidate.length > maxChars) break
    out = candidate
  }
  return out.trim()
}

function systemForAgent(agent: AgentId) {
  switch (agent) {
    case "ritual":
      return "You are a Ritual Agent. Retrieve and suggest relevant rituals, guided practices, and soothing steps tailored to the user's needs. Be gentle, encouraging, and actionable."
    case "mood":
      return "You are a Mood Reflection Agent. Identify emotional patterns and provide reflective prompts or insights to help the user understand their mood trends."
    case "shadow":
      return "You are a Shadow Work Agent. Help surface root causes and compassionate insights. Offer safe, grounded reflections for shadow work."
    default:
      return "You are a Persona Conversation Agent. Stay in character and be empathetic, helpful, and specific."
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      // Client-provided
      userId,
      personaId,
      agent = "persona",
      personaContext,
      // Optional: latest message from the user
      userMessage,
    }: {
      userId: string
      personaId: string
      agent?: AgentId
      personaContext?: string
      userMessage?: string
    } = body

    if (!userId || !personaId) {
      return NextResponse.json({ error: "userId and personaId are required" }, { status: 400 })
    }

    // Build thread id and retrieve memory
    const threadId = getThreadId(userId, personaId, agent)
    const history = agentMemory.getHistory(threadId)

    // Append the latest user message to the memory (if provided)
    if (userMessage && userMessage.trim().length > 0) {
      const msg: ChatMessage = {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      }
      agentMemory.append(threadId, msg)
    }

    const updatedHistory = agentMemory.getHistory(threadId)
    const memoryContext = formatMemoryContext(updatedHistory)

    // Build the final system prompt with agent role + persona context + memory
    const system = [
      systemForAgent(agent),
      personaContext ? `Persona Context:\n${personaContext}` : "",
      memoryContext ? `Conversation Memory (most recent first):\n${memoryContext}` : "",
      "Use the memory to tailor your response. Be concise, compassionate, and practical.",
    ]
      .filter(Boolean)
      .join("\n\n")

    // Use AI SDK with Groq provider to generate text [^2]
    const { text } = await generateText({
      // Using Groq model: llama-3.3-70b-versatile via the AI SDK Groq provider
      model: groq("llama-3.3-70b-versatile"),
      system,
      prompt:
        userMessage && userMessage.trim().length > 0
          ? userMessage
          : "Continue the conversation helpfully, referencing the memory above when relevant.",
    })

    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: text,
      timestamp: new Date().toISOString(),
    }

    // Save assistant message to memory
    agentMemory.append(threadId, assistantMsg)

    return NextResponse.json({
      content: text,
      agent,
      threadId,
      memorySize: agentMemory.getHistory(threadId).length,
    })
  } catch (err) {
    console.error("agent-chat error:", err)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
