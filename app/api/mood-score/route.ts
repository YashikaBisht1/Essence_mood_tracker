import { NextResponse } from "next/server"
import "server-only"
import { z } from "zod"
import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"

// Schema for the LLM to follow strictly
const MoodSchema = z.object({
  score: z.number().min(0).max(10),
  energy: z.number().min(0).max(10),
  emotions: z.array(z.string()).max(5).optional(),
  rationale: z.string().max(400).optional(),
})

const RequestSchema = z.object({
  text: z.string().min(1),
  userId: z.string().optional(),
  personaId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, userId, personaId } = RequestSchema.parse(body)

    const system = [
      "You are a precise mood scoring service.",
      "Return a JSON object that matches the provided schema.",
      "Rules:",
      "- score: integer 0..10 reflecting overall valence (0 very negative, 10 very positive).",
      "- energy: integer 0..10 reflecting activation/arousal (0 very low, 10 very high).",
      "- emotions: up to 5 concise emotion words.",
      "- rationale: one-paragraph explanation, <= 400 chars, referencing the user text.",
      personaId ? `Persona context: ${personaId}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    // Use Groq with the requested model: openai/gpt-oss-120b
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      system,
      schema: MoodSchema,
      prompt: `User text:\n"""${text}"""\n\nReturn ONLY the JSON.`,
    })

    return NextResponse.json({
      ok: true,
      userId,
      personaId,
      result: object,
      model: "groq:openai/gpt-oss-120b",
      at: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error("mood-score error:", err)
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed to score mood" }, { status: 400 })
  }
}
