"use client"

import { useState } from "react"
import { MoodBottle } from "./mood-bottle"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles } from "lucide-react"

interface MoodRitualProps {
  scents: any[]
  onMoodSelected: (mood: any) => void
  onBack: () => void
  existingMood?: any
}

export function MoodRitual({ scents, onMoodSelected, onBack, existingMood }: MoodRitualProps) {
  const [selectedScent, setSelectedScent] = useState<any>(existingMood || null)
  const [personalNote, setPersonalNote] = useState(existingMood?.note || "")
  const [showSpray, setShowSpray] = useState(false)

  const handleSprayMood = () => {
    if (!selectedScent) return

    setShowSpray(true)

    setTimeout(() => {
      onMoodSelected({
        ...selectedScent,
        note: personalNote,
        sprayedAt: new Date().toISOString(),
      })
      setShowSpray(false)
    }, 3000)
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="ghost" className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-light text-gray-800">Daily Ritual</h1>
            <p className="text-gray-600">{today}</p>
          </div>
        </div>

        {existingMood && !showSpray && (
          <div className="mb-8 p-6 bg-white/50 rounded-2xl border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-purple-700 font-medium">Today's essence has been captured</span>
            </div>
            <p className="text-gray-600">You can update your mood or add a personal note below.</p>
          </div>
        )}

        {showSpray ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <MoodBottle scent={selectedScent} size="large" showAnimation={true} />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Spraying {selectedScent.name}...</h2>
            <p className="text-gray-600 italic max-w-md mx-auto">{selectedScent.description}</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-purple-200 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full animate-pulse"
                  style={{
                    animation: "fill 3s ease-in-out forwards",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Instruction */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-light text-gray-700 mb-4">How does your soul smell today?</h2>
              <p className="text-gray-600 italic">Choose the essence that captures your inner world</p>
            </div>

            {/* Scent Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
              {scents.map((scent) => (
                <div key={scent.id} className="text-center">
                  <MoodBottle
                    scent={scent}
                    size="medium"
                    onClick={() => setSelectedScent(scent)}
                    isSelected={selectedScent?.id === scent.id}
                  />
                  {selectedScent?.id === scent.id && (
                    <div className="mt-4 p-4 bg-white/60 rounded-xl border border-purple-100">
                      <p className="text-sm text-gray-700 italic">{scent.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Personal Note */}
            {selectedScent && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Personal Note (Optional)</label>
                <Textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add your own words to this moment..."
                  className="w-full p-4 border border-purple-200 rounded-xl bg-white/50 focus:bg-white/80 transition-all duration-300"
                  rows={3}
                />
              </div>
            )}

            {/* Spray Button */}
            {selectedScent && (
              <div className="text-center">
                <Button
                  onClick={handleSprayMood}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Spray Your Essence
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
      `}</style>
    </div>
  )
}
