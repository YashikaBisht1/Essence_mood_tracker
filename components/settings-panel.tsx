"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Brain, Moon, Eye, Trash2, ArrowLeft } from "lucide-react"
import { personas } from "@/lib/personas"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [memoryWeights, setMemoryWeights] = useState({
    aurora: [7],
    scarleet: [8],
    luna: [6],
  })

  const [sleepModes, setSleepModes] = useState({
    aurora: false,
    scarleet: false,
    luna: false,
  })

  const [memoryAccess, setMemoryAccess] = useState({
    aurora: ["spiritual_practices", "morning_routines", "emotional_healing"],
    scarleet: ["confidence_building", "career_goals", "public_speaking"],
    luna: ["shadow_work", "dreams", "deep_emotions", "secrets"],
  })

  const clearConversationHistory = (personaId: string) => {
    localStorage.removeItem(`conversation_${personaId}`)
    // You could add a toast notification here
  }

  const clearAllData = () => {
    personas.forEach((persona) => {
      localStorage.removeItem(`conversation_${persona.id}`)
      localStorage.removeItem(`persona_training_${persona.id}`)
    })
    localStorage.removeItem("userPoints")
    localStorage.removeItem("unlockedShadows")
    localStorage.removeItem("moodEntries")
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h2 className="text-2xl font-serif text-emerald-100">Memory & Persona Settings</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-emerald-300 hover:bg-emerald-500/10 flex items-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Memory Training Panel */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Memory Training Weights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {personas.map((persona) => (
              <div key={persona.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center`}
                    >
                      <span className="text-sm">{persona.emoji}</span>
                    </div>
                    <div>
                      <span className="text-emerald-200">{persona.name}</span>
                      <p className="text-emerald-300/60 text-xs">{persona.role}</p>
                    </div>
                  </div>
                  <span className="text-emerald-300 text-sm">
                    Weight: {memoryWeights[persona.id as keyof typeof memoryWeights][0]}
                  </span>
                </div>
                <Slider
                  value={memoryWeights[persona.id as keyof typeof memoryWeights]}
                  onValueChange={(value) => setMemoryWeights((prev) => ({ ...prev, [persona.id]: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Memory Access Control */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Selective Memory Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {personas.map((persona) => (
              <div key={persona.id} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center`}
                  >
                    <span className="text-xs">{persona.emoji}</span>
                  </div>
                  <span className="text-emerald-200 font-medium">{persona.name}</span>
                </div>
                <div className="ml-9 flex flex-wrap gap-2">
                  {memoryAccess[persona.id as keyof typeof memoryAccess].map((access, index) => (
                    <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                      {access.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sleep Mode Controls */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100 flex items-center">
              <Moon className="w-5 h-5 mr-2" />
              Persona Sleep Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {personas.map((persona) => (
              <div key={persona.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center ${
                      sleepModes[persona.id as keyof typeof sleepModes] ? "opacity-50" : ""
                    }`}
                  >
                    <span className="text-sm">{persona.emoji}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200">{persona.name}</span>
                    <p className="text-emerald-300/60 text-xs">
                      {sleepModes[persona.id as keyof typeof sleepModes] ? "Sleeping" : "Active"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={sleepModes[persona.id as keyof typeof sleepModes]}
                  onCheckedChange={(checked) => setSleepModes((prev) => ({ ...prev, [persona.id]: checked }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((persona) => (
                <Button
                  key={persona.id}
                  variant="outline"
                  onClick={() => clearConversationHistory(persona.id)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear {persona.name} History
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={clearAllData}
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data (Irreversible)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Training History */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100">Recent Training History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Luna learned about your creative process and shadow work preferences (2 days ago)",
                "Aurora adapted to your morning meditation routine and spiritual practices (3 days ago)",
                "Scarleet updated confidence triggers and power affirmation preferences (5 days ago)",
                "Memory sync completed for all personas with new conversation patterns (1 week ago)",
              ].map((entry, index) => (
                <div key={index} className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-emerald-200 text-sm">{entry}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
