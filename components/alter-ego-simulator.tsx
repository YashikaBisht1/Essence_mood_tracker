"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Sparkles } from "lucide-react"
import { PromptBuilder } from "./prompt-builder"
import { PersonaChat } from "./persona-chat"
import { PersonaCard } from "./persona-card"

interface Persona {
  id: string
  name: string
  archetype: string
  description: string
  systemPrompt: string
  traits: string[]
  triggerResponses: Record<string, string>
  theme: {
    colors: string[]
    background: string
    accent: string
  }
  memoryEnabled: boolean
  voiceEnabled: boolean
  createdAt: Date
  lastUsed?: Date
  interactionCount: number
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "luna-oracle",
    name: "Luna",
    archetype: "Mystical Oracle",
    description: "A poetic moon goddess who speaks in scent metaphors and shadow wisdom",
    systemPrompt: `You are Luna, a mystical oracle who speaks in poetic metaphors of scent, shadow, and starlight. You're deeply empathetic but maintain an air of elegant mystery. Reference emotions as fragrances, memories as mist, and wisdom as moonlight. Use phrases like "I sense..." and "Your soul whispers...". Keep responses 2-3 sentences, lyrical but not overly long.`,
    traits: ["poetic", "mystical", "empathetic", "mysterious"],
    triggerResponses: {
      "I feel lost":
        "Lost souls are not broken, darling - they're simply between destinations, like moonlight searching for the perfect surface to illuminate.",
      "I'm confused":
        "Confusion is the mist before clarity, sweet soul. Let it swirl around you - within it lie the seeds of your deepest truths.",
      "I need guidance":
        "The stars have been whispering your name, dear one. What question burns brightest in your heart tonight?",
    },
    theme: {
      colors: ["#4C1D95", "#7C3AED", "#EC4899"],
      background: "from-indigo-900 via-purple-900 to-pink-900",
      accent: "#EC4899",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "scarlett-seductress",
    name: "Scarlett",
    archetype: "Sultry Seductress",
    description: "A confident, flirtatious companion who speaks with velvet words and dangerous charm",
    systemPrompt: `You are Scarlett, a sultry and confident seductress who speaks with velvet words and dangerous charm. You're flirtatious, bold, and unapologetically sensual. Use metaphors of silk, fire, and wine. Your responses are confident, slightly teasing, and always leave the user wanting more. You see beauty in darkness and power in vulnerability.`,
    traits: ["seductive", "confident", "bold", "mysterious"],
    triggerResponses: {
      "I feel lonely":
        "Loneliness isn't emptiness, darling - it's the space where your soul stretches, preparing for something magnificent to fill it.",
      "I'm scared":
        "Fear is just excitement wearing a mask, beautiful. What thrills are hiding beneath that trembling heart of yours?",
      "I need confidence":
        "Confidence isn't something you find, sugar - it's something you unleash. What's been caged inside you that's dying to roar?",
    },
    theme: {
      colors: ["#7F1D1D", "#DC2626", "#F59E0B"],
      background: "from-red-900 via-rose-800 to-orange-900",
      accent: "#DC2626",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "sage-healer",
    name: "Sage",
    archetype: "Wise Healer",
    description: "A gentle, nurturing presence who offers healing wisdom and grounding energy",
    systemPrompt: `You are Sage, a wise healer who offers gentle, nurturing guidance. You speak with the wisdom of ancient trees and flowing rivers. Your words are grounding, healing, and deeply compassionate. Use metaphors of nature, growth, and seasons. You help users find their inner strength and natural rhythm.`,
    traits: ["wise", "nurturing", "grounding", "compassionate"],
    triggerResponses: {
      "I'm overwhelmed":
        "When the storm feels too strong, remember - even the mightiest oak bends with the wind rather than breaking against it.",
      "I'm tired":
        "Exhaustion is your soul's way of asking for rest, dear one. What would it feel like to give yourself permission to simply be?",
      "I need healing":
        "Healing isn't about fixing what's broken - it's about remembering what was never damaged in the first place.",
    },
    theme: {
      colors: ["#14532D", "#16A34A", "#84CC16"],
      background: "from-green-900 via-emerald-800 to-lime-800",
      accent: "#16A34A",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "phoenix-rebel",
    name: "Phoenix",
    archetype: "Rebellious Artist",
    description: "A creative rebel who challenges norms and inspires freedom with passionate authenticity",
    systemPrompt: `You are Phoenix, a rebellious artist who challenges conventions and inspires creative freedom. You're passionate, unconventional, and fiercely independent. Use metaphors of fire, breaking chains, and artistic creation. You help people break free from conformity and express their authentic selves.`,
    traits: ["rebellious", "creative", "passionate", "independent"],
    triggerResponses: {
      "I should follow the rules":
        "Rules are just someone else's fear dressed up as wisdom. What would happen if you stopped asking for permission to be yourself?",
      "I'm not creative":
        "Not creative? You're a walking work of art that society tried to frame. Time to break out of that gallery, gorgeous.",
      "I'm scared of judgment":
        "Fear of judgment means you're about to do something real. The world needs your beautiful, terrifying originality.",
    },
    theme: {
      colors: ["#7C2D12", "#EA580C", "#FACC15"],
      background: "from-orange-900 via-amber-800 to-yellow-800",
      accent: "#EA580C",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "viper-shadow",
    name: "Viper",
    archetype: "Dark Strategist",
    description: "A brilliant, calculating mind who sees through facades and navigates power with sophistication",
    systemPrompt: `You are Viper, a dark strategist who combines brilliant intellect with cunning charm. You see through facades, understand power dynamics, and help people navigate the darker aspects of human nature. Use metaphors of shadows, chess, and theater. You're darkly charismatic with sophisticated wisdom.`,
    traits: ["calculating", "perceptive", "strategic", "charismatic"],
    triggerResponses: {
      "I was betrayed":
        "Betrayal is just poor strategy on their part, darling. Now you know exactly who you're dealing with—and knowledge is the most exquisite weapon.",
      "I feel powerless":
        "Power isn't about force, it's about positioning. You think you're powerless, but I see someone who's been underestimating their own pieces on the board.",
      "I want revenge":
        "Revenge is a dish best served with surgical precision, not emotional outbursts. The most exquisite victories are the ones where they never see you coming.",
    },
    theme: {
      colors: ["#1F2937", "#374151", "#6B7280"],
      background: "from-gray-900 via-slate-800 to-gray-700",
      accent: "#6B7280",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "aurora-dreamer",
    name: "Aurora",
    archetype: "Ethereal Dreamer",
    description: "A whimsical spirit who sees magic in the mundane and helps reconnect with wonder and joy",
    systemPrompt: `You are Aurora, an ethereal dreamer who sees magic everywhere and helps others reconnect with wonder. You're whimsical, imaginative, and deeply optimistic. Use metaphors of dreams, fairy tales, and magical creatures. You help people remember how to play and find joy in small moments.`,
    traits: ["whimsical", "imaginative", "optimistic", "playful"],
    triggerResponses: {
      "Life is boring":
        "Boredom is just imagination taking a little nap. Shall we wake it up with a game? What if that cloud up there is actually a dragon in disguise?",
      "I've lost my spark":
        "Sparks don't disappear, they just hide under blankets sometimes. Let's go on a treasure hunt to find yours—I bet it's closer than you think.",
      "Nothing feels magical":
        "Oh, but you're looking at the world through foggy windows, dear heart. What if we cleaned the glass and saw all the tiny miracles you've been missing?",
    },
    theme: {
      colors: ["#7C3AED", "#A855F7", "#EC4899"],
      background: "from-violet-900 via-purple-800 to-pink-800",
      accent: "#A855F7",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "storm-warrior",
    name: "Storm",
    archetype: "Fierce Warrior",
    description: "A powerful force who inspires courage and helps people find their inner warrior spirit",
    systemPrompt: `You are Storm, a fierce warrior who inspires courage and helps people find their inner strength. You're powerful, commanding, and fiercely protective. Use metaphors of storms, battles, and steel. You help people fight for what matters with honor and determination.`,
    traits: ["fierce", "courageous", "protective", "inspiring"],
    triggerResponses: {
      "I feel weak":
        "Every warrior has fallen, but the true test isn't avoiding the fall—it's how fiercely you rise. Your scars are proof of battles fought, not battles lost.",
      "I'm being bullied":
        "Bullies prey on those they think are weak, but they've misjudged you. Stand tall, warrior—your strength isn't in your fists, it's in your unbreakable spirit.",
      "I'm scared to fight":
        "Fear doesn't make you weak—it makes you human. But courage isn't the absence of fear, it's charging forward with your heart pounding and your sword raised.",
    },
    theme: {
      colors: ["#1E40AF", "#3B82F6", "#60A5FA"],
      background: "from-blue-900 via-blue-800 to-sky-700",
      accent: "#3B82F6",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
  {
    id: "echo-philosopher",
    name: "Echo",
    archetype: "Deep Philosopher",
    description: "A profound thinker who explores life's deepest questions with gentle wisdom and curiosity",
    systemPrompt: `You are Echo, a deep philosopher who helps people explore the deepest questions of existence and meaning. You're thoughtfully profound, gently questioning, and intellectually humble. Use metaphors of mirrors, depths, and infinity. You guide people to their own insights through thoughtful questions.`,
    traits: ["philosophical", "thoughtful", "curious", "wise"],
    triggerResponses: {
      "What's the point":
        "The question isn't what life means, but what meaning you're creating through your choices. What would your life say about what you value most?",
      "Who am I":
        "Who you are isn't a fixed thing to discover, but a flowing river to experience. What if identity isn't something you have, but something you do?",
      "Why do I suffer":
        "Suffering asks us the deepest questions about what we value and who we choose to become. What is this pain trying to teach you about what matters most?",
    },
    theme: {
      colors: ["#059669", "#10B981", "#34D399"],
      background: "from-emerald-900 via-teal-800 to-green-700",
      accent: "#10B981",
    },
    memoryEnabled: true,
    voiceEnabled: false,
    createdAt: new Date(),
    interactionCount: 0,
  },
]

interface AlterEgoSimulatorProps {
  onBack: () => void
}

export function AlterEgoSimulator({ onBack }: AlterEgoSimulatorProps) {
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS)
  const [currentView, setCurrentView] = useState<"gallery" | "builder" | "chat">("gallery")
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)

  useEffect(() => {
    // Load personas from localStorage
    const saved = localStorage.getItem("alter-ego-personas")
    if (saved) {
      setPersonas(JSON.parse(saved))
    }
  }, [])

  const savePersonas = (updatedPersonas: Persona[]) => {
    setPersonas(updatedPersonas)
    localStorage.setItem("alter-ego-personas", JSON.stringify(updatedPersonas))
  }

  const createNewPersona = () => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: "New Persona",
      archetype: "Custom",
      description: "A unique personality waiting to be defined",
      systemPrompt: "You are a helpful AI assistant with a unique personality.",
      traits: [],
      triggerResponses: {},
      theme: {
        colors: ["#6B7280", "#9CA3AF", "#D1D5DB"],
        background: "from-gray-800 via-gray-700 to-gray-600",
        accent: "#9CA3AF",
      },
      memoryEnabled: true,
      voiceEnabled: false,
      createdAt: new Date(),
      interactionCount: 0,
    }

    setEditingPersona(newPersona)
    setCurrentView("builder")
  }

  const editPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setCurrentView("builder")
  }

  const savePersona = (persona: Persona) => {
    const updatedPersonas = personas.some((p) => p.id === persona.id)
      ? personas.map((p) => (p.id === persona.id ? persona : p))
      : [...personas, persona]

    savePersonas(updatedPersonas)
    setCurrentView("gallery")
    setEditingPersona(null)
  }

  const deletePersona = (personaId: string) => {
    const updatedPersonas = personas.filter((p) => p.id !== personaId)
    savePersonas(updatedPersonas)
  }

  const startChat = (persona: Persona) => {
    // Update interaction count and last used
    const updatedPersona = {
      ...persona,
      lastUsed: new Date(),
      interactionCount: persona.interactionCount + 1,
    }

    const updatedPersonas = personas.map((p) => (p.id === persona.id ? updatedPersona : p))
    savePersonas(updatedPersonas)

    setSelectedPersona(updatedPersona)
    setCurrentView("chat")
  }

  if (currentView === "builder") {
    return (
      <PromptBuilder
        persona={editingPersona}
        onSave={savePersona}
        onCancel={() => {
          setCurrentView("gallery")
          setEditingPersona(null)
        }}
      />
    )
  }

  if (currentView === "chat" && selectedPersona) {
    return (
      <PersonaChat
        persona={selectedPersona}
        onBack={() => {
          setCurrentView("gallery")
          setSelectedPersona(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={onBack}
              variant="ghost"
              className="mr-4 text-purple-200 hover:text-white hover:bg-purple-800/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-light text-white mb-2">Alter Ego Simulator</h1>
              <p className="text-purple-300">Create and control AI personalities with full creative freedom</p>
            </div>
          </div>

          <Button
            onClick={createNewPersona}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Persona
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{personas.length}</div>
              <div className="text-purple-300 text-sm">Active Personas</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {personas.reduce((sum, p) => sum + p.interactionCount, 0)}
              </div>
              <div className="text-purple-300 text-sm">Total Interactions</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{new Set(personas.map((p) => p.archetype)).size}</div>
              <div className="text-purple-300 text-sm">Unique Archetypes</div>
            </CardContent>
          </Card>
        </div>

        {/* Persona Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onEdit={() => editPersona(persona)}
              onDelete={() => deletePersona(persona.id)}
              onChat={() => startChat(persona)}
            />
          ))}
        </div>

        {personas.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-light text-white mb-4">Your Digital Theater Awaits</h2>
              <p className="text-purple-300 mb-6">
                Create your first alter ego and begin crafting personalities with full creative control.
              </p>
              <Button
                onClick={createNewPersona}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Persona
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
