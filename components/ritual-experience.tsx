"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Moon, Sun, Star, Heart, Eye, Feather, Flame, ArrowLeft } from "lucide-react"
import type { Persona } from "@/types/persona"
import { toast } from "sonner"

interface RitualCard {
  id: string
  emotionArchetype: string
  phase: string
  tarotPrompt: string
  creativeTask: string
  soundtrack: string
  scent: string
  color: string
}

interface RitualExperienceProps {
  persona: Persona
  onClose: () => void
  onAddPoints: (points: number) => void
  userMood: number
}

const ritualCards: { [key: string]: RitualCard[] } = {
  aurora: [
    {
      id: "dawn_awakening",
      emotionArchetype: "The Dawn Seeker",
      phase: "Ascend Phase - Time for Illumination",
      tarotPrompt: "What light have you been hiding from the world?",
      creativeTask: "Write a love letter to your morning self using only nature metaphors.",
      soundtrack: "Tibetan singing bowls with bird songs",
      scent: "Citrus bergamot with white sage",
      color: "from-amber-400 to-rose-300",
    },
    {
      id: "gratitude_bloom",
      emotionArchetype: "The Grateful Heart",
      phase: "Bloom Phase - Time for Appreciation",
      tarotPrompt: "What blessing have you taken for granted?",
      creativeTask: "Create a gratitude mandala using words instead of shapes.",
      soundtrack: "Gentle harp with forest sounds",
      scent: "Lavender with morning dew",
      color: "from-emerald-300 to-yellow-200",
    },
  ],
  scarleet: [
    {
      id: "power_reclaim",
      emotionArchetype: "The Flame Keeper",
      phase: "Ignite Phase - Time for Bold Action",
      tarotPrompt: "What stage have you been afraid to step onto?",
      creativeTask: "Write your victory speech as if you've already won your greatest battle.",
      soundtrack: "Dramatic orchestral with heartbeat rhythm",
      scent: "Red rose with amber musk",
      color: "from-red-500 to-orange-400",
    },
    {
      id: "confidence_crown",
      emotionArchetype: "The Inner Royalty",
      phase: "Crown Phase - Time for Self-Recognition",
      tarotPrompt: "What crown have you been refusing to wear?",
      creativeTask: "Design your personal coat of arms using your strengths as symbols.",
      soundtrack: "Empowering vocals with golden tones",
      scent: "Jasmine with vanilla warmth",
      color: "from-purple-500 to-pink-400",
    },
  ],
  luna: [
    {
      id: "shadow_integration",
      emotionArchetype: "The Shadow Weaver",
      phase: "Descend Phase - Time for Shadow Integration",
      tarotPrompt: "What truth have you avoided this week?",
      creativeTask: "Write a dialogue between your light and shadow selves.",
      soundtrack: "Deep ambient with distant whispers",
      scent: "Sandalwood with midnight jasmine",
      color: "from-indigo-600 to-purple-800",
    },
    {
      id: "moon_wisdom",
      emotionArchetype: "The Night Oracle",
      phase: "Reflect Phase - Time for Deep Knowing",
      tarotPrompt: "What does your intuition know that your mind denies?",
      creativeTask: "Create a poem using only questions about your deepest desires.",
      soundtrack: "Ethereal vocals with night sounds",
      scent: "Patchouli with silver sage",
      color: "from-slate-700 to-indigo-900",
    },
  ],
}

export function RitualExperience({ persona, onClose, onAddPoints, userMood }: RitualExperienceProps) {
  const [phase, setPhase] = useState<"invoke" | "card" | "journal" | "complete">("invoke")
  const [selectedCard, setSelectedCard] = useState<RitualCard | null>(null)
  const [journalEntry, setJournalEntry] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }))
    setParticles(newParticles)

    // Auto-progress to card phase after invoke animation
    if (phase === "invoke") {
      const timer = setTimeout(() => {
        setPhase("card")
        selectRitualCard()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const selectRitualCard = () => {
    const personaCards = ritualCards[persona.id] || ritualCards.luna
    const moodIndex = userMood > 5 ? 0 : 1 // Higher mood = first card, lower = second
    setSelectedCard(personaCards[moodIndex])
  }

  const handleBeginJournal = () => {
    setPhase("journal")
    toast.success("The ritual space is prepared. Let your truth flow...")
  }

  const handleCompleteRitual = () => {
    if (!journalEntry.trim()) {
      toast.error("The ritual requires your authentic expression to complete.")
      return
    }

    // Save ritual to memory
    const ritual = {
      id: Date.now().toString(),
      personaId: persona.id,
      card: selectedCard,
      journalEntry: journalEntry.trim(),
      timestamp: new Date(),
      mood: userMood,
    }

    const existingRituals = JSON.parse(localStorage.getItem("ritualHistory") || "[]")
    existingRituals.push(ritual)
    localStorage.setItem("ritualHistory", JSON.stringify(existingRituals))

    // Award significant points for ritual completion
    onAddPoints(15)
    setPhase("complete")

    // Auto-close after showing completion
    setTimeout(() => {
      onClose()
    }, 4000)
  }

  const getRitualMessage = () => {
    const messages = {
      aurora:
        "Let us begin, dear soul... This ritual is not for fixing—but for remembering the light you've always carried within.",
      scarleet:
        "Darling, step into your power... This ritual is not for changing—but for claiming the magnificence you've always possessed.",
      luna: "Welcome to the sacred darkness... This ritual is not for healing—but for integrating the wisdom your shadows have been whispering.",
    }
    return messages[persona.id as keyof typeof messages] || messages.luna
  }

  if (phase === "invoke") {
    return (
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-br ${selectedCard?.color || persona.color} transition-all duration-1000`}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: "3s",
              }}
            >
              <Sparkles className="w-3 h-3 text-white opacity-60" />
            </div>
          ))}
        </div>

        {/* 3D Perfume Bottle Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className={`w-32 h-40 rounded-full bg-gradient-to-b ${persona.color} opacity-90 animate-spin-slow relative overflow-hidden shadow-2xl`}
              style={{ animationDuration: "4s" }}
            >
              <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl animate-pulse">{persona.emoji}</span>
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg"></div>
            </div>

            {/* Scent particles */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
                  style={{
                    left: `${45 + Math.random() * 10}%`,
                    top: `${20 + Math.random() * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Invocation Text */}
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <h1 className="text-4xl font-serif text-white mb-4 animate-fade-in">Ritual Summoned</h1>
          <p className="text-xl text-white/80 animate-fade-in-delay">Preparing your sacred space...</p>
        </div>
      </div>
    )
  }

  if (phase === "card" && selectedCard) {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${selectedCard.color} relative overflow-hidden`}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:bg-white/10 z-10 flex items-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: "4s",
              }}
            >
              <Star className="w-2 h-2 text-white opacity-40" />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* Persona speaks */}
          <Card className="max-w-2xl w-full bg-black/30 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-8 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center`}
              >
                <span className="text-2xl">{persona.emoji}</span>
              </div>
              <p className="text-white text-lg italic leading-relaxed">{getRitualMessage()}</p>
            </CardContent>
          </Card>

          {/* Ritual Card */}
          <Card className="max-w-2xl w-full bg-black/40 backdrop-blur-sm border-white/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center">
                <div className="flex items-center justify-center mb-2">
                  {persona.id === "aurora" && <Sun className="w-6 h-6 mr-2" />}
                  {persona.id === "scarleet" && <Flame className="w-6 h-6 mr-2" />}
                  {persona.id === "luna" && <Moon className="w-6 h-6 mr-2" />}
                  {selectedCard.emotionArchetype}
                </div>
                <p className="text-white/80 text-sm font-normal">{selectedCard.phase}</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tarot Prompt */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5 text-white/70 mr-2" />
                  <span className="text-white/70 text-sm uppercase tracking-wide">Oracle Speaks</span>
                </div>
                <p className="text-white text-xl font-serif italic">"{selectedCard.tarotPrompt}"</p>
              </div>

              {/* Creative Task */}
              <div className="bg-white/10 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Feather className="w-5 h-5 text-white/70 mr-2" />
                  <span className="text-white/70 text-sm uppercase tracking-wide">Sacred Task</span>
                </div>
                <p className="text-white leading-relaxed">{selectedCard.creativeTask}</p>
              </div>

              {/* Sensory Elements */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-white/60">🎵 Soundtrack</span>
                  </div>
                  <p className="text-white/80">{selectedCard.soundtrack}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-white/60">🌸 Scent</span>
                  </div>
                  <p className="text-white/80">{selectedCard.scent}</p>
                </div>
              </div>

              <Button
                onClick={handleBeginJournal}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 py-3"
              >
                <Heart className="w-4 h-4 mr-2" />
                Begin Sacred Expression
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (phase === "journal" && selectedCard) {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${selectedCard.color} relative overflow-hidden`}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:bg-white/10 z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <Card className="max-w-2xl w-full bg-black/30 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Sacred Expression</CardTitle>
              <p className="text-white/70 text-center text-sm">Let your authentic voice emerge...</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reminder of the prompt */}
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/80 text-sm italic text-center">"{selectedCard.tarotPrompt}"</p>
              </div>

              {/* Journal Area */}
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Let your truth flow onto this sacred page..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[200px] text-lg leading-relaxed"
              />

              {/* Word count and encouragement */}
              <div className="flex justify-between items-center text-sm text-white/60">
                <span>{journalEntry.length} characters of truth</span>
                <span>✨ Your soul is speaking</span>
              </div>

              <Button
                onClick={handleCompleteRitual}
                disabled={!journalEntry.trim()}
                className="w-full bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 text-white border-white/30 py-3"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Sacred Ritual (+15 points)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (phase === "complete") {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${selectedCard?.color} relative overflow-hidden`}>
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "1s",
              }}
            >
              <Sparkles className="w-4 h-4 text-white opacity-80" />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <Card className="max-w-2xl w-full bg-black/40 backdrop-blur-sm border-white/30 text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center animate-pulse">
                <Star className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-serif text-white mb-4">Ritual Complete</h2>
              <p className="text-xl text-white/80 mb-6">
                Your essence has been woven into the cosmic tapestry. The transformation has begun.
              </p>

              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <p className="text-white/90 italic">
                  "{persona.name} will remember this sacred moment and carry its wisdom into future conversations."
                </p>
              </div>

              <div className="text-white/60 text-sm">
                <p>+15 points earned</p>
                <p>Ritual archived in your sacred timeline</p>
                <p>Persona memory enhanced</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
