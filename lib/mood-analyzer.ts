const POSITIVE_WORDS = [
  "happy",
  "joy",
  "calm",
  "good",
  "great",
  "love",
  "grateful",
  "proud",
  "peace",
  "excited",
  "hope",
  "confident",
  "relaxed",
  "energized",
  "inspired",
  "playful",
  "content",
  "balanced",
  "curious",
  "glad",
]
const NEGATIVE_WORDS = [
  "sad",
  "angry",
  "anxious",
  "stress",
  "stressed",
  "worried",
  "tired",
  "exhausted",
  "down",
  "bad",
  "terrible",
  "awful",
  "overwhelmed",
  "fear",
  "lonely",
  "depressed",
  "guilty",
  "ashamed",
  "frustrated",
  "nervous",
]

const POSITIVE_EMOJI = ["😀", "😄", "😊", "🙂", "😍", "🥳", "🤩", "😌", "✨", "🌞", "💖", "💫"]
const NEGATIVE_EMOJI = ["😞", "😢", "😭", "😡", "😠", "😣", "😖", "😔", "🌧️", "💔", "😫", "😩"]

function clamp(n: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, n))
}

function normalizeScore(raw: number, maxAbs = 12) {
  const x = Math.max(-maxAbs, Math.min(maxAbs, raw))
  const ratio = (x + maxAbs) / (2 * maxAbs) // 0..1
  return clamp(Math.round(ratio * 9 + 1))
}

function normalizeEnergy(raw: number, max = 12) {
  const x = Math.max(0, Math.min(max, raw))
  return clamp(Math.round((x / max) * 9 + 1))
}

export type MoodAnalysis = {
  mood: number
  energy: number
  label: string
}

export function analyzeTextMood(text: string): MoodAnalysis {
  const lower = text.toLowerCase()

  let score = 0
  for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 2
  for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 2

  for (const e of POSITIVE_EMOJI) if (text.includes(e)) score += 2
  for (const e of NEGATIVE_EMOJI) if (text.includes(e)) score -= 2

  const exclamations = (text.match(/!/g) || []).length
  const questionMarks = (text.match(/\?/g) || []).length
  const capsRatio =
    text.length > 0 ? text.replace(/[^A-Z]/g, "").length / Math.max(1, text.replace(/[^A-Za-z]/g, "").length) : 0

  const energyRaw = exclamations * 1.5 + questionMarks * 0.5 + capsRatio * 8 + Math.min(6, Math.floor(text.length / 60))

  if (energyRaw > 6) {
    if (score >= 0) score += 1
  }

  const mood = normalizeScore(score)
  const energy = normalizeEnergy(energyRaw)
  const label = mood >= 7 ? "Positive" : mood <= 4 ? "Negative" : "Neutral"
  return { mood, energy, label }
}
