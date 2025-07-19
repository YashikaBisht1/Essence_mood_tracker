"use client"

import { useState } from "react"
import { MoodBottle } from "./mood-bottle"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, BookOpen } from "lucide-react"

interface MoodCollectionProps {
  moods: any[]
  onBack: () => void
}

export function MoodCollection({ moods, onBack }: MoodCollectionProps) {
  const [selectedMood, setSelectedMood] = useState<any>(null)

  const groupedMoods = moods.reduce(
    (acc, mood) => {
      const date = new Date(mood.date).toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(mood)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const sortedDates = Object.keys(groupedMoods).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="ghost" className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-light text-gray-800 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-amber-600" />
              Your Collection
            </h1>
            <p className="text-gray-600">A library of your emotional essences</p>
          </div>
        </div>

        {moods.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-light text-gray-700 mb-4">Your collection awaits</h2>
              <p className="text-gray-600 mb-6">
                Start your daily ritual to begin building your personal essence library.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="bg-white/40 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-800">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                    </div>

                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {groupedMoods[date].map((mood) => (
                        <div
                          key={mood.id}
                          className="flex-shrink-0 cursor-pointer"
                          onClick={() => setSelectedMood(mood)}
                        >
                          <MoodBottle scent={mood} size="medium" isSelected={selectedMood?.id === mood.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {selectedMood ? (
                  <div className="bg-white/60 rounded-2xl p-6 border border-purple-200">
                    <div className="text-center mb-6">
                      <MoodBottle scent={selectedMood} size="large" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">{selectedMood.name}</h3>
                        <p className="text-gray-600 italic text-sm">{selectedMood.description}</p>
                      </div>

                      <div className="border-t border-purple-100 pt-4">
                        <div className="text-sm text-gray-500 mb-1">Captured</div>
                        <div className="text-gray-700">{new Date(selectedMood.date).toLocaleString()}</div>
                      </div>

                      <div className="border-t border-purple-100 pt-4">
                        <div className="text-sm text-gray-500 mb-1">Mood</div>
                        <div className="text-gray-700 capitalize">{selectedMood.mood}</div>
                      </div>

                      <div className="border-t border-purple-100 pt-4">
                        <div className="text-sm text-gray-500 mb-1">Intensity</div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedMood.intensity * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(selectedMood.intensity * 100)}%</span>
                        </div>
                      </div>

                      {selectedMood.note && (
                        <div className="border-t border-purple-100 pt-4">
                          <div className="text-sm text-gray-500 mb-2">Personal Note</div>
                          <div className="text-gray-700 text-sm italic bg-purple-50 p-3 rounded-lg">
                            "{selectedMood.note}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/40 rounded-2xl p-6 border border-purple-100 text-center">
                    <div className="text-gray-500 mb-4">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    </div>
                    <p className="text-gray-600">Select an essence from your timeline to explore its details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
