import "server-only"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

type ChatMessage = { role: "user" | "assistant"; content: string }

const MAX_CONTEXT_MESSAGES = 12

function normalizeMessages(input: any): ChatMessage[] {
  if (!Array.isArray(input)) return []
  const msgs: ChatMessage[] = input
    .map((m) => {
      const role = m?.role === "assistant" ? "assistant" : "user"
      const content = typeof m?.content === "string" ? m.content : ""
      return { role, content }
    })
    .filter((m) => m.content.trim().length > 0)
  // keep only the last N
  return msgs.slice(Math.max(0, msgs.length - MAX_CONTEXT_MESSAGES))
}

function buildPromptThread(messages: ChatMessage[]) {
  // Compact transcript the model can follow inside a single prompt
  return messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
}

function buildSystem(personaContext?: string) {
  return [
    "You are a helpful, empathetic assistant. Stay concise, kind, and specific.",
    personaContext ? `Persona Context:\n${personaContext}` : "",
    "If the user asks for guidance, provide 2-4 actionable steps. Keep formatting light.",
  ]
    .filter(Boolean)
    .join("\n\n")
}

function craftFallbackReply(messages: ChatMessage[], personaContext?: string) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const nameMatch = /You are\s+([^,]+),/.exec(personaContext || "")
  const who = nameMatch?.[1]?.trim() || "your guide"
  const hint =
    lastUser.length > 0
      ? `You said: "${lastUser.slice(0, 240)}"${lastUser.length > 240 ? "..." : ""}`
      : "Share what's on your mind."
  return `${who} here. I’m offline for a moment, but I’m still with you. ${hint}\n\nTry this:\n- Take a slow breath in for 4, hold 2, out for 6.\n- Name the main feeling in one word.\n- Share one small step you can take in the next 10 minutes.\n\nI’ll be fully responsive again shortly.`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = normalizeMessages(body?.messages)
    const personaContext = typeof body?.personaContext === "string" ? body.personaContext : undefined

    const system = buildSystem(personaContext)
    const prompt = buildPromptThread(messages) || "USER: Hello\nASSISTANT:"

    const hasGroq = !!process.env.GROQ_API_KEY && String(process.env.GROQ_API_KEY).trim().length > 0

    if (!hasGroq) {
      // Graceful fallback: no 500, return a deterministic supportive message
      const content = craftFallbackReply(messages, personaContext)
      return NextResponse.json({ content, model: "fallback:offline" })
    }

    // Use AI SDK with the Groq provider and your requested model
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system,
      prompt,
      maxTokens: 500,
      temperature: 0.6,
    })

    return NextResponse.json({ content: text, model: "groq:llama-3.3-70b-versatile" })
  } catch (err: any) {
    console.error("chat route error:", err)
    // Final safety: never crash the UI
    return NextResponse.json(
      { content: "I hit a temporary snag generating a reply. Please try again in a moment.", model: "error:fallback" },
      { status: 200 },
    )
  }
}
