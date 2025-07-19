"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, Play, Clock, Hash } from "lucide-react"

interface PersonaCardProps {
  persona: {
    id: string
    name: string
    archetype: string
    description: string
    traits: string[]
    theme: {
      colors: string[]
      background: string
      accent: string
    }
    lastUsed?: Date
    interactionCount: number
  }
  onEdit: () => void
  onDelete: () => void
  onChat: () => void
}

export function PersonaCard({ persona, onEdit, onDelete, onChat }: PersonaCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete()
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-purple-400/30 hover:bg-white/15 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: persona.theme.accent }} />
              <h3 className="text-lg font-medium text-white">{persona.name}</h3>
            </div>
            <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-300">
              {persona.archetype}
            </Badge>
          </div>

          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={onEdit}
              size="sm"
              variant="ghost"
              className="text-purple-300 hover:text-white hover:bg-purple-600/30 w-8 h-8 p-0"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="ghost"
              className={`w-8 h-8 p-0 ${
                showDeleteConfirm
                  ? "text-red-400 hover:text-red-300 hover:bg-red-600/30"
                  : "text-purple-300 hover:text-white hover:bg-purple-600/30"
              }`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-purple-200 text-sm mb-4 line-clamp-2">{persona.description}</p>

        {/* Traits */}
        <div className="flex flex-wrap gap-1 mb-4">
          {persona.traits.slice(0, 3).map((trait) => (
            <Badge key={trait} variant="secondary" className="text-xs bg-purple-600/30 text-purple-200 border-0">
              {trait}
            </Badge>
          ))}
          {persona.traits.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-purple-600/30 text-purple-200 border-0">
              +{persona.traits.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-purple-400 mb-4">
          <div className="flex items-center space-x-1">
            <Hash className="w-3 h-3" />
            <span>{persona.interactionCount} chats</span>
          </div>
          {persona.lastUsed && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(persona.lastUsed).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={onChat}
          className="w-full bg-gradient-to-r hover:scale-105 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${persona.theme.colors[0]}, ${persona.theme.colors[1]})`,
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  )
}
