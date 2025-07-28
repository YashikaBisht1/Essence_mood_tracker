"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Save, Plus, Trash2, ArrowLeft } from "lucide-react"
import { personas } from "@/lib/personas"

interface TrainingData {
  id: string
  type: "memory" | "value" | "preference"
  content: string
  importance: number
}

interface PersonaTrainingProps {
  onClose: () => void
}

export function PersonaTraining({ onClose }: PersonaTrainingProps) {
  const [selectedPersona, setSelectedPersona] = useState(personas[0].id)
  const [trainingData, setTrainingData] = useState<TrainingData[]>([])
  const [newTraining, setNewTraining] = useState({
    type: "memory" as const,
    content: "",
    importance: 5,
  })

  const addTrainingData = () => {
    if (!newTraining.content.trim()) return

    const training: TrainingData = {
      id: Date.now().toString(),
      type: newTraining.type,
      content: newTraining.content.trim(),
      importance: newTraining.importance,
    }

    setTrainingData((prev) => [...prev, training])
    setNewTraining({ type: "memory", content: "", importance: 5 })
  }

  const removeTrainingData = (id: string) => {
    setTrainingData((prev) => prev.filter((item) => item.id !== id))
  }

  const saveTraining = () => {
    // Save training data to localStorage
    const key = `persona_training_${selectedPersona}`
    localStorage.setItem(key, JSON.stringify(trainingData))
    onClose()
  }

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona)

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h2 className="text-2xl font-serif text-emerald-100">Persona Training</h2>
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
        {/* Persona Selection */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Select Persona to Train
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPersona === persona.id
                      ? "border-emerald-400 bg-emerald-500/20"
                      : "border-slate-600 bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedPersona(persona.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center`}
                    >
                      <span className="text-xl">{persona.emoji}</span>
                    </div>
                    <h4 className="text-emerald-100 font-medium">{persona.name}</h4>
                    <p className="text-emerald-300/80 text-sm">{persona.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Training Data */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100">Add Training Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-emerald-200 text-sm mb-2 block">Type</label>
                <select
                  value={newTraining.type}
                  onChange={(e) => setNewTraining((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-slate-800 border-slate-600 text-emerald-100 rounded-md p-2"
                >
                  <option value="memory">Memory</option>
                  <option value="value">Value</option>
                  <option value="preference">Preference</option>
                </select>
              </div>
              <div>
                <label className="text-emerald-200 text-sm mb-2 block">Importance (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTraining.importance}
                  onChange={(e) => setNewTraining((prev) => ({ ...prev, importance: Number.parseInt(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="text-emerald-200 text-sm mb-2 block">Content</label>
              <Textarea
                value={newTraining.content}
                onChange={(e) => setNewTraining((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter memory, value, or preference to train the persona..."
                className="bg-slate-800 border-slate-600 text-emerald-100"
              />
            </div>

            <Button onClick={addTrainingData} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Training Data
            </Button>
          </CardContent>
        </Card>

        {/* Training Data List */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-100">Training Data for {selectedPersonaData?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {trainingData.length === 0 ? (
              <p className="text-emerald-200/60 text-center py-8">No training data added yet.</p>
            ) : (
              <div className="space-y-4">
                {trainingData.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.type === "memory"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : item.type === "value"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-purple-500/20 text-purple-300"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-emerald-300 text-xs">Importance: {item.importance}/10</span>
                          </div>
                          <p className="text-emerald-100 text-sm">{item.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrainingData(item.id)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={saveTraining}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Training Data
          </Button>
        </div>
      </div>
    </div>
  )
}
