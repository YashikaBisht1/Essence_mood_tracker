export type MoodPoint = {
  id: string // unique for this point
  personaId: string
  messageId: string
  timestamp: number
  mood: number
  energy: number
  label: "Positive" | "Neutral" | "Negative"
  emotions?: string[]
  rationale?: string
}

const KEY_PREFIX = "essence:mood:"
const INDEX_PREFIX = "essence:mood-index:" // messageId -> stored boolean

function key(personaId: string) {
  return `${KEY_PREFIX}${personaId}`
}

function idxKey(personaId: string) {
  return `${INDEX_PREFIX}${personaId}`
}

export function getMoodSeries(personaId: string): MoodPoint[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key(personaId))
    return raw ? (JSON.parse(raw) as MoodPoint[]) : []
  } catch {
    return []
  }
}

export function setMoodSeries(personaId: string, series: MoodPoint[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key(personaId), JSON.stringify(series))
  } catch {
    // ignore
  }
}

export function addMoodPoint(point: MoodPoint) {
  if (typeof window === "undefined") return
  const series = getMoodSeries(point.personaId)
  // Prevent duplicates by messageId
  if (series.some((p) => p.messageId === point.messageId)) return
  series.push(point)
  // Keep last 200 points
  const trimmed = series.slice(-200)
  setMoodSeries(point.personaId, trimmed)

  // Mark message as scored
  try {
    const key = idxKey(point.personaId)
    const idxRaw = localStorage.getItem(key)
    const idx = idxRaw ? (JSON.parse(idxRaw) as Record<string, boolean>) : {}
    idx[point.messageId] = true
    localStorage.setItem(key, JSON.stringify(idx))
  } catch {
    // ignore
  }
}

export function hasScoreForMessage(personaId: string, messageId: string) {
  if (typeof window === "undefined") return false
  try {
    const idxRaw = localStorage.getItem(idxKey(personaId))
    const idx = idxRaw ? (JSON.parse(idxRaw) as Record<string, boolean>) : {}
    return Boolean(idx[messageId])
  } catch {
    return false
  }
}

export function weeklyAggregates(personaId: string) {
  const pts = getMoodSeries(personaId)
  const now = new Date()
  const start = new Date(now)
  // last 7 days window
  start.setDate(now.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const dayBuckets: Record<string, { date: string; moods: number[]; energies: number[] }> = {}

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = d.toLocaleDateString(undefined, { weekday: "short" })
    dayBuckets[label] = { date: label, moods: [], energies: [] }
  }

  for (const p of pts) {
    const t = new Date(p.timestamp)
    if (t >= start && t <= now) {
      const label = t.toLocaleDateString(undefined, { weekday: "short" })
      if (!dayBuckets[label]) {
        dayBuckets[label] = { date: label, moods: [], energies: [] }
      }
      dayBuckets[label].moods.push(p.mood)
      dayBuckets[label].energies.push(p.energy)
    }
  }

  const result = Object.values(dayBuckets).map((b) => {
    const moodAvg = b.moods.length ? b.moods.reduce((a, c) => a + c, 0) / b.moods.length : null
    const energyAvg = b.energies.length ? b.energies.reduce((a, c) => a + c, 0) / b.energies.length : null
    return {
      day: b.date,
      mood: moodAvg !== null ? Math.round(moodAvg * 10) / 10 : null,
      energy: energyAvg !== null ? Math.round(energyAvg * 10) / 10 : null,
    }
  })

  return result
}
