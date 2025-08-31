"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Mic, MicOff, Star, Zap, ArrowLeft } from "lucide-react"
import type { Persona, Message } from "@/types/persona"
import { conversationManager } from "@/lib/conversation-manager"
import { messageQueue } from "@/lib/priority-queue"

interface PersonaChatProps {
  persona: Persona
  onBack: () => void
  onAddPoints: (points: number) => void
  userPoints: number
}

function getOrCreateUserId() {
  try {
    const key = "essence_user_id"
    let id = localStorage.getItem(key)
    if (!id) {
      id = `u_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return "anon"
  }
}

export function PersonaChat({ persona, onBack, onAddPoints, userPoints }: PersonaChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>("anon")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserId(getOrCreateUserId())
  }, [])

  useEffect(() => {
    // Load conversation history
    conversationManager.loadFromStorage(persona.id)
    const history = conversationManager.getMessages(persona.id)

    if (history.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: generateWelcomeMessage(),
        sender: "persona",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      conversationManager.addMessage(persona.id, welcomeMessage)
      // Notify listeners that conversation changed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("conversation:updated", { detail: { personaId: persona.id } }))
      }
    } else {
      setMessages(history)
    }
  }, [persona.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateWelcomeMessage = (): string => {
    const welcomes = {
      aurora: `Welcome, dear soul. I am Aurora, your Dawn Oracle. As the first light touches the horizon, I sense your presence here. ${persona.tagline} What brings you to seek wisdom in this sacred moment?`,
      scarleet: `Darling! *strikes a dramatic pose* Scarleet here, your Fame Flame! I can already see the star quality radiating from you. ${persona.tagline} What magnificent scene shall we create together today?`,
      luna: `*emerges from the shadows* Greetings, soul seeker. I am Luna, your Midnight Confidante. In this liminal space between light and dark, I sense the depths you carry. ${persona.tagline} What secrets does your heart whisper tonight?`,
    }
    return welcomes[persona.id as keyof typeof welcomes] || welcomes.luna
  }

  const generatePersonaContext = (): string => {
    return `You are ${persona.name}, ${persona.title}. 

PHYSICAL DESCRIPTION: ${persona.physicalDescription}
BACKGROUND: ${persona.background}
PERSONALITY: ${persona.personality.join(", ")}
CONVERSATION STYLE: ${persona.conversationStyle}

DAILY SCHEDULE:
- Morning: ${persona.dailySchedule.morning}
- Afternoon: ${persona.dailySchedule.afternoon}
- Evening: ${persona.dailySchedule.evening}
- Night: ${persona.dailySchedule.night}

INTERESTS:
- Hobbies: ${persona.hobbies.join(", ")}
- Favorite Books: ${persona.favoriteBooks.join(", ")}
- Favorite Songs: ${persona.favoriteSongs.join(", ")}
- Favorite Movies: ${persona.favoriteMovies.join(", ")}

ROLE: ${persona.role}
TARGET AUDIENCE: ${persona.targetAudience}

You should respond in character, using your unique speaking style and drawing from your background and interests. Be empathetic, helpful, and true to your persona's personality traits. Offer specific advice and insights based on your expertise and background.`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    // Add to priority queue
    messageQueue.enqueue({
      id: userMessage.id,
      priority: 5, // Normal priority
      data: userMessage,
      timestamp: new Date(),
    })

    setMessages((prev) => [...prev, userMessage])
    conversationManager.addMessage(persona.id, userMessage)
    // Notify listeners that conversation changed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("conversation:updated", { detail: { personaId: persona.id } }))
    }
    setInputValue("")
    setIsLoading(true)

    try {
      // Get recent context for RAG
      const recentMessages = conversationManager.getRecentContext(persona.id, 5)
      const contextMessages = recentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }))

      // Make API call to the new server route
      const apiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: contextMessages,
          personaContext: generatePersonaContext(),
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(`API error! status: ${apiResponse.status}, message: ${errorData.error || "Unknown error"}`)
      }

      const data = await apiResponse.json()
      const responseContent = data.content

      const personaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "persona",
        timestamp: new Date(),
        points: Math.floor(Math.random() * 3) + 1, // Random points 1-3
      }

      setMessages((prev) => [...prev, personaMessage])
      conversationManager.addMessage(persona.id, personaMessage)
      // Notify listeners that conversation changed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("conversation:updated", { detail: { personaId: persona.id } }))
      }

      // Award points
      if (personaMessage.points) {
        onAddPoints(personaMessage.points)
      }
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        sender: "persona",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      conversationManager.addMessage(persona.id, errorMessage)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("conversation:updated", { detail: { personaId: persona.id } }))
      }
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

  return (
    <div className={`flex-1 flex flex-col bg-gradient-to-br ${persona.color} relative`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Close
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-serif text-white">{persona.name}</h2>
          <p className="text-white/70 text-sm">{persona.title}</p>
          <p className="text-white/50 text-xs mt-1">Age: {persona.age}</p>
        </div>

        <div className="flex items-center space-x-2 text-white">
          <Star className="w-4 h-4" />
          <span className="text-sm">{userPoints}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-xs lg:max-w-md ${
                message.sender === "user"
                  ? "bg-white/90 text-slate-900"
                  : "bg-black/30 backdrop-blur-sm text-white border-white/20"
              }`}
            >
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${message.sender === "user" ? "text-slate-500" : "text-white/50"}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {message.points && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs">+{message.points}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-black/30 backdrop-blur-sm text-white border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">💭</div>
                  <p className="text-sm">{persona.name} is thinking...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className={`text-white hover:bg-white/10 ${isRecording ? "bg-red-500/20" : ""}`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Share your thoughts with ${persona.name}...`}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
            disabled={isLoading}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
