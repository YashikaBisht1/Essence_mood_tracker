"use client"

import { useState } from "react"
import { MoodBottle } from "./mood-bottle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Palette, Sparkles, Plus } from "lucide-react"

interface MoodBlenderProps {
  baseScents: any[]
  onMoodCreated: (mood: any) => void
  onBack: () => void
}

export function MoodBlender({ baseScents, onMoodCreated, onBack }: MoodBlenderProps) {
  const [selectedScents, setSelectedScents] = useState<any[]>([])
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [isBlending, setIsBlending] = useState(false)
  const [blendedScent, setBlendedScent] = useState<any>(null)

  const toggleScent = (scent: any) => {
    if (selectedScents.find((s) => s.id === scent.id)) {
      setSelectedScents(selectedScents.filter((s) => s.id !== scent.id))
    } else if (selectedScents.length < 3) {
      setSelectedScents([...selectedScents, scent])
    }
  }

  const generateBlend = () => {
    if (selectedScents.length === 0) return

    setIsBlending(true)

    // Simulate AI processing
    setTimeout(() => {
      const blendedColors = selectedScents.flatMap((s) => s.colors).slice(0, 3)
      const avgIntensity = selectedScents.reduce((sum, s) => sum + s.intensity, 0) / selectedScents.length
      const moods = selectedScents.map((s) => s.mood).join(" + ")

      // Generate AI-like name and description if not provided
      const aiName = customName || generateAIName(selectedScents)
      const aiDescription = customDescription || generateAIDescription(selectedScents)

      const newBlend = {
        id: `blend-${Date.now()}`,
        name: aiName,
        description: aiDescription,
        colors: blendedColors,
        mood: moods,
        intensity: avgIntensity,
        isCustom: true,
        components: selectedScents.map((s) => s.name),
      }

      setBlendedScent(newBlend)
      setIsBlending(false)
    }, 2000)
  }

  const generateAIName = (scents: any[]) => {
    const nameWords = [
      ["Whispered", "Velvet", "Moonlit", "Golden", "Ethereal", "Silk"],
      ["Dreams", "Echoes", "Mist", "Reverie", "Solace", "Harmony"],
    ]

    const word1 = nameWords[0][Math.floor(Math.random() * nameWords[0].length)]
    const word2 = nameWords[1][Math.floor(Math.random() * nameWords[1].length)]

    return `${word1} ${word2}`
  }

  const generateAIDescription = (scents: any[]) => {
    const templates = [
      "A delicate fusion where emotions dance together like silk in moonlight.",
      "Complex feelings intertwine, creating something beautifully undefined.",
      "Your heart speaks in layers—each one a different shade of truth.",
      "Like colors bleeding into watercolor, your emotions create something new.",
    ]

    return templates[Math.floor(Math.random() * templates.length)]
  }

  const saveBlend = () => {
    if (blendedScent) {
      onMoodCreated(blendedScent)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="ghost" className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-light text-gray-800 flex items-center">
              <Palette className="w-8 h-8 mr-3 text-pink-600" />
              Mood Blender
            </h1>
            <p className="text-gray-600">Create your own unique emotional essence</p>
          </div>
        </div>

        {isBlending ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="relative">
                {selectedScents.map((scent, index) => (
                  <div
                    key={scent.id}
                    className="absolute"
                    style={{
                      left: `${index * 20}px`,
                      zIndex: selectedScents.length - index,
                      animation: `blend-${index} 2s ease-in-out infinite`,
                    }}
                  >
                    <MoodBottle scent={scent} size="medium" />
                  </div>
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Blending your essence...</h2>
            <p className="text-gray-600 italic">AI is crafting something unique from your selected emotions</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-pink-200 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full animate-pulse"
                  style={{
                    animation: "fill 2s ease-in-out forwards",
                  }}
                />
              </div>
            </div>
          </div>
        ) : blendedScent ? (
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-700 mb-8">Your Custom Essence</h2>

            <div className="mb-8">
              <MoodBottle scent={blendedScent} size="large" showAnimation={true} />
            </div>

            <div className="max-w-md mx-auto mb-8">
              <h3 className="text-xl font-medium text-gray-800 mb-2">{blendedScent.name}</h3>
              <p className="text-gray-600 italic mb-4">{blendedScent.description}</p>

              <div className="text-sm text-gray-500 mb-4">Blended from: {blendedScent.components.join(", ")}</div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setBlendedScent(null)
                  setSelectedScents([])
                  setCustomName("")
                  setCustomDescription("")
                }}
                variant="outline"
                className="px-6 py-2"
              >
                Create Another
              </Button>
              <Button
                onClick={saveBlend}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Save This Essence
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-700 mb-4">Blend Your Emotions</h2>
              <p className="text-gray-600 italic">Select 2-3 base scents to create something uniquely yours</p>
            </div>

            {/* Base Scents Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Choose Base Scents ({selectedScents.length}/3)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {baseScents.map((scent) => (
                  <div
                    key={scent.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedScents.find((s) => s.id === scent.id)
                        ? "transform scale-105"
                        : selectedScents.length >= 3
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105"
                    }`}
                    onClick={() => toggleScent(scent)}
                  >
                    <MoodBottle
                      scent={scent}
                      size="medium"
                      isSelected={!!selectedScents.find((s) => s.id === scent.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Scents Preview */}
            {selectedScents.length > 0 && (
              <div className="mb-8 p-6 bg-white/40 rounded-2xl border border-pink-100">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Selected for Blending</h3>
                <div className="flex justify-center space-x-4 mb-4">
                  {selectedScents.map((scent, index) => (
                    <div key={scent.id} className="text-center">
                      <MoodBottle scent={scent} size="small" />
                      {index < selectedScents.length - 1 && <Plus className="w-4 h-4 text-gray-400 mx-2 mt-4" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Details */}
            {selectedScents.length > 0 && (
              <div className="mb-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Name (Optional)</label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Let AI suggest, or name it yourself..."
                    className="bg-white/50 border-pink-200 focus:bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Description (Optional)</label>
                  <Textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe how this blend feels, or let AI create poetry..."
                    className="bg-white/50 border-pink-200 focus:bg-white/80"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Blend Button */}
            {selectedScents.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={generateBlend}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Blend My Essence
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes blend-0 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(10px) rotate(5deg); }
        }
        @keyframes blend-1 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-5px) rotate(-3deg); }
        }
        @keyframes blend-2 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(8px) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
