"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Moon, ArrowLeft } from "lucide-react"

interface WeeklyRitualProps {
  onClose: () => void
}

export function WeeklyRitual({ onClose }: WeeklyRitualProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900 relative overflow-hidden">
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
        {[...Array(20)].map((_, i) => (
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
            <Sparkles className="w-3 h-3 text-emerald-300 opacity-40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Ritual Card */}
        <Card className="max-w-2xl w-full bg-black/30 backdrop-blur-sm border-emerald-500/30 overflow-hidden">
          <CardContent className="p-12 text-center">
            {/* Week summary icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-b from-emerald-400 to-indigo-500 flex items-center justify-center">
              <Moon className="w-12 h-12 text-white" />
            </div>

            {/* Week summary */}
            <h2 className="text-3xl font-serif text-emerald-100 mb-4">Weekly Revelation</h2>
            <p className="text-xl text-emerald-200 mb-8 italic">
              "Your week was a journey of self-discovery through the lens of your chosen personas."
            </p>

            {/* Mood map visualization */}
            <div className="mb-8">
              <div className="flex justify-center space-x-2 mb-4">
                {[7, 5, 8, 6, 9, 7, 8].map((mood, index) => (
                  <div
                    key={index}
                    className="w-8 h-16 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg opacity-80"
                    style={{ height: `${mood * 8}px` }}
                  />
                ))}
              </div>
              <p className="text-emerald-300 text-sm">Your emotional landscape this week</p>
            </div>

            {/* Ritual suggestion */}
            <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-serif text-emerald-100 mb-3">Suggested Ritual</h3>
              <p className="text-emerald-200 leading-relaxed">
                Create a sacred space with three candles representing Aurora, Scarleet, and Luna. Light each one while
                reflecting on how each persona has guided you this week. Write down one insight from each, then choose
                which energy you want to carry forward.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="text-emerald-300 italic text-lg mb-8">
              "The privilege of a lifetime is to become who you truly are."
              <footer className="text-emerald-400 text-sm mt-2">— Carl Jung</footer>
            </blockquote>

            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3"
            >
              Begin Ritual
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
