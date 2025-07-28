"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Droplets, Sparkles, Moon, Save, ArrowLeft } from "lucide-react"
import type { MoodEntry } from "@/types/persona"

interface MoodJournalProps {
  onClose: () => void
  onAddPoints: (points: number) => void
}

const perfumes = [
  {
    id: "aurora",
    name: "Dawn's Embrace",
    scent: "Citrus & White Tea",
    icon: Droplets,
    color: "from-rose-400 to-orange-300",
  },
  {
    id: "scarleet",
    name: "Crimson Confidence",
    scent: "Rose & Amber",
    icon: Sparkles,
    color: "from-red-500 to-pink-400",
  },
  {
    id: "luna",
    name: "Midnight Mystery",
    scent: "Jasmine & Sandalwood",
    icon: Moon,
    color: "from-indigo-600 to-purple-500",
  },
]

export function MoodJournal({ onClose, onAddPoints }: MoodJournalProps) {
  const [mood, setMood] = useState([5])
  const [selectedPerfume, setSelectedPerfume] = useState("")
  const [notes, setNotes] = useState("")
  const [title, setTitle] = useState("")

  const handleSave = () => {
    if (!selectedPerfume || !notes.trim()) return

    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: mood[0],
      perfume: selectedPerfume,
      notes: notes.trim(),
    }

    // Save to localStorage
    const existingEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]")
    existingEntries.push(entry)
    localStorage.setItem("moodEntries", JSON.stringify(existingEntries))

    // Award points for journaling
    onAddPoints(5)
    onClose()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-900 relative overflow-hidden">
      {/* Close button - Fixed */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:bg-white/10 z-10 flex items-center"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <Card className="max-w-2xl w-full bg-black/30 backdrop-blur-sm border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-emerald-100 text-center">Mood Journal</CardTitle>
            <p className="text-emerald-200/80 text-center">Capture your essence through scent and reflection</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-emerald-200 text-sm mb-2 block">Entry Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Today's reflection..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Mood Slider */}
            <div>
              <label className="text-emerald-200 text-sm mb-2 block">Mood Level: {mood[0]}/10</label>
              <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-emerald-300/60 mt-1">
                <span>Low</span>
                <span>Balanced</span>
                <span>High</span>
              </div>
            </div>

            {/* Perfume Selection */}
            <div>
              <label className="text-emerald-200 text-sm mb-4 block">Choose Your Essence</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {perfumes.map((perfume) => (
                  <Card
                    key={perfume.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedPerfume === perfume.id
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedPerfume(perfume.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-16 h-20 mx-auto mb-3 rounded-full bg-gradient-to-b ${perfume.color} opacity-80 relative overflow-hidden`}
                      >
                        <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <perfume.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h4 className="text-emerald-100 font-medium text-sm">{perfume.name}</h4>
                      <p className="text-emerald-300/80 text-xs">{perfume.scent}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-emerald-200 text-sm mb-2 block">Reflection Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? What thoughts arise? Let your emotions flow..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!selectedPerfume || !notes.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Entry (+5 points)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
