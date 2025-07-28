export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  url: string
  keywords: string[]
  mood: string
  energy: number
}

export class SpotifyService {
  private static instance: SpotifyService
  private isConnected = false
  private userPreferences: any = {}

  static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService()
    }
    return SpotifyService.instance
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate connection process
      setTimeout(() => {
        this.isConnected = true
        this.loadUserPreferences()
        resolve(true)
      }, 1500)
    })
  }

  isSpotifyConnected(): boolean {
    return this.isConnected
  }

  private loadUserPreferences() {
    const saved = localStorage.getItem("spotify_preferences")
    if (saved) {
      this.userPreferences = JSON.parse(saved)
    } else {
      // Default preferences
      this.userPreferences = {
        favoriteGenres: ["ambient", "classical", "indie", "electronic"],
        energyLevel: 5,
        moodHistory: [],
        likedTracks: [],
      }
    }
  }

  async generatePersonalizedPlaylists(personaId: string, mood: string, keywords: string[]): Promise<SpotifyPlaylist[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const basePlaylistsMap = {
      aurora: [
        {
          id: "aurora_morning_1",
          name: "Sunrise Meditation Flow",
          description: "Gentle ambient sounds for morning reflection",
          keywords: ["meditation", "ambient", "peaceful", "morning"],
          mood: "peaceful",
          energy: 3,
        },
        {
          id: "aurora_healing_1",
          name: "Crystal Bowl Healing",
          description: "Tibetan singing bowls and nature sounds",
          keywords: ["healing", "spiritual", "nature", "mindfulness"],
          mood: "healing",
          energy: 2,
        },
        {
          id: "aurora_gratitude_1",
          name: "Gratitude Garden",
          description: "Uplifting melodies for gratitude practice",
          keywords: ["gratitude", "uplifting", "positive", "growth"],
          mood: "grateful",
          energy: 4,
        },
      ],
      scarleet: [
        {
          id: "scarleet_power_1",
          name: "Confidence Unleashed",
          description: "High-energy tracks to boost your inner power",
          keywords: ["confidence", "power", "energetic", "bold"],
          mood: "empowered",
          energy: 8,
        },
        {
          id: "scarleet_stage_1",
          name: "Spotlight Ready",
          description: "Performance-ready anthems for your big moment",
          keywords: ["performance", "stage", "dramatic", "bold"],
          mood: "confident",
          energy: 9,
        },
        {
          id: "scarleet_success_1",
          name: "Victory Vibes",
          description: "Celebration music for your achievements",
          keywords: ["success", "celebration", "triumph", "victory"],
          mood: "triumphant",
          energy: 7,
        },
      ],
      luna: [
        {
          id: "luna_shadow_1",
          name: "Shadow Work Sessions",
          description: "Deep, introspective music for inner exploration",
          keywords: ["shadow work", "introspective", "deep", "mysterious"],
          mood: "contemplative",
          energy: 3,
        },
        {
          id: "luna_midnight_1",
          name: "Midnight Reflections",
          description: "Haunting melodies for late-night contemplation",
          keywords: ["midnight", "reflection", "mysterious", "deep"],
          mood: "reflective",
          energy: 2,
        },
        {
          id: "luna_dreams_1",
          name: "Dreamscape Journey",
          description: "Ethereal sounds for dream work and lucid dreaming",
          keywords: ["dreams", "ethereal", "subconscious", "mystical"],
          mood: "dreamy",
          energy: 1,
        },
      ],
    }

    const basePlaylists = basePlaylistsMap[personaId as keyof typeof basePlaylistsMap] || basePlaylistsMap.luna

    // Generate personalized variations based on keywords and mood
    const personalizedPlaylists = basePlaylists.map((playlist, index) => ({
      ...playlist,
      id: `${playlist.id}_${Date.now()}_${index}`,
      name: this.personalizePlaylistName(playlist.name, mood, keywords),
      description: this.personalizeDescription(playlist.description, mood),
      url: this.generateSpotifyUrl(playlist.keywords, mood),
    }))

    // Add completely new playlists based on user input
    if (keywords.length > 0) {
      const customPlaylist = {
        id: `custom_${personaId}_${Date.now()}`,
        name: `Your ${mood} Journey`,
        description: `Curated for your current ${mood} mood with ${keywords.join(", ")}`,
        url: this.generateSpotifyUrl(keywords, mood),
        keywords: keywords,
        mood: mood,
        energy: this.calculateEnergyFromMood(mood),
      }
      personalizedPlaylists.push(customPlaylist)
    }

    return personalizedPlaylists
  }

  private personalizePlaylistName(baseName: string, mood: string, keywords: string[]): string {
    const moodAdjectives = {
      happy: "Joyful",
      sad: "Melancholic",
      energetic: "Dynamic",
      calm: "Serene",
      anxious: "Soothing",
      confident: "Empowered",
      creative: "Inspired",
      focused: "Concentrated",
    }

    const adjective = moodAdjectives[mood as keyof typeof moodAdjectives] || "Personalized"
    return `${adjective} ${baseName}`
  }

  private personalizeDescription(baseDescription: string, mood: string): string {
    return `${baseDescription} - Tailored for your ${mood} mood`
  }

  private generateSpotifyUrl(keywords: string[], mood: string): string {
    // Generate search URL based on keywords and mood
    const searchTerms = [...keywords, mood].join(" ")
    return `https://open.spotify.com/search/${encodeURIComponent(searchTerms)}`
  }

  private calculateEnergyFromMood(mood: string): number {
    const energyMap: { [key: string]: number } = {
      happy: 7,
      sad: 3,
      energetic: 9,
      calm: 2,
      anxious: 4,
      confident: 8,
      creative: 6,
      focused: 5,
      peaceful: 2,
      empowered: 8,
      contemplative: 3,
      dreamy: 1,
    }
    return energyMap[mood] || 5
  }

  async getMoodBasedRecommendations(currentMood: string, personaId: string): Promise<SpotifyPlaylist[]> {
    const recommendations = await this.generatePersonalizedPlaylists(personaId, currentMood, [currentMood])
    return recommendations.slice(0, 3) // Return top 3 recommendations
  }

  saveUserInteraction(playlistId: string, action: "play" | "like" | "skip") {
    const interactions = JSON.parse(localStorage.getItem("spotify_interactions") || "[]")
    interactions.push({
      playlistId,
      action,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("spotify_interactions", JSON.stringify(interactions))
  }
}

export const spotifyService = SpotifyService.getInstance()
