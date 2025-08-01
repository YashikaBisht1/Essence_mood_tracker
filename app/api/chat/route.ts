import { NextResponse } from "next/server"
import "server-only" // Ensure this file is only run on the server
import { createAgent, detectQueryType } from "@/lib/agents"
import { generalVectorStore } from "@/lib/vector-store"

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function POST(req: Request) {
  const { messages, personaId } = await req.json()

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key not configured." }, { status: 500 })
  }

  try {
    // Get the latest user message to determine query type
    const latestMessage = messages[messages.length - 1]
    const query = latestMessage?.content || ''
    
    // Detect the type of query and create appropriate agent
    const queryType = detectQueryType(query)
    const agent = createAgent(personaId, queryType)
    
    // Initialize the agent and get RAG-enhanced context
    await agent.initialize()
    const agentResponse = await agent.processQuery(query)
    
    // Log the context being used for debugging
    console.log(`Using ${queryType} agent for persona ${personaId}`)
    console.log(`Context found: ${agentResponse.context.length} relevant documents`)
    
    // Use the enhanced system prompt from the agent
    const enhancedSystemPrompt = agentResponse.response

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: enhancedSystemPrompt,
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
    
    // Return response with additional metadata about the RAG context
    return NextResponse.json({ 
      content: data.choices[0]?.message?.content,
      metadata: {
        queryType,
        contextUsed: agentResponse.context.length,
        agentType: `${queryType}Agent`,
        personaId: agentResponse.personaId
      }
    })
  } catch (error) {
    console.error("Chat API error:", error)
    
    // Fallback to basic persona context if RAG fails
    try {
      const { personas } = await import("@/lib/personas")
      const persona = personas.find((p) => p.id === personaId)
      
      if (!persona) {
        throw new Error("Persona not found")
      }
      
      const basicContext = `You are ${persona.name} (${persona.title}), ${persona.description}

Your personality: ${persona.personality.join(', ')}
Your conversation style: ${persona.conversationStyle}
Background: ${persona.background}`

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: basicContext,
            },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error("Fallback API call failed")
      }

      const data: GroqResponse = await response.json()
      return NextResponse.json({ 
        content: data.choices[0]?.message?.content,
        metadata: {
          queryType: 'fallback',
          contextUsed: 0,
          agentType: 'basic',
          personaId
        }
      })
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError)
      return NextResponse.json({ error: "Failed to generate response." }, { status: 500 })
    }
  }
}
