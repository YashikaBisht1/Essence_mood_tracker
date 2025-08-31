"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Bar, BarChart, Tooltip } from "recharts"
import type { Persona } from "@/types/persona"
import { conversationManager } from "@/lib/conversation-manager"
import { analyzeTextMood } from "@/lib/mood-analyzer"
import {
  addMoodPoint,
  getMoodSeries,
  hasScoreForMessage,
  weeklyAggregates,
  sanitizeMoodSeries,
  type MoodPoint,
} from "@/lib/mood-storage"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MoodTimelineProps {
  persona: Persona
}

type SeriesItem = {
  time: string
  mood: number
  energy: number
  label: string
  messageId: string
}

function isFiniteInRange(n: unknown, min: number, max: number) {
  const x = Number(n)
  return Number.isFinite(x) && x >= min && x <= max
}

function validLabelFromMood(mood: number) {
  return mood >= 7 ? "Positive" : mood <= 4 ? "Negative" : "Neutral"
}

async function scoreWithLLM(text: string, personaId: string, userId: string | undefined) {
  const res = await fetch("/api/mood-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, personaId, userId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to score mood")
  }
  return (await res.json()) as {
    ok: true
    result: {
      mood: number
      energy: number
      label: "Positive" | "Neutral" | "Negative"
      emotions?: string[]
      rationale?: string
    }
  }
}

export function MoodTimeline({ persona }: MoodTimelineProps) {
  const [series, setSeries] = useState<SeriesItem[]>([])
  const [weekly, setWeekly] = useState<{ day: string; mood: number | null; energy: number | null }[]>([])
  const [isScoring, setIsScoring] = useState(false)

  // A best-effort userId from localStorage (created in PersonaChat)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  useEffect(() => {
    try {
      const id = localStorage.getItem("essence_user_id") || undefined
      setUserId(id || undefined)
    } catch {
      setUserId(undefined)
    }
  }, [])

  // Build chart series from stored mood points (LLM) as primary source
  function rebuildFromStorage() {
    // Sanitize the stored series first (also rewrites bad data)
    sanitizeMoodSeries(persona.id)
    const pts = getMoodSeries(persona.id)

    const sorted = [...pts].sort((a, b) => a.timestamp - b.timestamp)
    const filtered = sorted.filter(
      (p) =>
        isFiniteInRange(p.mood, 0, 10) &&
        isFiniteInRange(p.energy, 0, 10) &&
        Number.isFinite(new Date(p.timestamp).getTime()),
    )

    const mapped: SeriesItem[] = filtered.slice(-24).map((p) => {
      const ts = Number.isFinite(new Date(p.timestamp).getTime()) ? p.timestamp : Date.now()
      return {
        time: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mood: Number(p.mood),
        energy: Number(p.energy),
        label: p.label || validLabelFromMood(Number(p.mood)),
        messageId: p.messageId,
      }
    })

    setSeries(mapped)
    setWeekly(weeklyAggregates(persona.id))
  }

  // Score any recent user messages that don't have an entry yet.
  async function ensureScoresForRecentMessages() {
    const messages = conversationManager.getMessages(persona.id)
    const userMsgs = messages.filter((m) => m.sender === "user")
    const last = userMsgs.slice(-12)

    if (last.length === 0) {
      rebuildFromStorage()
      return
    }

    setIsScoring(true)
    try {
      for (const m of last) {
        if (!hasScoreForMessage(persona.id, m.id)) {
          try {
            const response = await scoreWithLLM(m.content, persona.id, userId)
            const r = response.result
            // Coerce and guard
            const moodNum = Number(r.mood)
            const energyNum = Number(r.energy)

            const fallback = analyzeTextMood(m.content)
            const mood = Number.isFinite(moodNum) ? Math.max(0, Math.min(10, Math.round(moodNum))) : fallback.mood
            const energy = Number.isFinite(energyNum)
              ? Math.max(0, Math.min(10, Math.round(energyNum)))
              : fallback.energy

            const point: MoodPoint = {
              id: `${persona.id}:${m.id}`,
              personaId: persona.id,
              messageId: m.id,
              timestamp: new Date(m.timestamp).getTime() || Date.now(),
              mood,
              energy,
              label: (r.label as "Positive" | "Neutral" | "Negative") || validLabelFromMood(mood),
              emotions: Array.isArray(r.emotions) ? r.emotions.slice(0, 5) : [],
              rationale: typeof r.rationale === "string" ? r.rationale.slice(0, 400) : "",
            }
            addMoodPoint(point)
          } catch {
            // Fallback to local heuristic if API fails
            const h = analyzeTextMood(m.content)
            const point: MoodPoint = {
              id: `${persona.id}:${m.id}`,
              personaId: persona.id,
              messageId: m.id,
              timestamp: new Date(m.timestamp).getTime() || Date.now(),
              mood: h.mood,
              energy: h.energy,
              label: h.label as "Positive" | "Neutral" | "Negative",
            }
            addMoodPoint(point)
          }
        }
      }
    } finally {
      setIsScoring(false)
      rebuildFromStorage()
    }
  }

  // Initial load + listen to conversation updates
  useEffect(() => {
    conversationManager.loadFromStorage(persona.id)
    ensureScoresForRecentMessages()

    const onConversationUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { personaId?: string } | undefined
      if (!detail || detail.personaId === persona.id) {
        ensureScoresForRecentMessages()
      }
    }
    window.addEventListener("conversation:updated", onConversationUpdated as EventListener)
    return () => {
      window.removeEventListener("conversation:updated", onConversationUpdated as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona.id, userId])

  const moodAvg = useMemo(() => {
    const values = series.map((d) => Number(d.mood)).filter((n) => Number.isFinite(n))
    if (values.length === 0) return null
    const sum = values.reduce((acc, n) => acc + n, 0)
    const avg = sum / values.length
    return Number.isFinite(avg) ? Math.round(avg * 10) / 10 : null
  }, [series])

  const latest = series[series.length - 1]

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-emerald-100 text-sm">Mood Evolution</CardTitle>
            <div className="text-xs text-emerald-300/60">
              {isScoring ? "Scoring..." : moodAvg !== null ? `Avg: ${moodAvg}/10` : "Start chatting to see your mood"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-36 w-full">
            <ChartContainer
              className="h-full"
              config={{
                mood: { label: "Mood", color: "hsl(var(--chart-1))" },
                energy: { label: "Energy", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#a7f3d0", fontSize: 11 }} />
                  <YAxis
                    domain={[1, 10]}
                    tickCount={6}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a7f3d0", fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="energy" stroke="var(--color-energy)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="flex justify-between text-xs text-emerald-300/60 mt-2">
            <span>🟢 Mood</span>
            <span>🟡 Energy</span>
          </div>
          {latest ? (
            <div className="mt-3 text-xs text-emerald-200/80">
              Latest: {latest.label} mood ({latest.mood}/10), energy {latest.energy}/10
            </div>
          ) : (
            <div className="mt-3 text-xs text-emerald-200/60">No messages yet. Say hello to {persona.name}.</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-emerald-100 text-sm">Weekly Mood Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-28 w-full">
            <ChartContainer
              className="h-full"
              config={{
                mood: { label: "Mood", color: "hsl(var(--chart-1))" },
                energy: { label: "Energy", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#a7f3d0", fontSize: 11 }} />
                  <YAxis
                    domain={[0, 10]}
                    tickCount={6}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a7f3d0", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: '1px solid "#334155',
                      borderRadius: "8px",
                      color: "#a7f3d0",
                    }}
                  />
                  <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="energy" fill="var(--color-energy)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <p className="mt-2 text-xs text-emerald-300/60">
            Aggregated per day over the last 7 days. Keep chatting to build richer insights.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
