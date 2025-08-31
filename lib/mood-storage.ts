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

function storageKey(personaId: string) {
  return `${KEY_PREFIX}${personaId}`
}

function idxKey(personaId: string) {
  return `${INDEX_PREFIX}${personaId}`
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function isFiniteNumber(n: unknown): n is number {
  return Number.isFinite(Number(n))
}

function clampInt(n: unknown, min: number, max: number) {
  const x = Math.round(Number(n))
  if (!Number.isFinite(x)) return min
  return Math.max(min, Math.min(max, x))
}

function normalizeLabel(mood: number): "Positive" | "Neutral" | "Negative" {
  if (mood >= 7) return "Positive"
  if (mood <= 4) return "Negative"
  return "Neutral"
}

function sanitizePoint(p: MoodPoint): MoodPoint | null {
  // Required strings
  if (!p || !p.personaId || !p.messageId) return null

  // Timestamp
  const t = new Date(Number(p.timestamp)).getTime()
  const safeTs = Number.isFinite(t) ? t : Date.now()

  // Mood/energy
  const mood = clampInt(p.mood, 0, 10)
  const energy = clampInt(p.energy, 0, 10)
  if (!isFiniteNumber(mood) || !isFiniteNumber(energy)) return null

  // Label
  const label = (p.label as MoodPoint["label"]) || normalizeLabel(mood)

  // Optional fields
  const emotions = Array.isArray(p.emotions) ? p.emotions.slice(0, 5).map(String) : []
  const rationale = typeof p.rationale === "string" ? p.rationale.slice(0, 400) : ""

  return {
    id: String(p.id || `${p.personaId}:${p.messageId}`),
    personaId: String(p.personaId),
    messageId: String(p.messageId),
    timestamp: safeTs,
    mood,
    energy,
    label,
    emotions,
    rationale,
  }
}

export function getMoodSeries(personaId: string): MoodPoint[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(storageKey(personaId))
    return raw ? (JSON.parse(raw) as MoodPoint[]) : []
  } catch {
    return []
  }
}

export function setMoodSeries(personaId: string, series: MoodPoint[]) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(storageKey(personaId), JSON.stringify(series))
  } catch {
    // ignore
  }
}

/**
 * Clean and persist a persona's mood series. Returns the cleaned series.
 * This removes invalid points and clamps numbers so charts never see NaN.
 */
export function sanitizeMoodSeries(personaId: string): MoodPoint[] {
  const current = getMoodSeries(personaId)
  const cleaned = current.map((p) => sanitizePoint(p as MoodPoint)).filter((p): p is MoodPoint => Boolean(p))

  // Keep last 200 points
  const trimmed = cleaned.slice(-200)
  // Only write back if different length or something changed
  if (trimmed.length !== current.length) {
    setMoodSeries(personaId, trimmed)
  } else {
    // shallow compare a few keys to detect corruption
    const mismatch = trimmed.some((p, i) => {
      const q = current[i] as MoodPoint
      return (
        p.messageId !== q.messageId ||
        p.mood !== q.mood ||
        p.energy !== q.energy ||
        p.timestamp !== q.timestamp ||
        p.label !== q.label
      )
    })
    if (mismatch) setMoodSeries(personaId, trimmed)
  }
  return trimmed
}

export function addMoodPoint(point: MoodPoint) {
  if (!isBrowser()) return
  const series = sanitizeMoodSeries(point.personaId)
  // Prevent duplicates by messageId
  if (series.some((p) => p.messageId === point.messageId)) return

  const clean = sanitizePoint(point)
  if (!clean) return

  const updated = [...series, clean].slice(-200)
  setMoodSeries(point.personaId, updated)

  // Mark message as scored
  try {
    const k = idxKey(point.personaId)
    const idxRaw = localStorage.getItem(k)
    const idx = idxRaw ? (JSON.parse(idxRaw) as Record<string, boolean>) : {}
    idx[point.messageId] = true
    localStorage.setItem(k, JSON.stringify(idx))
  } catch {
    // ignore
  }
}

export function hasScoreForMessage(personaId: string, messageId: string) {
  if (!isBrowser()) return false
  try {
    const idxRaw = localStorage.getItem(idxKey(personaId))
    const idx = idxRaw ? (JSON.parse(idxRaw) as Record<string, boolean>) : {}
    return Boolean(idx[messageId])
  } catch {
    return false
  }
}

export function weeklyAggregates(personaId: string) {
  // Sanitize on read to avoid feeding NaN to charts
  const pts = sanitizeMoodSeries(personaId)
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
    const tVal = new Date(p.timestamp).getTime()
    if (!Number.isFinite(tVal)) continue
    const t = new Date(tVal)
    if (t >= start && t <= now) {
      const label = t.toLocaleDateString(undefined, { weekday: "short" })
      if (!dayBuckets[label]) {
        dayBuckets[label] = { date: label, moods: [], energies: [] }
      }
      if (Number.isFinite(p.mood)) dayBuckets[label].moods.push(Number(p.mood))
      if (Number.isFinite(p.energy)) dayBuckets[label].energies.push(Number(p.energy))
    }
  }

  const result = Object.values(dayBuckets).map((b) => {
    const moodAvg = b.moods.length ? b.moods.reduce((a, c) => a + c, 0) / b.moods.length : null
    const energyAvg = b.energies.length ? b.energies.reduce((a, c) => a + c, 0) / b.energies.length : null
    return {
      day: b.date,
      mood: moodAvg !== null && Number.isFinite(moodAvg) ? Math.round(moodAvg * 10) / 10 : null,
      energy: energyAvg !== null && Number.isFinite(energyAvg) ? Math.round(energyAvg * 10) / 10 : null,
    }
  })

  return result
}
