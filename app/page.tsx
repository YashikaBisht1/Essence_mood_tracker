"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const router = useRouter()
  const searchParams = useSearchParams()

  const view = searchParams.get("view") || "hero" // Default to 'hero' view
  const personaId = searchParams.get("persona")

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

  const addPoints = useCallback((points: number) => {
    setUserPoints((prevPoints) => {
      const newPoints = prevPoints + points
      localStorage.setItem("userPoints", newPoints.toString())
      return newPoints
    })
  }, [])

  const unlockShadow = useCallback((shadowId: string) => {
    setUnlockedShadows((prevShadows) => {
      const newShadows = [...prevShadows, shadowId]
      localStorage.setItem("unlockedShadows", JSON.stringify(newShadows))
      return newShadows
    })
  }, [])

  const spendPoints = useCallback((points: number) => {
    setUserPoints((prevPoints) => {
      const newPoints = prevPoints - points
      localStorage.setItem("userPoints", newPoints.toString())
      return newPoints
    })
  }, [])

  const selectedPersona = personaId ? personas.find((p) => p.id === personaId) : null

  const navigateTo = useCallback(
    (newView: string, newPersonaId?: string) => {
      const params = new URLSearchParams()
      params.set("view", newView)
      if (newPersonaId) {
        params.set("persona", newPersonaId)
      } else if (personaId) {
        params.set("persona", personaId) // Keep persona if not explicitly changed
      }
      router.push(`/?${params.toString()}`)
    },
    [router, personaId],
  )

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSelectPersona = useCallback(
    (persona: Persona) => {
      navigateTo("chat", persona.id)
    },
    [navigateTo],
  )

  const handleShowRitualExperience = useCallback(() => {
    navigateTo("ritual")
  }, [navigateTo])

  const handleShowSettings = useCallback(() => {
    navigateTo("settings")
  }, [navigateTo])

  const handleShowTraining = useCallback(() => {
    navigateTo("training")
  }, [navigateTo])

  const handleShowShadowUnlock = useCallback(() => {
    navigateTo("shadow-unlock")
  }, [navigateTo])

  const handleShowMoodJournal = useCallback(() => {
    navigateTo("mood-journal")
  }, [navigateTo])

  const handleShowDreamscape = useCallback(() => {
    navigateTo("dreamscape")
  }, [navigateTo])

  switch (view) {
    case "ritual":
      if (selectedPersona) {
        return (
          <RitualExperience
            persona={selectedPersona}
            onClose={handleBack}
            onAddPoints={addPoints}
            userMood={userMood}
          />
        )
      }
      // Fallback to hero if no persona selected for ritual
      router.replace("/")
      return null
    case "settings":
      return <SettingsPanel onClose={handleBack} />
    case "training":
      return <PersonaTraining onClose={handleBack} />
    case "shadow-unlock":
      return (
        <ShadowUnlock
          onClose={handleBack}
          userPoints={userPoints}
          unlockedShadows={unlockedShadows}
          onUnlockShadow={unlockShadow}
          onSpendPoints={spendPoints}
        />
      )
    case "mood-journal":
      return <MoodJournal onClose={handleBack} onAddPoints={addPoints} />
    case "dreamscape":
      return <DreamscapeExplorer onClose={handleBack} onAddPoints={addPoints} />
    case "chat":
      if (selectedPersona) {
        return (
          <div className="flex h-screen bg-slate-950">
            <PersonaChat
              persona={selectedPersona}
              onBack={handleBack}
              onAddPoints={addPoints}
              userPoints={userPoints}
            />
            <CreativeStudio
              persona={selectedPersona}
              onShowWeeklyRitual={handleShowRitualExperience}
              onShowSettings={handleShowSettings}
              onShowTraining={handleShowTraining}
              onShowShadowUnlock={handleShowShadowUnlock}
              onShowMoodJournal={handleShowMoodJournal}
              onShowDreamscape={handleShowDreamscape}
              userPoints={userPoints}
              unlockedShadows={unlockedShadows}
              userMood={userMood}
            />
          </div>
        )
      }
      // Fallback to hero if no persona selected for chat
      router.replace("/")
      return null
    case "hero":
    default:
      return (
        <HeroSection
          personas={personas}
          onSelectPersona={handleSelectPersona}
          userPoints={userPoints}
          onShowMoodJournal={handleShowMoodJournal}
        />
      )
  }
}
