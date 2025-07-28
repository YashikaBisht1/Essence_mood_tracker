"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock, Eye, Star, ArrowLeft } from "lucide-react"
import type { Shadow } from "@/types/persona"

interface ShadowUnlockProps {
  onClose: () => void
  userPoints: number
  unlockedShadows: string[]
  onUnlockShadow: (shadowId: string) => void
  onSpendPoints: (points: number) => void
}

const shadows: Shadow[] = [
  {
    id: "procrastination",
    title: "The Procrastination Pattern",
    description: "Discover the hidden reasons behind your delays and avoidance behaviors.",
    cost: 50,
    insight:
      "Your procrastination often stems from perfectionism and fear of judgment. You delay tasks when you feel they won't meet your high standards.",
    unlocked: false,
  },
  {
    id: "relationships",
    title: "Relationship Shadows",
    description: "Uncover your unconscious patterns in relationships and connections.",
    cost: 75,
    insight:
      "You tend to give more than you receive in relationships, often neglecting your own needs to avoid conflict or abandonment.",
    unlocked: false,
  },
  {
    id: "self_worth",
    title: "Self-Worth Secrets",
    description: "Explore the deep-seated beliefs about your own value and worthiness.",
    cost: 100,
    insight:
      "Your self-worth is heavily tied to external achievements. You struggle to feel valuable when you're not being productive or praised.",
    unlocked: false,
  },
  {
    id: "creativity_blocks",
    title: "Creative Blockages",
    description: "Understand what truly stops your creative flow and expression.",
    cost: 60,
    insight:
      "Your creative blocks often arise from comparing yourself to others and fear of creating something 'not good enough'.",
    unlocked: false,
  },
  {
    id: "emotional_patterns",
    title: "Emotional Cycles",
    description: "Reveal your recurring emotional patterns and triggers.",
    cost: 80,
    insight:
      "You experience emotional cycles tied to your energy levels and social interactions. Solitude recharges you, but isolation depletes you.",
    unlocked: false,
  },
]

export function ShadowUnlock({
  onClose,
  userPoints,
  unlockedShadows,
  onUnlockShadow,
  onSpendPoints,
}: ShadowUnlockProps) {
  const [selectedShadow, setSelectedShadow] = useState<Shadow | null>(null)

  const handleUnlock = (shadow: Shadow) => {
    if (userPoints >= shadow.cost) {
      onSpendPoints(shadow.cost)
      onUnlockShadow(shadow.id)
      setSelectedShadow(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:bg-white/10 z-10 flex items-center"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Points display */}
      <div className="absolute top-6 left-6 z-10">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-purple-100 font-semibold">{userPoints}</span>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-4">
              Shadow Insights
            </h1>
            <p className="text-purple-200/80 text-lg">Unlock the hidden patterns that shape your inner world</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shadows.map((shadow) => {
              const isUnlocked = unlockedShadows.includes(shadow.id)
              const canAfford = userPoints >= shadow.cost

              return (
                <Card
                  key={shadow.id}
                  className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                    isUnlocked
                      ? "bg-purple-500/20 border-purple-400/40"
                      : "bg-black/30 border-purple-500/20 hover:border-purple-400/40"
                  }`}
                  onClick={() => setSelectedShadow(shadow)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-purple-100">
                      <span className="text-lg">{shadow.title}</span>
                      {isUnlocked ? (
                        <Unlock className="w-5 h-5 text-green-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-purple-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200/80 text-sm mb-4 leading-relaxed">{shadow.description}</p>

                    {isUnlocked ? (
                      <div className="bg-purple-800/30 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Eye className="w-4 h-4 text-purple-300 mr-2" />
                          <span className="text-purple-300 text-sm font-medium">Insight Unlocked</span>
                        </div>
                        <p className="text-purple-100 text-sm leading-relaxed">{shadow.insight}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-purple-200 text-sm">{shadow.cost} points</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!canAfford}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnlock(shadow)
                          }}
                          className={`${
                            canAfford
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Unlock
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
