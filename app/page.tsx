"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { PersonaChat } from "@/components/persona-chat"
import { CreativeStudio } from "@/components/creative-studio"
import { RitualExperience } from "@/components/ritual-experience"
import { SettingsPanel } from "@/components/settings-panel"
import { PersonaTraining } from "@/components/persona-training"
import { ShadowUnlock } from "@/components/shadow-unlock"
import { MoodJournal } from "@/components/mood-journal"
import { DreamscapeExplorer } from "@/components/dreamscape-explorer"
import { personas } from "@/lib/personas"
import type { Persona } from "@/types/persona"

export default function MoodTracker() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [showRitualExperience, setShowRitualExperience] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTraining, setShowTraining] = useState(false)
  const [showShadowUnlock, setShowShadowUnlock] = useState(false)
  const [showMoodJournal, setShowMoodJournal] = useState(false)
  const [showDreamscape, setShowDreamscape] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [unlockedShadows, setUnlockedShadows] = useState<string[]>([])
  const [userMood, setUserMood] = useState(5) // Default mood level

  useEffect(() => {
    // Load user data from localStorage
    const savedPoints = localStorage.getItem("userPoints")
    const savedShadows = localStorage.getItem("unlockedShadows")
    const savedMood = localStorage.getItem("currentMood")

    if (savedPoints) setUserPoints(Number.parseInt(savedPoints))
    if (savedShadows) setUnlockedShadows(JSON.parse(savedShadows))
    if (savedMood) setUserMood(Number.parseInt(savedMood))
  }, [])

  const addPoints = (points: number) => {
    const newPoints = userPoints + points
    setUserPoints(newPoints)
    localStorage.setItem("userPoints", newPoints.toString())
  }

  const unlockShadow = (shadowId: string) => {
    const newShadows = [...unlockedShadows, shadowId]
    setUnlockedShadows(newShadows)
    localStorage.setItem("unlockedShadows", JSON.stringify(newShadows))
  }

  if (showRitualExperience && selectedPersona) {
    return (
      <RitualExperience
        persona={selectedPersona}
        onClose={() => setShowRitualExperience(false)}
        onAddPoints={addPoints}
        userMood={userMood}
      />
    )
  }

  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />
  }

  if (showTraining) {
    return <PersonaTraining onClose={() => setShowTraining(false)} />
  }

  if (showShadowUnlock) {
    return (
      <ShadowUnlock
        onClose={() => setShowShadowUnlock(false)}
        userPoints={userPoints}
        unlockedShadows={unlockedShadows}
        onUnlockShadow={unlockShadow}
        onSpendPoints={(points) => setUserPoints(userPoints - points)}
      />
    )
  }

  if (showMoodJournal) {
    return <MoodJournal onClose={() => setShowMoodJournal(false)} onAddPoints={addPoints} />
  }

  if (showDreamscape) {
    return <DreamscapeExplorer onClose={() => setShowDreamscape(false)} onAddPoints={addPoints} />
  }

  if (selectedPersona) {
    return (
      <div className="flex h-screen bg-slate-950">
        <PersonaChat
          persona={selectedPersona}
          onBack={() => setSelectedPersona(null)}
          onAddPoints={addPoints}
          userPoints={userPoints}
        />
        <CreativeStudio
          persona={selectedPersona}
          onShowWeeklyRitual={() => setShowRitualExperience(true)}
          onShowSettings={() => setShowSettings(false)}
          onShowTraining={() => setShowTraining(true)}
          onShowShadowUnlock={() => setShowShadowUnlock(true)}
          onShowMoodJournal={() => setShowMoodJournal(true)}
          onShowDreamscape={() => setShowDreamscape(true)}
          userPoints={userPoints}
          unlockedShadows={unlockedShadows}
          userMood={userMood}
        />
      </div>
    )
  }

  return (
    <HeroSection
      personas={personas}
      onSelectPersona={setSelectedPersona}
      userPoints={userPoints}
      onShowMoodJournal={() => setShowMoodJournal(true)}
    />
  )
}
