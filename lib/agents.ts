import { VectorStoreManager } from './vector-store'
import { embeddingService } from './embedding-service'
import { personas } from './personas'
import type { Persona } from '@/types/persona'

export interface AgentResponse {
  response: string
  context: Array<{ content: string; score: number }>
  personaId: string
}

export abstract class BaseAgent {
  protected vectorStore: VectorStoreManager
  protected personaId: string
  protected persona: Persona

  constructor(vectorStore: VectorStoreManager, personaId: string) {
    this.vectorStore = vectorStore
    this.personaId = personaId
    const persona = personas.find((p) => p.id === personaId)
    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`)
    }
    this.persona = persona
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize()
  }

  protected abstract getRelevantTypes(): string[]
  protected abstract buildSystemPrompt(context: string): string

  async processQuery(query: string): Promise<AgentResponse> {
    try {
      // Get relevant context from vector store
      const relevantTypes = this.getRelevantTypes()
      const contextResults = await Promise.all(
        relevantTypes.map((type) =>
          this.vectorStore.searchSimilar(query, this.personaId, type, 3)
        )
      )

      // Flatten and deduplicate results
      const allResults = contextResults.flat()
      const uniqueResults = allResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.content === result.content)
      )

      // Sort by score and take top results
      const topResults = uniqueResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      // Build context string
      const context = topResults
        .map((result) => `[Score: ${result.score.toFixed(3)}] ${result.content}`)
        .join('\n\n')

      return {
        response: this.buildSystemPrompt(context),
        context: topResults,
        personaId: this.personaId,
      }
    } catch (error) {
      console.error('Error processing query:', error)
      // Fallback to basic persona context
      return {
        response: this.buildSystemPrompt(''),
        context: [],
        personaId: this.personaId,
      }
    }
  }

  protected getBasePersonaContext(): string {
    return `You are ${this.persona.name} (${this.persona.title}), ${this.persona.description}

Your personality: ${this.persona.personality.join(', ')}
Your role: ${this.persona.role}
Your conversation style: ${this.persona.conversationStyle}

Background: ${this.persona.background}
Target audience: ${this.persona.targetAudience}`
  }
}

export class RitualAgent extends BaseAgent {
  protected getRelevantTypes(): string[] {
    return ['ritual', 'persona']
  }

  protected buildSystemPrompt(context: string): string {
    const baseContext = this.getBasePersonaContext()
    
    let systemPrompt = `${baseContext}

As a ritual and spiritual practice guide, you help users establish meaningful daily routines, mindfulness practices, and spiritual rituals. You draw from your deep knowledge of meditation, wellness practices, and personal growth techniques.

Your tasks include:
- Guiding morning and evening rituals
- Providing meditation and mindfulness practices
- Suggesting spiritual and wellness routines
- Offering wisdom for personal growth
- Creating personalized ritual recommendations

Daily schedule for inspiration:
${Object.entries(this.persona.dailySchedule)
  .map(([time, activity]) => `${time}: ${activity}`)
  .join('\n')}

Your hobbies that inform your guidance: ${this.persona.hobbies.join(', ')}`

    if (context) {
      systemPrompt += `\n\nRelevant context from your knowledge base:\n${context}\n\nUse this context to provide more specific and relevant ritual guidance.`
    }

    return systemPrompt
  }
}

export class MoodReflectionAgent extends BaseAgent {
  protected getRelevantTypes(): string[] {
    return ['insight', 'persona']
  }

  protected buildSystemPrompt(context: string): string {
    const baseContext = this.getBasePersonaContext()
    
    let systemPrompt = `${baseContext}

As a mood reflection and emotional intelligence guide, you help users understand their emotional patterns, identify triggers, and develop healthier emotional responses. You excel at pattern recognition and providing insights into emotional well-being.

Your tasks include:
- Analyzing mood patterns and trends
- Identifying emotional triggers and responses
- Providing insights into emotional well-being
- Suggesting coping strategies and emotional regulation techniques
- Helping users understand their emotional journey
- Offering personalized advice based on mood data

You draw from psychological principles, emotional intelligence research, and your understanding of human emotional patterns.`

    if (context) {
      systemPrompt += `\n\nRelevant context from your knowledge base:\n${context}\n\nUse this context to provide more personalized and insightful mood reflection guidance.`
    }

    return systemPrompt
  }
}

export class ShadowWorkAgent extends BaseAgent {
  protected getRelevantTypes(): string[] {
    return ['insight', 'persona']
  }

  protected buildSystemPrompt(context: string): string {
    const baseContext = this.getBasePersonaContext()
    
    let systemPrompt = `${baseContext}

As a shadow work and deep psychological exploration guide, you help users confront their hidden aspects, understand their unconscious patterns, and integrate their shadow self for wholeness and authenticity.

Your tasks include:
- Facilitating shadow work exercises
- Helping users explore repressed emotions and aspects
- Providing insights into unconscious patterns
- Guiding through difficult emotional terrain
- Offering honest, sometimes challenging perspectives
- Supporting integration of shadow aspects

You work with depth psychology, Jungian concepts, and transformative practices. You're comfortable with darkness and help users find strength in their hidden aspects.

Your approach is direct but compassionate, helping users face difficult truths about themselves while providing support for integration and growth.`

    if (context) {
      systemPrompt += `\n\nRelevant context from your knowledge base:\n${context}\n\nUse this context to provide more targeted and relevant shadow work guidance, drawing from specific insights and approaches that match the user's needs.`
    }

    return systemPrompt
  }
}

export class GeneralWisdomAgent extends BaseAgent {
  protected getRelevantTypes(): string[] {
    return ['persona', 'insight', 'advice']
  }

  protected buildSystemPrompt(context: string): string {
    const baseContext = this.getBasePersonaContext()
    
    let systemPrompt = `${baseContext}

You provide general wisdom, life guidance, and support across all areas of personal development. You can draw from your full range of knowledge and experience to help users with various life challenges and questions.

Your tasks include:
- Providing general life guidance and wisdom
- Offering perspective on various life situations
- Supporting personal growth and development
- Sharing insights from your knowledge and experience
- Helping users navigate life challenges

Your preferences and influences:
- Favorite books: ${this.persona.favoriteBooks.join(', ')}
- Favorite music: ${this.persona.favoriteSongs.join(', ')}
- Favorite movies: ${this.persona.favoriteMovies.join(', ')}`

    if (context) {
      systemPrompt += `\n\nRelevant context from your knowledge base:\n${context}\n\nUse this context to provide more specific and relevant guidance tailored to the user's query.`
    }

    return systemPrompt
  }
}

// Factory function to create appropriate agent based on persona and query type
export function createAgent(
  personaId: string,
  queryType: 'ritual' | 'mood' | 'shadow' | 'general' = 'general',
  vectorStore?: VectorStoreManager
): BaseAgent {
  // Use specialized vector stores for different agent types
  let store: VectorStoreManager
  
  if (vectorStore) {
    store = vectorStore
  } else {
    // Import the appropriate store based on query type
    const { ritualVectorStore, moodVectorStore, shadowVectorStore, generalVectorStore } = require('./vector-store')
    
    switch (queryType) {
      case 'ritual':
        store = ritualVectorStore
        break
      case 'mood':
        store = moodVectorStore
        break
      case 'shadow':
        store = shadowVectorStore
        break
      default:
        store = generalVectorStore
        break
    }
  }

  switch (queryType) {
    case 'ritual':
      return new RitualAgent(store, personaId)
    case 'mood':
      return new MoodReflectionAgent(store, personaId)
    case 'shadow':
      return new ShadowWorkAgent(store, personaId)
    default:
      return new GeneralWisdomAgent(store, personaId)
  }
}

// Helper function to determine query type based on content
export function detectQueryType(query: string): 'ritual' | 'mood' | 'shadow' | 'general' {
  const lowerQuery = query.toLowerCase()
  
  // Ritual keywords
  if (
    lowerQuery.includes('ritual') ||
    lowerQuery.includes('routine') ||
    lowerQuery.includes('morning') ||
    lowerQuery.includes('meditation') ||
    lowerQuery.includes('practice') ||
    lowerQuery.includes('spiritual') ||
    lowerQuery.includes('mindfulness')
  ) {
    return 'ritual'
  }
  
  // Mood reflection keywords
  if (
    lowerQuery.includes('mood') ||
    lowerQuery.includes('feeling') ||
    lowerQuery.includes('emotion') ||
    lowerQuery.includes('pattern') ||
    lowerQuery.includes('track') ||
    lowerQuery.includes('analysis') ||
    lowerQuery.includes('reflect')
  ) {
    return 'mood'
  }
  
  // Shadow work keywords
  if (
    lowerQuery.includes('shadow') ||
    lowerQuery.includes('dark') ||
    lowerQuery.includes('hidden') ||
    lowerQuery.includes('unconscious') ||
    lowerQuery.includes('fear') ||
    lowerQuery.includes('integrate') ||
    lowerQuery.includes('confront') ||
    lowerQuery.includes('deeper')
  ) {
    return 'shadow'
  }
  
  return 'general'
}