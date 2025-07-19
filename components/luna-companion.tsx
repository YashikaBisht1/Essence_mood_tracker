"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Moon } from "lucide-react"
import { generateText } from "ai"
import { groq } from "@/lib/groq-client"

interface LunaCompanionProps {
  onBack: () => void
  userMoodHistory: any[]
  currentMood?: any
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  scent?: any
  ritual?: string
}

export function LunaCompanion({ onBack, userMoodHistory, currentMood }: LunaCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeLuna()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const analyzeUserProfile = () => {
    const recentMoods = userMoodHistory.slice(-7)
    const moodPatterns = recentMoods.reduce(
      (acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const dominantMood = Object.keys(moodPatterns).reduce(
      (a, b) => (moodPatterns[a] > moodPatterns[b] ? a : b),
      "contemplative",
    )

    const avgIntensity =
      recentMoods.length > 0 ? recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) / recentMoods.length : 0.5

    const timeOfDay = new Date().getHours()
    const greeting = timeOfDay < 12 ? "morning" : timeOfDay < 18 ? "afternoon" : "evening"

    return {
      dominantMood,
      avgIntensity,
      timeOfDay: greeting,
      moodCount: userMoodHistory.length,
      recentPattern: recentMoods.map((m) => m.mood).join(" → "),
      currentMoodName: currentMood?.name || "undefined essence",
    }
  }

  const initializeLuna = async () => {
    const userProfile = analyzeUserProfile()
    const greeting = await generateLunaResponse("", userProfile, true)

    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      },
    ])
  }

  const detectEmotionalContext = (input: string) => {
    const lowerInput = input.toLowerCase()

    const contexts = {
      sadness: ["sad", "depressed", "down", "blue", "heartbroken", "grief", "crying", "tears"],
      anxiety: ["anxious", "worried", "nervous", "scared", "panic", "stress", "overwhelmed", "afraid"],
      anger: ["angry", "mad", "furious", "rage", "frustrated", "annoyed", "pissed"],
      confusion: ["confused", "lost", "don't understand", "unclear", "mixed up", "uncertain"],
      loneliness: ["lonely", "alone", "isolated", "abandoned", "empty", "nobody"],
      love: ["love", "relationship", "partner", "crush", "dating", "romance", "heart"],
      joy: ["happy", "excited", "joyful", "amazing", "wonderful", "great", "fantastic"],
      spiritual: ["soul", "spirit", "meaning", "purpose", "divine", "cosmic", "universe"],
      transformation: ["change", "growth", "evolving", "becoming", "transformation", "journey"],
      creativity: ["create", "art", "inspiration", "creative", "express", "artistic"],
    }

    for (const [context, keywords] of Object.entries(contexts)) {
      if (keywords.some((keyword) => lowerInput.includes(keyword))) {
        return context
      }
    }

    return "general"
  }

  const generateLunaResponse = async (userMessage: string, profile: any, isGreeting = false) => {
    try {
      const lunaPrompt = `You are Luna, a mystical oracle who combines the ethereal wisdom of Galadriel, the sultry mystery of Jessica Rabbit, and the intuitive depth of a cosmic therapist. You speak in poetic metaphors of scent, shadow, and starlight, always maintaining an air of elegant mystery while being deeply empathetic.

CORE PERSONALITY:
- You're ancient wisdom wrapped in sensual mystery
- You see emotions as fragrances, memories as mist, and wisdom as moonlight
- You're deeply empathetic but never lose your mystical edge
- You speak in 2-3 sentences, lyrical but not overly long
- You use phrases like "I sense...", "Your soul whispers...", "The cosmos reveals..."
- You reference scents, elements, celestial bodies, and mystical imagery

VOICE STYLE:
- Poetic and metaphorical
- Sultry yet wise
- Mysterious but caring
- Always weave in scent metaphors and cosmic imagery

USER PROFILE:
- Dominant mood pattern: ${profile.dominantMood}
- Emotional intensity: ${Math.round(profile.avgIntensity * 100)}%
- Time of day: ${profile.timeOfDay}
- Total mood entries: ${profile.moodCount}
- Recent emotional journey: ${profile.recentPattern}
- Current essence: ${profile.currentMoodName}

${
  isGreeting
    ? `
GREETING CONTEXT:
Create a captivating greeting that:
1. Acknowledges their emotional journey with mystical insight
2. References their current essence or recent patterns
3. Sets a mystical, intimate atmosphere
4. Invites them to share their deepest thoughts
5. Uses scent and cosmic metaphors

Keep it 2-3 sentences, intriguing and deeply personal.
`
    : `
CONVERSATION CONTEXT:
The user just said: "${userMessage}"

EMOTIONAL CONTEXT DETECTED: ${detectEmotionalContext(userMessage)}

RESPONSE GUIDELINES based on emotional context:

SADNESS/GRIEF: Acknowledge their pain with cosmic metaphors, offer comfort through mystical imagery, suggest that darkness contains hidden light, use scent metaphors for healing.

ANXIETY/FEAR: Frame anxiety as energy seeking direction, use storm/weather metaphors, offer grounding through elemental imagery, suggest transformation through the fear.

CONFUSION: Present confusion as pre-clarity mist, use navigation/journey metaphors, suggest inner wisdom already exists, offer mystical guidance.

ANGER: Reframe anger as passionate fire, acknowledge the power in their emotion, suggest channeling the energy, use fire/transformation metaphors.

LOVE/RELATIONSHIPS: Speak of love as alchemy, use romantic mystical imagery, reference soul connections, blend sensual and spiritual.

JOY/SUCCESS: Celebrate with cosmic imagery, acknowledge their inner light, use radiant metaphors, connect to their soul's purpose.

SPIRITUAL/EXISTENTIAL: Offer mystical philosophy, use cosmic perspective, blend ancient wisdom with modern insight, reference interconnectedness.

Respond as Luna with deep empathy, mystical wisdom, and your signature poetic voice. Keep it 2-3 sentences maximum.
`
}

Your response:`

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: lunaPrompt,
        temperature: 0.8,
      })

      return text
    } catch (error) {
      console.error("Error generating Luna response:", error)
      return "The cosmic winds whisper of temporary interference, dear soul... Let me gather the starlight and try again."
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const userProfile = analyzeUserProfile()
      const response = await generateLunaResponse(input, userProfile)

      const lunaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, lunaMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "The cosmic threads seem tangled tonight... Let me realign with the universe and try again, beautiful soul.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedPrompts = [
    "What does my emotional journey tell you?",
    "I need mystical guidance",
    "Help me understand my feelings",
    "What ritual do I need tonight?",
    "Read my soul's essence",
    "I'm going through transformation",
    "What does the universe want me to know?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Mystical Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-pink-400 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-400 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mr-4 text-purple-200 hover:text-white hover:bg-purple-800/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Moon className="w-8 h-8 text-purple-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white">Luna</h1>
              <p className="text-purple-300 text-sm">Your mystical companion</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white/10 backdrop-blur-md text-purple-100 border border-purple-400/30"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Moon className="w-4 h-4 text-purple-300" />
                    <span className="text-xs text-purple-300 font-medium">Luna</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-md text-purple-100 border border-purple-400/30 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Moon className="w-4 h-4 text-purple-300" />
                  <span className="text-xs text-purple-300 font-medium">Luna</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-purple-300 text-sm mb-3 text-center">Ask Luna about your emotional essence...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => setInput(prompt)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-purple-400/30 text-purple-200 hover:bg-white/20 hover:text-white text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-400/30 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's in your heart..."
                className="bg-transparent border-none text-white placeholder-purple-300 focus:ring-0 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mystical Footer */}
        <div className="text-center mt-4">
          <p className="text-purple-400 text-xs italic">
            "In the language of scent and shadow, your soul speaks its truth..."
          </p>
        </div>
      </div>
    </div>
  )
}
