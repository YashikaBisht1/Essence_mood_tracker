"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Droplets, Moon, Star, BookOpen } from "lucide-react"
import type { Persona } from "@/types/persona"

interface HeroSectionProps {
  personas: Persona[]
  onSelectPersona: (persona: Persona) => void
  userPoints: number
  onShowMoodJournal: () => void
}

export function HeroSection({ personas, onSelectPersona, userPoints, onShowMoodJournal }: HeroSectionProps) {
  const [currentBg, setCurrentBg] = useState(0)

  const backgrounds = [
    "bg-gradient-to-br from-emerald-900 via-slate-900 to-amber-900",
    "bg-gradient-to-br from-rose-900 via-slate-900 to-purple-900",
    "bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgrounds[currentBg]} relative overflow-hidden`}>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
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
            <Sparkles className="w-2 h-2 text-emerald-300 opacity-60" />
          </div>
        ))}
      </div>

      {/* Points display */}
      <div className="absolute top-6 right-6 z-10">
        <Card className="bg-black/20 backdrop-blur-sm border-emerald-500/20">
          <CardContent className="p-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-emerald-100 font-semibold">{userPoints}</span>
          </CardContent>
        </Card>
      </div>

      {/* Mood Journal Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          onClick={onShowMoodJournal}
          className="bg-emerald-600/80 hover:bg-emerald-500/80 text-white backdrop-blur-sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Mood Journal
        </Button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Main Title */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-rose-300 mb-6 tracking-wide">
            Essence
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 font-light tracking-wide leading-relaxed mb-4">
            Your scent, your story. Let your mood bloom through your chosen alter ego.
          </p>
          <p className="text-lg text-emerald-200/80 font-light italic">
            Discover your inner fragrance through AI-powered personas
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mt-8"></div>
        </div>

        {/* Persona Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          {personas.map((persona, index) => (
            <Card
              key={persona.id}
              className="group relative overflow-hidden bg-black/20 backdrop-blur-sm border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => onSelectPersona(persona)}
            >
              <CardContent className="p-8 text-center relative">
                {/* Perfume bottle visualization */}
                <div
                  className={`w-24 h-32 mx-auto mb-6 rounded-full bg-gradient-to-b ${persona.color} opacity-80 relative overflow-hidden group-hover:opacity-100 transition-opacity duration-300`}
                >
                  <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                      {persona.emoji}
                    </div>
                  </div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg"></div>
                </div>

                <h3 className="text-2xl font-serif text-emerald-100 mb-2">{persona.name}</h3>
                <p className="text-emerald-300 font-light mb-2">{persona.title}</p>
                <p className="text-emerald-400/80 text-sm mb-4">Age: {persona.age}</p>
                <p className="text-sm text-emerald-200/80 mb-6 leading-relaxed">{persona.description}</p>

                <div className="text-xs text-emerald-300/60 italic mb-6">"{persona.tagline}"</div>

                {/* Persona details preview */}
                <div className="text-xs text-emerald-200/60 mb-6 space-y-1">
                  <p>Specialty: {persona.role}</p>
                  <p>Hobbies: {persona.hobbies.slice(0, 2).join(", ")}</p>
                </div>

                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-none font-light tracking-wide group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                  Enter Ritual
                </Button>

                {/* Floating accent */}
                <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
                  {index === 0 && <Droplets className="w-5 h-5 text-rose-300" />}
                  {index === 1 && <Sparkles className="w-5 h-5 text-red-300" />}
                  {index === 2 && <Moon className="w-5 h-5 text-indigo-300" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subtle footer */}
        <div className="mt-16 text-center">
          <p className="text-emerald-200/40 text-sm font-light tracking-widest">CRAFTED FOR THE SOUL</p>
          <p className="text-emerald-200/30 text-xs mt-2">Powered by Advanced AI Personas</p>
        </div>
      </div>
    </div>
  )
}
