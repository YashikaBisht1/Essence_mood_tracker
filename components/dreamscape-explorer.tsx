"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Cloud, Sparkles, Lightbulb, MessageCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface DreamscapeExplorerProps {
  onClose: () => void
  onAddPoints: (points: number) => void
}

export function DreamscapeExplorer({ onClose, onAddPoints }: DreamscapeExplorerProps) {
  const [dreamInput, setDreamInput] = useState("")
  const [reflection, setReflection] = useState("")
  const [insight, setInsight] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyzeDream = () => {
    if (!dreamInput.trim()) {
      toast.error("Please describe your dream or inner child experience.")
      return
    }

    setIsLoading(true)
    setInsight("")
    setReflection("")

    // Simulate AI analysis
    setTimeout(() => {
      const generatedInsight = `Your dream suggests a desire for freedom and exploration. The recurring element might represent an unresolved feeling from your past. Consider what aspects of your inner child might be seeking expression.`
      const generatedReflection = `Reflect on moments in your childhood where you felt similar emotions or encountered similar symbols. What message might your subconscious be trying to send you?`

      setInsight(generatedInsight)
      setReflection(generatedReflection)
      onAddPoints(10) // Award points for deep reflection
      toast.success("Dreamscape analyzed! +10 points for inner exploration.")
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Close button - Fixed */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:bg-white/10 z-10 flex items-center"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-purple-300 opacity-60" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <Card className="max-w-2xl w-full bg-black/30 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-purple-100 text-center flex items-center justify-center">
              <Cloud className="w-6 h-6 mr-2" />
              Dreamscape Explorer
            </CardTitle>
            <p className="text-purple-200/80 text-center">
              Journey into your subconscious and connect with your inner child.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dream Input */}
            <div>
              <label className="text-purple-200 text-sm mb-2 block">
                Describe your dream or inner child experience:
              </label>
              <Textarea
                value={dreamInput}
                onChange={(e) => setDreamInput(e.target.value)}
                placeholder="What did you see, feel, or experience? What memories surfaced?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[150px]"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleAnalyzeDream}
              disabled={isLoading || !dreamInput.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing Dreamscape...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Analyze Dreamscape
                </>
              )}
            </Button>

            {/* Insights */}
            {insight && (
              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-100 text-sm flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Your Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm leading-relaxed">{insight}</p>
                </CardContent>
              </Card>
            )}

            {/* Reflection */}
            {reflection && (
              <Card className="bg-indigo-900/20 border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-indigo-100 text-sm flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Reflection Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-indigo-200 text-sm leading-relaxed">{reflection}</p>
                </CardContent>
              </Card>
            )}

            {insight && (
              <div className="text-center text-purple-300 text-sm mt-4">You earned 10 points for this deep dive!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
