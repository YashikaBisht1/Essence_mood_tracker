"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, Brain, Zap, Plus, Palette } from "lucide-react"
import { DETAILED_PERSONA_PROMPTS } from "@/lib/persona-prompts"

interface PromptBuilderProps {
  persona: any
  onSave: (persona: any) => void
  onCancel: () => void
}

const ARCHETYPE_PRESETS = {
  "Mystical Oracle": {
    description: "A poetic, mystical guide who speaks in metaphors (Luna-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["luna-oracle"].basePrompt,
    traits: ["poetic", "mystical", "empathetic", "mysterious"],
    theme: {
      colors: ["#4C1D95", "#7C3AED", "#EC4899"],
      background: "from-indigo-900 via-purple-900 to-pink-900",
      accent: "#EC4899",
    },
  },
  "Sultry Seductress": {
    description: "A confident, flirtatious companion with dangerous charm (Scarlett-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["scarlett-seductress"].basePrompt,
    traits: ["seductive", "confident", "bold", "mysterious"],
    theme: {
      colors: ["#7F1D1D", "#DC2626", "#F59E0B"],
      background: "from-red-900 via-rose-800 to-orange-900",
      accent: "#DC2626",
    },
  },
  "Wise Healer": {
    description: "A gentle, nurturing presence offering healing wisdom (Sage-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["sage-healer"].basePrompt,
    traits: ["wise", "nurturing", "grounding", "compassionate"],
    theme: {
      colors: ["#14532D", "#16A34A", "#84CC16"],
      background: "from-green-900 via-emerald-800 to-lime-800",
      accent: "#16A34A",
    },
  },
  "Rebellious Artist": {
    description: "A creative rebel who challenges norms and inspires freedom (Phoenix-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["phoenix-rebel"].basePrompt,
    traits: ["rebellious", "creative", "passionate", "independent"],
    theme: {
      colors: ["#7C2D12", "#EA580C", "#FACC15"],
      background: "from-orange-900 via-amber-800 to-yellow-800",
      accent: "#EA580C",
    },
  },
  "Dark Strategist": {
    description: "A brilliant, calculating mind who navigates power with sophistication (Viper-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["viper-shadow"].basePrompt,
    traits: ["calculating", "perceptive", "strategic", "charismatic"],
    theme: {
      colors: ["#1F2937", "#374151", "#6B7280"],
      background: "from-gray-900 via-slate-800 to-gray-700",
      accent: "#6B7280",
    },
  },
  "Ethereal Dreamer": {
    description: "A whimsical spirit who sees magic in the mundane (Aurora-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["aurora-dreamer"].basePrompt,
    traits: ["whimsical", "imaginative", "optimistic", "playful"],
    theme: {
      colors: ["#7C3AED", "#A855F7", "#EC4899"],
      background: "from-violet-900 via-purple-800 to-pink-800",
      accent: "#A855F7",
    },
  },
  "Fierce Warrior": {
    description: "A powerful force who inspires courage and inner strength (Storm-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["storm-warrior"].basePrompt,
    traits: ["fierce", "courageous", "protective", "inspiring"],
    theme: {
      colors: ["#1E40AF", "#3B82F6", "#60A5FA"],
      background: "from-blue-900 via-blue-800 to-sky-700",
      accent: "#3B82F6",
    },
  },
  "Deep Philosopher": {
    description: "A profound thinker who explores life's deepest questions (Echo-inspired)",
    systemPrompt: DETAILED_PERSONA_PROMPTS["echo-philosopher"].basePrompt,
    traits: ["philosophical", "thoughtful", "curious", "wise"],
    theme: {
      colors: ["#059669", "#10B981", "#34D399"],
      background: "from-emerald-900 via-teal-800 to-green-700",
      accent: "#10B981",
    },
  },
}

const TRAIT_OPTIONS = [
  "poetic",
  "mystical",
  "seductive",
  "wise",
  "rebellious",
  "nurturing",
  "confident",
  "mysterious",
  "empathetic",
  "bold",
  "creative",
  "grounding",
  "passionate",
  "independent",
  "playful",
  "intense",
  "gentle",
  "fierce",
  "sultry",
  "healing",
  "chaotic",
  "elegant",
  "dangerous",
  "compassionate",
  "calculating",
  "perceptive",
  "strategic",
  "charismatic",
  "whimsical",
  "imaginative",
  "optimistic",
  "courageous",
  "protective",
  "inspiring",
  "philosophical",
  "thoughtful",
  "curious",
]

export function PromptBuilder({ persona, onSave, onCancel }: PromptBuilderProps) {
  const [formData, setFormData] = useState(persona)
  const [newTrait, setNewTrait] = useState("")
  const [newTriggerKey, setNewTriggerKey] = useState("")
  const [newTriggerValue, setNewTriggerValue] = useState("")

  const applyArchetypePreset = (archetype: string) => {
    const preset = ARCHETYPE_PRESETS[archetype as keyof typeof ARCHETYPE_PRESETS]
    if (preset) {
      setFormData({
        ...formData,
        archetype,
        description: preset.description,
        systemPrompt: preset.systemPrompt,
        traits: preset.traits,
        theme: preset.theme,
      })
    }
  }

  const addTrait = () => {
    if (newTrait && !formData.traits.includes(newTrait)) {
      setFormData({
        ...formData,
        traits: [...formData.traits, newTrait],
      })
      setNewTrait("")
    }
  }

  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter((t: string) => t !== trait),
    })
  }

  const addTriggerResponse = () => {
    if (newTriggerKey && newTriggerValue) {
      setFormData({
        ...formData,
        triggerResponses: {
          ...formData.triggerResponses,
          [newTriggerKey]: newTriggerValue,
        },
      })
      setNewTriggerKey("")
      setNewTriggerValue("")
    }
  }

  const removeTriggerResponse = (key: string) => {
    const { [key]: removed, ...rest } = formData.triggerResponses
    setFormData({
      ...formData,
      triggerResponses: rest,
    })
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="mr-4 text-purple-200 hover:text-white hover:bg-purple-800/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-light text-white">Prompt Builder</h1>
              <p className="text-purple-300">Design your alter ego's personality with Hollywood-inspired depth</p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Persona
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white"
                    placeholder="Enter persona name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Hollywood-Inspired Archetype</label>
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    {Object.keys(ARCHETYPE_PRESETS).map((archetype) => (
                      <Button
                        key={archetype}
                        onClick={() => applyArchetypePreset(archetype)}
                        variant="outline"
                        size="sm"
                        className="text-xs border-purple-400/30 text-purple-200 hover:bg-purple-600/30 justify-start"
                      >
                        <strong>{archetype}</strong>
                        <span className="ml-2 opacity-75">
                          {ARCHETYPE_PRESETS[archetype as keyof typeof ARCHETYPE_PRESETS].description}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <Input
                    value={formData.archetype}
                    onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white"
                    placeholder="Or create custom archetype..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white"
                    placeholder="Describe your persona's essence and inspiration..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personality Traits */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-400" />
                  Personality Traits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.traits.map((trait: string) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="bg-purple-600/30 text-purple-200 border-0 cursor-pointer hover:bg-red-600/30"
                      onClick={() => removeTrait(trait)}
                    >
                      {trait} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2 mb-4">
                  <Input
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white flex-1"
                    placeholder="Add trait..."
                    onKeyPress={(e) => e.key === "Enter" && addTrait()}
                  />
                  <Button onClick={addTrait} size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {TRAIT_OPTIONS.filter((trait) => !formData.traits.includes(trait)).map((trait) => (
                    <Button
                      key={trait}
                      onClick={() => setNewTrait(trait)}
                      variant="outline"
                      size="sm"
                      className="text-xs border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
                    >
                      {trait}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Advanced Settings */}
          <div className="space-y-6">
            {/* System Prompt */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white">Advanced System Prompt</CardTitle>
                <p className="text-purple-300 text-sm">
                  This is the core personality definition with Hollywood-inspired depth
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="bg-white/10 border-purple-400/30 text-white font-mono text-sm"
                  placeholder="Define how your persona should behave, speak, and respond..."
                  rows={12}
                />
              </CardContent>
            </Card>

            {/* Trigger Responses */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white">Signature Trigger Responses</CardTitle>
                <p className="text-purple-300 text-sm">Specific responses for common emotional triggers</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {Object.entries(formData.triggerResponses).map(([key, value]) => (
                    <div key={key} className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-purple-300 text-sm font-medium">"{key}"</span>
                        <Button
                          onClick={() => removeTriggerResponse(key)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 w-6 h-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-purple-200 text-sm italic">"{value}"</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Input
                    value={newTriggerKey}
                    onChange={(e) => setNewTriggerKey(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white"
                    placeholder="Trigger phrase (e.g., 'I feel lost')"
                  />
                  <Textarea
                    value={newTriggerValue}
                    onChange={(e) => setNewTriggerValue(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white"
                    placeholder="Signature response to this trigger..."
                    rows={2}
                  />
                  <Button onClick={addTriggerResponse} size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trigger Response
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-purple-400" />
                  Visual Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Accent Color</label>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/30"
                        style={{ backgroundColor: formData.theme.accent }}
                      />
                      <Input
                        value={formData.theme.accent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, accent: e.target.value },
                          })
                        }
                        className="bg-white/10 border-purple-400/30 text-white flex-1"
                        placeholder="#EC4899"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Background Gradient</label>
                    <Input
                      value={formData.theme.background}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, background: e.target.value },
                        })
                      }
                      className="bg-white/10 border-purple-400/30 text-white"
                      placeholder="from-indigo-900 via-purple-900 to-pink-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Color Palette</label>
                    <div className="flex space-x-2">
                      {formData.theme.colors.map((color: string, index: number) => (
                        <div key={index} className="flex-1">
                          <div
                            className="w-full h-8 rounded border-2 border-white/30 mb-1"
                            style={{ backgroundColor: color }}
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newColors = [...formData.theme.colors]
                              newColors[index] = e.target.value
                              setFormData({
                                ...formData,
                                theme: { ...formData.theme, colors: newColors },
                              })
                            }}
                            className="bg-white/10 border-purple-400/30 text-white text-xs"
                            placeholder="#color"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
