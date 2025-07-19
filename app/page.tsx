"use client"

import { useState, useEffect } from "react"
import { MoodBottle } from "@/components/mood-bottle"
import { MoodRitual } from "@/components/mood-ritual"
import { MoodCollection } from "@/components/mood-collection"
import { MoodBlender } from "@/components/mood-blender"
import { LunaCompanion } from "@/components/luna-companion"
import { AlterEgoSimulator } from "@/components/alter-ego-simulator"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Palette, Moon, Users } from "lucide-react"

const PRESET_SCENTS = [
  {
    id: "amber-solitude",
    name: "Amber Solitude",
    description: "You feel warm yet distant—like candlelight in an empty cathedral.",
    colors: ["#D4A574", "#B8860B", "#CD853F"],
    mood: "contemplative",
    intensity: 0.7,
  },
  {
    id: "jasmine-chaos",
    name: "Jasmine Chaos",
    description: "Sweet overwhelm blooms in your chest—beautiful but untamed.",
    colors: ["#E6E6FA", "#DDA0DD", "#9370DB"],
    mood: "overwhelmed",
    intensity: 0.9,
  },
  {
    id: "rain-rebellion",
    name: "Rain & Rebellion",
    description: "Storm clouds gather in your soul—you are lightning waiting to strike.",
    colors: ["#708090", "#2F4F4F", "#4682B4"],
    mood: "defiant",
    intensity: 0.8,
  },
  {
    id: "moonlight-ache",
    name: "Moonlight Ache",
    description: "You feel light, soft, and far away—like the moon forgot your name.",
    colors: ["#F0F8FF", "#E6E6FA", "#B0C4DE"],
    mood: "melancholic",
    intensity: 0.5,
  },
  {
    id: "golden-clarity",
    name: "Golden Clarity",
    description: "Sunlight cuts through fog—you see everything with perfect understanding.",
    colors: ["#FFD700", "#FFA500", "#FF8C00"],
    mood: "enlightened",
    intensity: 0.6,
  },
  {
    id: "velvet-joy",
    name: "Velvet Joy",
    description: "Happiness wraps around you like silk—soft, luxurious, and complete.",
    colors: ["#FF69B4", "#FFB6C1", "#FFC0CB"],
    mood: "blissful",
    intensity: 0.8,
  },
]

export default function EssenceApp() {
  const [currentView, setCurrentView] = useState<"home" | "ritual" | "collection" | "blender" | "luna" | "simulator">(
    "home",
  )
  const [todaysMood, setTodaysMood] = useState<any>(null)
  const [moodHistory, setMoodHistory] = useState<any[]>([])

  useEffect(() => {
    // Load saved moods from localStorage
    const saved = localStorage.getItem("essence-moods")
    if (saved) {
      setMoodHistory(JSON.parse(saved))
    }

    // Check if today's mood is already set
    const today = new Date().toDateString()
    const todayMood = JSON.parse(saved || "[]").find((mood: any) => new Date(mood.date).toDateString() === today)
    if (todayMood) {
      setTodaysMood(todayMood)
    }
  }, [])

  const saveMood = (mood: any) => {
    const newMood = {
      ...mood,
      date: new Date().toISOString(),
      id: Date.now(),
    }

    const updated = [
      ...moodHistory.filter((m) => new Date(m.date).toDateString() !== new Date().toDateString()),
      newMood,
    ]

    setMoodHistory(updated)
    setTodaysMood(newMood)
    localStorage.setItem("essence-moods", JSON.stringify(updated))
  }

  if (currentView === "ritual") {
    return (
      <MoodRitual
        scents={PRESET_SCENTS}
        onMoodSelected={saveMood}
        onBack={() => setCurrentView("home")}
        existingMood={todaysMood}
      />
    )
  }

  if (currentView === "collection") {
    return <MoodCollection moods={moodHistory} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "blender") {
    return <MoodBlender baseScents={PRESET_SCENTS} onMoodCreated={saveMood} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "luna") {
    return (
      <LunaCompanion onBack={() => setCurrentView("home")} userMoodHistory={moodHistory} currentMood={todaysMood} />
    )
  }

  if (currentView === "simulator") {
    return <AlterEgoSimulator onBack={() => setCurrentView("home")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-gray-800 mb-4 tracking-wide">Essence</h1>
          <p className="text-lg text-gray-600 italic max-w-2xl mx-auto">
            "Not every feeling needs a word. Some need a scent."
          </p>
        </div>

        {/* Today's Mood Display */}
        {todaysMood && (
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-light text-gray-700 mb-6">Today's Essence</h2>
            <div className="flex justify-center">
              <MoodBottle scent={todaysMood} size="large" showAnimation={true} />
            </div>
            <div className="mt-6 max-w-md mx-auto">
              <h3 className="text-xl font-medium text-gray-800 mb-2">{todaysMood.name}</h3>
              <p className="text-gray-600 italic">{todaysMood.description}</p>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Button
            onClick={() => setCurrentView("ritual")}
            className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 border-0 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <Sparkles className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Daily Ritual</div>
              <div className="text-sm opacity-75">Spray your mood</div>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView("collection")}
            className="h-32 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 border-0 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <BookOpen className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Collection</div>
              <div className="text-sm opacity-75">Your mood library</div>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView("blender")}
            className="h-32 bg-gradient-to-br from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 text-pink-800 border-0 flex flex-col items-center justify-center space-y-3 transition-all duration-300"
          >
            <Palette className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Mood Blender</div>
              <div className="text-sm opacity-75">Create custom essence</div>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView("luna")}
            className="h-32 bg-gradient-to-br from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-800 border-0 flex flex-col items-center justify-center space-y-3 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            <Moon className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Luna</div>
              <div className="text-sm opacity-75">Mystical companion</div>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView("simulator")}
            className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 border-0 flex flex-col items-center justify-center space-y-3 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <Users className="w-8 h-8" />
            <div className="text-center">
              <div className="font-medium">Alter Egos</div>
              <div className="text-sm opacity-75">Creator mode</div>
            </div>
          </Button>
        </div>

        {/* Recent Moods Preview */}
        {moodHistory.length > 0 && (
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-700 mb-6">Recent Essences</h2>
            <div className="flex justify-center space-x-4 overflow-x-auto pb-4">
              {moodHistory
                .slice(-5)
                .reverse()
                .map((mood) => (
                  <div key={mood.id} className="flex-shrink-0">
                    <MoodBottle scent={mood} size="small" />
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {new Date(mood.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Welcome Message for New Users */}
        {moodHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-light text-gray-700 mb-4">Welcome to Essence</h2>
              <p className="text-gray-600 mb-6">
                Begin your journey of emotional discovery. Each day, choose a scent that captures your inner world.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentView("ritual")}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 w-full"
                >
                  Start Your First Ritual
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setCurrentView("luna")}
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-4 py-3"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Meet Luna
                  </Button>
                  <Button
                    onClick={() => setCurrentView("simulator")}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Create Personas
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
