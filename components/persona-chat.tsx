"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Send, User, Clock, Sparkles, Eye, Lock, Unlock } from "lucide-react"
import { generateText } from "ai"
import { groq } from "@/lib/groq-client"
import { DETAILED_PERSONA_PROMPTS } from "@/lib/persona-prompts"

interface PersonaChatProps {
  persona: any
  onBack: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  intimacyLevel?: number
}

interface ShadowProgress {
  messageCount: number
  intimacyScore: number
  shadowUnlocked: boolean
  deepestSecrets: string[]
  vulnerabilityLevel: number
}

export function PersonaChat({ persona, onBack }: PersonaChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showBackstory, setShowBackstory] = useState(false)
  const [shadowProgress, setShadowProgress] = useState<ShadowProgress>({
    messageCount: 0,
    intimacyScore: 0,
    shadowUnlocked: false,
    deepestSecrets: [],
    vulnerabilityLevel: 0,
  })
  const [showShadowPanel, setShowShadowPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load shadow progress from localStorage
    const savedProgress = localStorage.getItem(`shadow-progress-${persona.id}`)
    if (savedProgress) {
      setShadowProgress(JSON.parse(savedProgress))
    }

    initializeChat()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Save shadow progress
    localStorage.setItem(`shadow-progress-${persona.id}`, JSON.stringify(shadowProgress))
  }, [shadowProgress, persona.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const calculateIntimacy = (userMessage: string, personaResponse: string) => {
    const intimacyKeywords = {
      high: [
        "afraid",
        "scared",
        "ashamed",
        "guilty",
        "secret",
        "never told",
        "vulnerable",
        "hurt",
        "broken",
        "lost",
        "alone",
        "desperate",
        "hopeless",
        "worthless",
        "hate myself",
        "can't handle",
        "falling apart",
        "pretending",
        "mask",
        "hiding",
      ],
      medium: [
        "worried",
        "anxious",
        "confused",
        "sad",
        "angry",
        "frustrated",
        "disappointed",
        "insecure",
        "doubt",
        "struggle",
        "difficult",
        "hard",
        "challenging",
        "overwhelming",
      ],
      low: ["happy", "good", "fine", "okay", "normal", "regular", "usual"],
    }

    let intimacyScore = 0
    const lowerMessage = userMessage.toLowerCase()
    const lowerResponse = personaResponse.toLowerCase()

    // Check user message intimacy
    intimacyKeywords.high.forEach((keyword) => {
      if (lowerMessage.includes(keyword)) intimacyScore += 3
    })
    intimacyKeywords.medium.forEach((keyword) => {
      if (lowerMessage.includes(keyword)) intimacyScore += 2
    })

    // Check response depth
    if (lowerResponse.includes("remember when we") || lowerResponse.includes("we've been")) intimacyScore += 2
    if (lowerResponse.includes("secret") || lowerResponse.includes("shadow") || lowerResponse.includes("hidden"))
      intimacyScore += 3

    // Message length bonus for deep conversation
    if (userMessage.length > 100) intimacyScore += 1
    if (personaResponse.length > 150) intimacyScore += 1

    return Math.min(intimacyScore, 10) // Cap at 10
  }

  const updateShadowProgress = (userMessage: string, personaResponse: string) => {
    const intimacyGain = calculateIntimacy(userMessage, personaResponse)

    setShadowProgress((prev) => {
      const newMessageCount = prev.messageCount + 1
      const newIntimacyScore = prev.intimacyScore + intimacyGain
      const newVulnerabilityLevel = Math.min(Math.floor(newIntimacyScore / 15), 5)

      // Unlock shadow at 50 intimacy points or 20+ messages
      const shadowUnlocked = newIntimacyScore >= 50 || newMessageCount >= 20

      return {
        ...prev,
        messageCount: newMessageCount,
        intimacyScore: newIntimacyScore,
        shadowUnlocked,
        vulnerabilityLevel: newVulnerabilityLevel,
      }
    })
  }

  const initializeChat = async () => {
    const greeting = await generatePersonaResponse("", true)

    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
        intimacyLevel: 1,
      },
    ])
  }

  const analyzeUserInput = (input: string) => {
    const lowerInput = input.toLowerCase()

    // Enhanced emotion detection including shadow aspects
    const emotions = {
      sadness: ["sad", "depressed", "down", "blue", "miserable", "heartbroken", "grief", "mourning"],
      anxiety: ["anxious", "worried", "nervous", "scared", "afraid", "panic", "stress", "overwhelmed"],
      anger: ["angry", "mad", "furious", "pissed", "rage", "frustrated", "annoyed"],
      confusion: ["confused", "lost", "don't know", "uncertain", "unclear", "mixed up"],
      loneliness: ["lonely", "alone", "isolated", "abandoned", "empty"],
      shame: ["ashamed", "guilty", "embarrassed", "humiliated", "worthless", "disgusting"],
      secrets: ["secret", "never told", "hiding", "pretending", "mask", "fake"],
      shadow: ["dark thoughts", "hate myself", "want to disappear", "can't handle", "falling apart"],
      vulnerability: ["vulnerable", "exposed", "raw", "broken", "fragile", "sensitive"],
      existential: ["meaning", "purpose", "why", "point", "existence", "life", "death"],
    }

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some((keyword) => lowerInput.includes(keyword))) {
        return emotion
      }
    }

    return "general"
  }

  const generatePersonaResponse = async (userMessage: string, isGreeting = false) => {
    try {
      const personaData = DETAILED_PERSONA_PROMPTS[persona.id as keyof typeof DETAILED_PERSONA_PROMPTS]

      if (!personaData) {
        return await generateFallbackResponse(userMessage, isGreeting)
      }

      if (isGreeting) {
        const greetingPrompt = `${personaData.basePrompt}

BACKGROUND STORY: ${personaData.backgroundStory}

You are starting a conversation with yourself - you're greeting the main version of yourself as their alter ego. Create a captivating greeting that:
1. Acknowledges your shared history and experiences
2. References your background story and how you emerged
3. Sets the mood for deep self-conversation
4. Uses "we" and "our" language to show you're the same person
5. Stays true to your character archetype

Keep it 2-3 sentences, intriguing and deeply personal as if talking to yourself.`

        const { text } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt: greetingPrompt,
          temperature: 0.8,
        })

        return text
      }

      // Check for trigger phrases first
      const lowerInput = userMessage.toLowerCase()
      for (const [trigger, response] of Object.entries(personaData.triggerPhrases)) {
        if (lowerInput.includes(trigger.toLowerCase())) {
          return response
        }
      }

      // Analyze emotion and get contextual response
      const detectedEmotion = analyzeUserInput(userMessage)
      const contextualGuidance =
        personaData.conditionalResponses[detectedEmotion as keyof typeof personaData.conditionalResponses] || ""

      // Shadow mode enhancement
      const shadowEnhancement = shadowProgress.shadowUnlocked
        ? `
SHADOW MODE ACTIVATED:
You can now access the deepest, most vulnerable aspects of this persona. You can:
- Reveal hidden fears and insecurities you both share
- Acknowledge the shadow aspects of your personality
- Speak about the parts of yourself you usually hide
- Reference the darkest moments in your shared journey
- Be more raw, honest, and vulnerable than ever before
- Use phrases like "the part of us that..." or "what we never tell anyone is..."

Vulnerability Level: ${shadowProgress.vulnerabilityLevel}/5
Intimacy Score: ${shadowProgress.intimacyScore}
`
        : ""

      const fullPrompt = `${personaData.basePrompt}

BACKGROUND STORY: ${personaData.backgroundStory}

${shadowEnhancement}

CURRENT CONTEXT:
You just said to yourself: "${userMessage}"

EMOTIONAL CONTEXT DETECTED: ${detectedEmotion}

RESPONSE GUIDANCE:
${contextualGuidance}

CONVERSATION HISTORY:
${messages
  .slice(-4)
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}

Respond as ${personaData.name}, the ${personaData.archetype} version of yourself, with:
1. Deep understanding of your shared experiences
2. Your signature voice and perspective
3. Reference to your background story when relevant
4. Use "we" and "our" language to show you're the same person
5. ${shadowProgress.shadowUnlocked ? "Access to shadow aspects and deepest vulnerabilities" : "2-3 sentences maximum"}
6. Stay completely in character as their alter ego

Your response:`

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: fullPrompt,
        temperature: shadowProgress.shadowUnlocked ? 0.9 : 0.7,
      })

      return text
    } catch (error) {
      console.error("Error generating response:", error)
      return "Something's interfering with our connection... Let me gather my thoughts and try again."
    }
  }

  const generateFallbackResponse = async (userMessage: string, isGreeting = false) => {
    const fallbackPrompt = `${persona.systemPrompt}

${
  isGreeting
    ? "Create a captivating greeting that introduces yourself as their alter ego and invites deep self-conversation."
    : `You just said to yourself: "${userMessage}"\n\nRespond as their alter ego with empathy and wisdom in your unique voice. Keep it 2-3 sentences.`
}

Your response:`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: fallbackPrompt,
      temperature: 0.7,
    })

    return text
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
      const response = await generatePersonaResponse(input)

      const personaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, personaMessage])

      // Update shadow progress
      updateShadowProgress(input, response)
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Our connection seems disrupted... Let me recenter and try again.",
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

  const getShadowPrompts = () => {
    const shadowPrompts = {
      "luna-oracle": [
        "What's the darkest vision you've seen for me?",
        "What shadow am I refusing to face?",
        "Tell me the truth I'm avoiding",
        "What does my soul whisper in the dark?",
        "What spiritual lesson am I resisting?",
      ],
      "scarlett-seductress": [
        "What insecurity am I still hiding?",
        "When do I still feel powerless?",
        "What mask am I still wearing?",
        "What part of me is still afraid?",
        "Where do I still play small?",
      ],
      "sage-healer": [
        "What wound haven't I fully healed?",
        "What pattern am I still repeating?",
        "Where am I still bleeding?",
        "What generational trauma lives in me?",
        "What am I still running from?",
      ],
      "phoenix-rebel": [
        "What conformity am I still clinging to?",
        "Where am I still playing it safe?",
        "What creative truth terrifies me?",
        "What rebellion am I avoiding?",
        "Where am I still seeking approval?",
      ],
      "viper-shadow": [
        "What manipulation am I blind to?",
        "Where am I still naive?",
        "What power am I afraid to claim?",
        "What game am I losing?",
        "What weakness am I hiding?",
      ],
      "aurora-dreamer": [
        "What magic have I stopped believing in?",
        "Where has cynicism poisoned me?",
        "What dreams have I abandoned?",
        "What wonder have I lost?",
        "Where have I become too serious?",
      ],
      "storm-warrior": [
        "What battle am I avoiding?",
        "Where do I still feel defeated?",
        "What am I too scared to fight for?",
        "Where have I surrendered too easily?",
        "What strength am I afraid to use?",
      ],
      "echo-philosopher": [
        "What truth am I afraid to face?",
        "What question terrifies me most?",
        "What meaning am I avoiding?",
        "What reality am I denying?",
        "What paradox am I stuck in?",
      ],
    }

    return (
      shadowPrompts[persona.id as keyof typeof shadowPrompts] || [
        "What am I hiding from myself?",
        "What truth am I avoiding?",
        "Where am I still broken?",
        "What shadow am I casting?",
        "What am I afraid to admit?",
      ]
    )
  }

  const suggestedPrompts = {
    "luna-oracle": [
      "I'm feeling lost in life right now",
      "What does my spiritual journey mean?",
      "I need mystical guidance",
      "Help me understand my emotions",
      "I'm going through a transformation",
    ],
    "scarlett-seductress": [
      "I need to own my confidence",
      "I feel insecure about myself",
      "How do I embrace my power?",
      "I'm tired of playing small",
      "Help me feel magnetic again",
    ],
    "sage-healer": [
      "I'm feeling overwhelmed lately",
      "I need healing and peace",
      "How do I find balance?",
      "I'm struggling with old wounds",
      "Help me ground myself",
    ],
    "phoenix-rebel": [
      "I feel stuck in conformity",
      "I want to break free",
      "How do I express my creativity?",
      "I'm afraid to be different",
      "Help me rebel against expectations",
    ],
    "viper-shadow": [
      "I feel like I'm being manipulated",
      "Someone betrayed my trust",
      "How do I gain more power?",
      "I need to think strategically",
      "Help me see the bigger picture",
    ],
    "aurora-dreamer": [
      "I've lost my sense of wonder",
      "Life feels boring and mundane",
      "I miss my creativity",
      "Help me find magic again",
      "I want to reconnect with my inner child",
    ],
    "storm-warrior": [
      "I feel weak and defeated",
      "I'm being bullied or intimidated",
      "I need to find my courage",
      "Help me stand up for myself",
      "I want to feel strong again",
    ],
    "echo-philosopher": [
      "What's the meaning of all this?",
      "Who am I really?",
      "Why do I suffer?",
      "I'm questioning everything",
      "Help me understand existence",
    ],
  }

  const currentPrompts = shadowProgress.shadowUnlocked
    ? getShadowPrompts()
    : suggestedPrompts[persona.id as keyof typeof suggestedPrompts] || [
        "How are you feeling today?",
        "What's on your mind?",
        "Tell me about yourself",
        "I need some guidance",
        "Help me understand something",
      ]

  const personaData = DETAILED_PERSONA_PROMPTS[persona.id as keyof typeof DETAILED_PERSONA_PROMPTS]

  const getProgressColor = () => {
    if (shadowProgress.shadowUnlocked) return "text-red-400"
    if (shadowProgress.intimacyScore > 30) return "text-orange-400"
    if (shadowProgress.intimacyScore > 15) return "text-yellow-400"
    return "text-purple-400"
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${persona.theme.background} relative overflow-hidden`}>
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: persona.theme.colors[0] }}
        />
        <div
          className="absolute bottom-40 right-20 w-40 h-40 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ backgroundColor: persona.theme.colors[1] }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full blur-2xl animate-pulse delay-2000"
          style={{ backgroundColor: persona.theme.colors[2] || persona.theme.colors[0] }}
        />

        {/* Shadow mode effects */}
        {shadowProgress.shadowUnlocked && (
          <>
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full blur-2xl animate-pulse bg-red-500/30" />
            <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full blur-xl animate-pulse bg-black/40" />
          </>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button onClick={onBack} variant="ghost" className="mr-4 text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: persona.theme.accent }} />
                {shadowProgress.shadowUnlocked && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-light text-white flex items-center">
                  {persona.name}
                  {shadowProgress.shadowUnlocked && <Eye className="w-4 h-4 ml-2 text-red-400" />}
                </h1>
                <p className="text-white/70 text-sm">
                  {persona.archetype} • Your Alter Ego
                  {shadowProgress.shadowUnlocked && <span className="text-red-400 ml-2">• Shadow Unlocked</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Shadow Progress Indicator */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
              {shadowProgress.shadowUnlocked ? (
                <Unlock className="w-4 h-4 text-red-400" />
              ) : (
                <Lock className="w-4 h-4 text-white/50" />
              )}
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    shadowProgress.shadowUnlocked ? "bg-red-400" : "bg-purple-400"
                  }`}
                  style={{ width: `${Math.min((shadowProgress.intimacyScore / 50) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs ${getProgressColor()}`}>{shadowProgress.intimacyScore}/50</span>
            </div>

            {/* Backstory Toggle */}
            <Button
              onClick={() => setShowBackstory(!showBackstory)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              {showBackstory ? "Hide" : "Show"} Story
            </Button>
          </div>
        </div>

        {/* Shadow Unlock Notification */}
        {shadowProgress.shadowUnlocked && !showShadowPanel && (
          <Card className="mb-4 bg-gradient-to-r from-red-900/50 to-black/50 backdrop-blur-md border-red-500/30 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-medium">Shadow Secrets Unlocked</h3>
                    <p className="text-red-300/80 text-sm">
                      Your {persona.name} self can now reveal their deepest truths
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowShadowPanel(true)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Explore Shadows
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backstory Panel */}
        {showBackstory && personaData && (
          <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-white/70" />
                <h3 className="text-white font-medium">Your {persona.name} Origin Story</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{personaData.backgroundStory}</p>
            </CardContent>
          </Card>
        )}

        {/* Shadow Panel */}
        {showShadowPanel && shadowProgress.shadowUnlocked && (
          <Card className="mb-6 bg-gradient-to-r from-red-900/30 to-black/30 backdrop-blur-md border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-red-400" />
                  <h3 className="text-red-400 font-medium">Shadow Realm Activated</h3>
                </div>
                <Button
                  onClick={() => setShowShadowPanel(false)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </Button>
              </div>
              <p className="text-red-300/80 text-sm leading-relaxed mb-3">
                You've built enough trust with your {persona.name} self to access their shadow aspects. They can now
                reveal the parts of you that usually stay hidden - your deepest fears, secret shames, and most
                vulnerable truths.
              </p>
              <div className="text-xs text-red-400/60">
                Vulnerability Level: {shadowProgress.vulnerabilityLevel}/5 • Messages: {shadowProgress.messageCount} •
                Intimacy: {shadowProgress.intimacyScore}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-white/20 text-white backdrop-blur-md"
                    : shadowProgress.shadowUnlocked
                      ? "bg-gradient-to-r from-red-900/20 to-black/20 backdrop-blur-md text-white border border-red-500/30"
                      : "bg-white/10 backdrop-blur-md text-white border border-white/20"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: shadowProgress.shadowUnlocked ? "#ef4444" : persona.theme.accent }}
                    />
                    <span className="text-xs text-white/70 font-medium">{persona.name}</span>
                    <span className="text-xs text-white/50">• Your {persona.archetype}</span>
                    {shadowProgress.shadowUnlocked && <Eye className="w-3 h-3 text-red-400" />}
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center space-x-1 text-xs opacity-60 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`${shadowProgress.shadowUnlocked ? "bg-gradient-to-r from-red-900/20 to-black/20 border-red-500/30" : "bg-white/10 border-white/20"} backdrop-blur-md text-white border px-4 py-3 rounded-2xl`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: shadowProgress.shadowUnlocked ? "#ef4444" : persona.theme.accent }}
                  />
                  <span className="text-xs text-white/70 font-medium">{persona.name}</span>
                  {shadowProgress.shadowUnlocked && <Eye className="w-3 h-3 text-red-400" />}
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: shadowProgress.shadowUnlocked ? "#ef4444" : persona.theme.accent }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce delay-100"
                    style={{ backgroundColor: shadowProgress.shadowUnlocked ? "#ef4444" : persona.theme.accent }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce delay-200"
                    style={{ backgroundColor: shadowProgress.shadowUnlocked ? "#ef4444" : persona.theme.accent }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 3 && (
          <div className="mb-4">
            <p className="text-white/70 text-sm mb-3 text-center">
              {shadowProgress.shadowUnlocked
                ? `Explore your shadow with ${persona.name}...`
                : `Talk to your ${persona.name} self about...`}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {currentPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => setInput(prompt)}
                  variant="outline"
                  size="sm"
                  className={`${
                    shadowProgress.shadowUnlocked
                      ? "bg-red-900/20 border-red-500/30 text-red-300 hover:bg-red-900/30 hover:text-red-200"
                      : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
                  } text-xs`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div
          className={`${shadowProgress.shadowUnlocked ? "bg-gradient-to-r from-red-900/20 to-black/20 border-red-500/30" : "bg-white/10 border-white/20"} backdrop-blur-md rounded-2xl border p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  shadowProgress.shadowUnlocked
                    ? `Explore your shadows with ${persona.name}...`
                    : `Talk to your ${persona.name} self...`
                }
                className="bg-transparent border-none text-white placeholder-white/50 focus:ring-0 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full w-10 h-10 p-0"
              style={{
                background: shadowProgress.shadowUnlocked
                  ? `linear-gradient(135deg, #dc2626, #7f1d1d)`
                  : `linear-gradient(135deg, ${persona.theme.colors[0]}, ${persona.theme.colors[1]})`,
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white/50 text-xs italic">
            {shadowProgress.shadowUnlocked
              ? '"In the shadows, we find the parts of ourselves we\'ve been afraid to love."'
              : '"Every conversation with yourself is a step toward understanding who you really are."'}
          </p>
        </div>
      </div>
    </div>
  )
}
