"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Music,
  Palette,
  PenTool,
  BarChart3,
  Settings,
  Brain,
  Eye,
  BookOpen,
  Star,
  Lightbulb,
  Play,
  Heart,
  Loader2,
  Sparkles,
  Flame,
} from "lucide-react"
import type { Persona } from "@/types/persona"
import { MoodTimeline } from "@/components/mood-timeline"
import { spotifyService, type SpotifyPlaylist } from "@/lib/spotify-service"
import { toast } from "sonner"

interface CreativeStudioProps {
  persona: Persona
  onShowWeeklyRitual: () => void
  onShowSettings: () => void
  onShowTraining: () => void
  onShowShadowUnlock: () => void
  onShowMoodJournal: () => void
  onShowDreamscape: () => void
  userPoints: number
  unlockedShadows: string[]
  userMood: number
}

export function CreativeStudio({
  persona,
  onShowWeeklyRitual,
  onShowSettings,
  onShowTraining,
  onShowShadowUnlock,
  onShowMoodJournal,
  onShowDreamscape,
  userPoints,
  unlockedShadows,
  userMood,
}: CreativeStudioProps) {
  const [activeTab, setActiveTab] = useState("music")
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(spotifyService.isSpotifyConnected())
  const [isConnecting, setIsConnecting] = useState(false)
  const [personalizedPlaylists, setPersonalizedPlaylists] = useState<SpotifyPlaylist[]>([])
  const [isGeneratingPlaylists, setIsGeneratingPlaylists] = useState(false)
  const [moodInput, setMoodInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")

  const artPrompts = {
    aurora: [
      "Paint the color of your morning gratitude",
      "Draw your spiritual sanctuary",
      "Sketch the feeling of inner peace",
      "Create a mandala of your intentions",
      "Illustrate your connection to nature",
    ],
    scarleet: [
      "Design your power pose portrait",
      "Create your dream stage setting",
      "Illustrate your boldest self",
      "Paint your confidence in abstract",
      "Draw your success visualization",
    ],
    luna: [
      "Draw your shadow self embracing light",
      "Paint your deepest fear transforming",
      "Sketch the beauty in your darkness",
      "Create art from your dreams",
      "Illustrate your hidden wisdom",
    ],
  }

  const writingPrompts = {
    aurora: [
      "What does your joy smell like in the morning dew?",
      "Write a letter to your future enlightened self",
      "Describe your perfect ritual of self-care",
      "What wisdom would you share with your younger self?",
      "Write about a moment of pure presence",
    ],
    scarleet: [
      "What would you say if you knew everyone was cheering for you?",
      "Write your acceptance speech for your dream achievement",
      "Describe your moment of greatest triumph",
      "What bold action would you take if fear didn't exist?",
      "Write about stepping into your spotlight",
    ],
    luna: [
      "What secrets does your shadow whisper in the dark?",
      "Write about a time you felt truly understood",
      "Describe the beauty you find in your pain",
      "What would you tell someone afraid of their darkness?",
      "Write about embracing your authentic self",
    ],
  }

  const handleConnectSpotify = async () => {
    setIsConnecting(true)
    try {
      const connected = await spotifyService.connect()
      if (connected) {
        setIsSpotifyConnected(true)
        toast.success("Spotify connected! Now generating personalized playlists...")
        await generatePersonalizedPlaylists()
      }
    } catch (error) {
      toast.error("Failed to connect to Spotify. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const generatePersonalizedPlaylists = async () => {
    if (!isSpotifyConnected) return

    setIsGeneratingPlaylists(true)
    try {
      const mood = moodInput || "balanced"
      const keywords = keywordInput ? keywordInput.split(",").map((k) => k.trim()) : []

      const playlists = await spotifyService.generatePersonalizedPlaylists(persona.id, mood, keywords)
      setPersonalizedPlaylists(playlists)
      toast.success(`Generated ${playlists.length} personalized playlists for ${persona.name}!`)
    } catch (error) {
      toast.error("Failed to generate playlists. Please try again.")
    } finally {
      setIsGeneratingPlaylists(false)
    }
  }

  const handlePlaylistClick = (playlist: SpotifyPlaylist) => {
    spotifyService.saveUserInteraction(playlist.id, "play")
    window.open(playlist.url, "_blank")
    toast.success(`Opening "${playlist.name}" in Spotify`)
  }

  const handleLikePlaylist = (playlist: SpotifyPlaylist, e: React.MouseEvent) => {
    e.stopPropagation()
    spotifyService.saveUserInteraction(playlist.id, "like")
    toast.success(`Liked "${playlist.name}"! This will improve future recommendations.`)
  }

  return (
    <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-emerald-100">Creative Studio</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">{userPoints}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowSettings}
              className="text-emerald-300 hover:bg-emerald-500/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Ritual Button */}
        <div className="mb-4">
          <Button
            onClick={onShowWeeklyRitual}
            className="w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-500 hover:from-emerald-500 hover:via-amber-400 hover:to-rose-400 text-white py-3 relative overflow-hidden group transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <Flame className="w-4 h-4 mr-2 animate-pulse" />
            <span className="font-serif text-lg">🌸 Summon Ritual</span>
            <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={onShowMoodJournal}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            Journal
          </Button>
          <Button
            onClick={onShowDreamscape}
            size="sm"
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Dreams
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={onShowTraining}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
          >
            <Brain className="w-3 h-3 mr-1" />
            Training
          </Button>
          <Button
            onClick={onShowShadowUnlock}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white"
          >
            <Eye className="w-3 h-3 mr-1" />
            Shadows
          </Button>
        </div>

        {/* Enhanced Spotify Integration */}
        {!isSpotifyConnected ? (
          <Button
            onClick={handleConnectSpotify}
            disabled={isConnecting}
            size="sm"
            className="w-full bg-green-600/80 hover:bg-green-500/80 text-white"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-2 fill-current"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.81 17.69c-.27.4-.78.53-1.18.26-2.48-1.5-5.5-1.8-9.1-.98-.45.1-.9-.15-1-.6-.1-.45.15-.9.6-.98 4.07-1.08 7.5-1.08 10.38.6.4.27.53.78.26 1.18zM19.5 14.2c-.35.5-1 .65-1.5.3-3.08-1.8-7.7-2.3-11.8-.9-1.1.3-2.2-.3-2.5-1.4-.3-1.1.3-2.2 1.4-2.5 4.7-1.3 9.9-.7 13.4 1.4.5.35.65 1 .3 1.5zM21.2 10.8c-.45.6-1.3.8-1.9.4-4.1-2.5-10.3-3.2-14.8-1.8-1.5.4-2.3-.4-2.7-1.9-.4-1.5.4-2.3 1.9-2.7 5.3-1.4 12.2-.6 16.8 2.2.6.45.8 1.3.4 1.9z" />
                </svg>
                Connect Spotify
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-green-400 text-sm">
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-2 fill-current"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.81 17.69c-.27.4-.78.53-1.18.26-2.48-1.5-5.5-1.8-9.1-.98-.45.1-.9-.15-1-.6-.1-.45.15-.9.6-.98 4.07-1.08 7.5-1.08 10.38.6.4.27.53.78.26 1.18zM19.5 14.2c-.35.5-1 .65-1.5.3-3.08-1.8-7.7-2.3-11.8-.9-1.1.3-2.2-.3-2.5-1.4-.3-1.1.3-2.2 1.4-2.5 4.7-1.3 9.9-.7 13.4 1.4.5.35.65 1 .3 1.5zM21.2 10.8c-.45.6-1.3.8-1.9.4-4.1-2.5-10.3-3.2-14.8-1.8-1.5.4-2.3-.4-2.7-1.9-.4-1.5.4-2.3 1.9-2.7 5.3-1.4 12.2-.6 16.8 2.2.6.45.8 1.3.4 1.9z" />
              </svg>
              Spotify Connected
            </div>
            <Input
              placeholder="Current mood..."
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              className="bg-slate-800 border-slate-600 text-emerald-100 text-xs"
            />
            <Input
              placeholder="Keywords (comma separated)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="bg-slate-800 border-slate-600 text-emerald-100 text-xs"
            />
            <Button
              onClick={generatePersonalizedPlaylists}
              disabled={isGeneratingPlaylists}
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isGeneratingPlaylists ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate Playlists
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 m-4 bg-slate-800">
          <TabsTrigger value="music" className="data-[state=active]:bg-emerald-600">
            <Music className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="art" className="data-[state=active]:bg-emerald-600">
            <Palette className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="writing" className="data-[state=active]:bg-emerald-600">
            <PenTool className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <TabsContent value="music" className="space-y-4 mt-0">
            {isSpotifyConnected && personalizedPlaylists.length > 0 && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-100 text-sm flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Generated Playlists
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {personalizedPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-emerald-200 text-xs font-medium">{playlist.name}</h4>
                          <p className="text-emerald-300/60 text-xs mt-1">{playlist.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                              {playlist.mood}
                            </span>
                            <span className="text-xs text-emerald-400">Energy: {playlist.energy}/10</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleLikePlaylist(playlist, e)}
                            className="text-red-400 hover:bg-red-500/10 p-1"
                          >
                            <Heart className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-green-400 hover:bg-green-500/10 p-1">
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="art" className="space-y-4 mt-0">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-100 text-sm">Art Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artPrompts[persona.id as keyof typeof artPrompts]?.map((prompt, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-emerald-200 text-xs leading-relaxed">{prompt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writing" className="space-y-4 mt-0">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-100 text-sm">Writing Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {writingPrompts[persona.id as keyof typeof writingPrompts]?.map((prompt, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-emerald-200 text-xs italic leading-relaxed">"{prompt}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-0">
            <MoodTimeline persona={persona} />

            {unlockedShadows.length > 0 && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-emerald-100 text-sm">Unlocked Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {unlockedShadows.map((shadowId, index) => (
                    <div key={index} className="p-2 bg-purple-900/20 rounded border border-purple-500/20">
                      <p className="text-purple-200 text-xs">Shadow insight: {shadowId}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
