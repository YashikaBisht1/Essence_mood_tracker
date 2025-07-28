import { NextResponse } from "next/server"
import "server-only" // Ensure this file is only run on the server [^1]

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function POST(req: Request) {
  const { messages, personaContext } = await req.json()

  const apiKey = process.env.GROQ_API_KEY // Access the server-side environment variable

  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key not configured." }, { status: 500 })
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // Using the specified model
        messages: [
          {
            role: "system",
            content: personaContext,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Groq API error response:", errorData)
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`)
    }

    const data: GroqResponse = await response.json()
    return NextResponse.json({ content: data.choices[0]?.message?.content })
  } catch (error) {
    console.error("Groq API error:", error)
    return NextResponse.json({ error: "Failed to generate response from Groq API." }, { status: 500 })
  }
}
