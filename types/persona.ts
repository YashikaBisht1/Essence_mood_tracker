export interface Persona {
  id: string
  name: string
  title: string
  emoji: string
  color: string
  description: string
  tagline: string
  personality: string[]

  // Detailed background
  physicalDescription: string
  age: number
  background: string
  dailySchedule: {
    morning: string
    afternoon: string
    evening: string
    night: string
  }
  hobbies: string[]
  favoriteBooks: string[]
  favoriteSongs: string[]
  favoriteMovies: string[]
  tasks: string[]
  role: string
  targetAudience: string

  // AI behavior
  conversationStyle: string
  memoryAccess: string[]
  sleepMode: boolean
  trainingData: any[]
}

export interface Message {
  id: string
  content: string
  sender: "user" | "persona"
  timestamp: Date
  mood?: string
  points?: number
}

export interface MoodEntry {
  id: string
  date: Date
  mood: number
  perfume: string
  notes: string
  persona?: string
}

export interface Shadow {
  id: string
  title: string
  description: string
  cost: number
  insight: string
  unlocked: boolean
}
