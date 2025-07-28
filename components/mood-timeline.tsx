"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { Persona, Message } from "@/types/persona"
import { conversationManager } from "@/lib/conversation-manager" // Import conversationManager

interface MoodTimelineProps {
  persona: Persona
}

// Mock mood data for the chart (can be replaced with real data from MoodJournal entries later)
const mockMoodData = [
  { day: "Mon", mood: 7, energy: 6, interactions: 3 },
  { day: "Tue", mood: 5, energy: 4, interactions: 2 },
  { day: "Wed", mood: 8, energy: 7, interactions: 5 },
  { day: "Thu", mood: 6, energy: 5, interactions: 4 },
  { day: "Fri", mood: 9, energy: 8, interactions: 6 },
  { day: "Sat", mood: 7, energy: 6, interactions: 3 },
  { day: "Sun", mood: 8, energy: 7, interactions: 4 },
]

// Function to analyze conversation and generate insights
const analyzeConversationForInsights = (persona: Persona, messages: Message[]): string[] => {
  const insights: string[] = []
  const recentUserMessages = messages.filter((msg) => msg.sender === "user").slice(-5) // Last 5 user messages
  const recentPersonaMessages = messages.filter((msg) => msg.sender === "persona").slice(-5) // Last 5 persona messages

  if (recentUserMessages.length > 0) {
    const lastUserTopic = recentUserMessages[recentUserMessages.length - 1].content.substring(0, 50) + "..."
    insights.push(`You recently shared thoughts on: "${lastUserTopic}"`)
  }

  if (recentPersonaMessages.length > 0) {
    const lastPersonaAdvice = recentPersonaMessages[recentPersonaMessages.length - 1].content.substring(0, 50) + "..."
    insights.push(`${persona.name} offered guidance on: "${lastPersonaAdvice}"`)
  }

  // Add some general insights based on persona type
  if (persona.id === "aurora") {
    insights.push("Your interactions with Aurora often revolve around spiritual growth and mindfulness.")
  } else if (persona.id === "scarleet") {
    insights.push("Scarleet has been helping you with confidence-building and embracing your inner strength.")
  } else if (persona.id === "luna") {
    insights.push("Your conversations with Luna delve into deep introspection and shadow work.")
  }

  if (messages.length > 10) {
    insights.push("Your journey with this persona is deepening, exploring various aspects of your inner world.")
  } else {
    insights.push("You're just beginning to explore the unique essence of this persona.")
  }

  return insights.length > 0 ? insights : ["No specific insights yet. Start a conversation to discover more!"]
}

export function MoodTimeline({ persona }: MoodTimelineProps) {
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    conversationManager.loadFromStorage(persona.id)
    const conversationHistory = conversationManager.getMessages(persona.id)
    setInsights(analyzeConversationForInsights(persona, conversationHistory))
  }, [persona]) // Updated dependency to use the entire persona object

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-emerald-100 text-sm">Mood Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMoodData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#a7f3d0", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#a7f3d0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-emerald-300/60 mt-2">
            <span>🟢 Mood</span>
            <span>🟡 Energy</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-emerald-100 text-sm">{persona.name}'s Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-slate-800 rounded-lg">
              <p className="text-emerald-200 text-xs leading-relaxed">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
