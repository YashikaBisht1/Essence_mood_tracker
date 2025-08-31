import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Simple JSON extraction in case the model returns extra text.
function extractJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { text, personaId, userId } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid 'text' in body" }, { status: 400 })
    }

    // Use a Groq model via the AI SDK for structured mood scoring.
    // Keep the instruction strict to return JSON only.
    const system = `You are a precise mood scoring service. 
Return a compact JSON object with strict numeric scales and no extra commentary.

Rules:
- mood: integer 1..10 (1 = very negative, 10 = very positive, 5 = neutral)
- energy: integer 1..10 (1 = very low, 10 = very high)
- label: "Positive" | "Neutral" | "Negative"
- emotions: an array of 1-4 concise emotion words
- rationale: one short sentence

Output format:
{"mood": number, "energy": number, "label":"Positive|Neutral|Negative", "emotions": ["..."], "rationale": "..."}`

    const userPrompt = `Classify the user's latest message.

Persona: ${personaId || "unknown"}
User: ${userId || "anon"}
Message: """${text}"""`

    const { text: modelText } = await generateText({
      // Use Groq's "openai/gpt-oss-120b" model via the AI SDK Groq provider.
      // This avoids the decommissioned model and remains fully compatible.
      model: groq("openai/gpt-oss-120b"),
      system,
      prompt: userPrompt,
      temperature: 0.2,
      maxTokens: 250,
    })

    const parsed = extractJson(modelText)
    if (!parsed) {
      return NextResponse.json(
        {
          error: "Failed to parse model output",
          raw: modelText,
        },
        { status: 500 },
      )
    }

    // Validate minimal shape
    const result = {
      mood: Math.max(1, Math.min(10, Number(parsed.mood) || 5)),
      energy: Math.max(1, Math.min(10, Number(parsed.energy) || 5)),
      label:
        parsed.label === "Positive" || parsed.label === "Negative" || parsed.label === "Neutral"
          ? parsed.label
          : "Neutral",
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 4).map(String) : [],
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
    }

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (err: any) {
    console.error("mood-score error:", err)
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
