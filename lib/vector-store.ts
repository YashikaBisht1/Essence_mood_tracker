import { QdrantClient } from '@qdrant/qdrant-js'
import { embeddingService } from './embedding-service'
import { personas } from './personas'
import type { Persona } from '@/types/persona'

export interface VectorDocument {
  id: string
  content: string
  metadata: {
    personaId: string
    type: 'persona' | 'ritual' | 'insight' | 'advice'
    category?: string
  }
  embedding?: number[]
}

export class VectorStoreManager {
  private client: QdrantClient | null = null
  private collectionName: string
  private isInitialized = false

  constructor(collectionName: string = 'essence_personas') {
    this.collectionName = collectionName
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize embedding service first
      await embeddingService.initialize()

      // Initialize Qdrant client
      const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333'
      const qdrantApiKey = process.env.QDRANT_API_KEY

      this.client = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantApiKey,
      })

      // Test connection
      await this.client.getCollections()
      console.log('Successfully connected to Qdrant')

      // Check if collection exists and create if needed
      await this.ensureCollection()
      
      // Initialize with persona data if collection is empty
      await this.initializePersonaData()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize vector store:', error)
      // Don't throw error to allow fallback behavior
    }
  }

  private async ensureCollection(): Promise<void> {
    if (!this.client) return

    try {
      const collections = await this.client.getCollections()
      const collectionExists = collections.collections.some(
        (col) => col.name === this.collectionName
      )

      if (!collectionExists) {
        console.log(`Creating collection: ${this.collectionName}`)
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 384, // sentence-transformers/all-mpnet-base-v2 embedding size
            distance: 'Cosine',
          },
        })
        console.log(`Collection ${this.collectionName} created successfully`)
      } else {
        console.log(`Collection ${this.collectionName} already exists`)
      }
    } catch (error) {
      console.error('Error ensuring collection:', error)
      throw error
    }
  }

  private async initializePersonaData(): Promise<void> {
    if (!this.client) return

    try {
      // Check if collection has data
      const count = await this.client.count(this.collectionName)
      if (count.count > 0) {
        console.log(`Collection ${this.collectionName} already has ${count.count} documents`)
        return
      }

      console.log('Initializing persona data in vector store...')
      const documents = await this.preparePersonaDocuments()
      
      if (documents.length === 0) {
        console.log('No documents to add')
        return
      }

      // Add documents in batches
      const batchSize = 10
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize)
        await this.addDocuments(batch)
      }

      console.log(`Successfully added ${documents.length} documents to vector store`)
    } catch (error) {
      console.error('Error initializing persona data:', error)
    }
  }

  private async preparePersonaDocuments(): Promise<VectorDocument[]> {
    const documents: VectorDocument[] = []

    for (const persona of personas) {
      // Add main persona description
      documents.push({
        id: `${persona.id}-main`,
        content: `${persona.name} (${persona.title}): ${persona.description}. ${persona.tagline}. Background: ${persona.background}`,
        metadata: {
          personaId: persona.id,
          type: 'persona',
          category: 'main',
        },
      })

      // Add personality and role information
      documents.push({
        id: `${persona.id}-personality`,
        content: `${persona.name} personality: ${persona.personality.join(', ')}. Role: ${persona.role}. Target audience: ${persona.targetAudience}`,
        metadata: {
          personaId: persona.id,
          type: 'persona',
          category: 'personality',
        },
      })

      // Add conversation style and approach
      documents.push({
        id: `${persona.id}-style`,
        content: `${persona.name} conversation style: ${persona.conversationStyle}. Physical description: ${persona.physicalDescription}`,
        metadata: {
          personaId: persona.id,
          type: 'persona',
          category: 'style',
        },
      })

      // Add tasks and capabilities
      documents.push({
        id: `${persona.id}-tasks`,
        content: `${persona.name} tasks and capabilities: ${persona.tasks.join(', ')}. Hobbies: ${persona.hobbies.join(', ')}`,
        metadata: {
          personaId: persona.id,
          type: 'persona',
          category: 'capabilities',
        },
      })

      // Add daily schedule as routines/rituals
      const scheduleEntries = Object.entries(persona.dailySchedule).map(
        ([time, activity]) => `${time}: ${activity}`
      )
      documents.push({
        id: `${persona.id}-schedule`,
        content: `${persona.name} daily routine: ${scheduleEntries.join('. ')}`,
        metadata: {
          personaId: persona.id,
          type: 'ritual',
          category: 'daily-routine',
        },
      })

      // Add preferences as insights
      documents.push({
        id: `${persona.id}-preferences`,
        content: `${persona.name} preferences - Books: ${persona.favoriteBooks.join(', ')}. Songs: ${persona.favoriteSongs.join(', ')}. Movies: ${persona.favoriteMovies.join(', ')}`,
        metadata: {
          personaId: persona.id,
          type: 'insight',
          category: 'preferences',
        },
      })
    }

    return documents
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.client || documents.length === 0) return

    try {
      const points = await Promise.all(
        documents.map(async (doc) => {
          const embedding = await embeddingService.getEmbedding(doc.content)
          return {
            id: doc.id,
            vector: embedding,
            payload: {
              content: doc.content,
              ...doc.metadata,
            },
          }
        })
      )

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      })
    } catch (error) {
      console.error('Error adding documents:', error)
      throw error
    }
  }

  async searchSimilar(
    query: string,
    personaId?: string,
    type?: string,
    limit: number = 5
  ): Promise<Array<{ content: string; score: number; metadata: any }>> {
    if (!this.client) {
      console.log('Vector store not available, using fallback search')
      return this.fallbackSearch(query, personaId, type, limit)
    }

    try {
      const queryEmbedding = await embeddingService.getEmbedding(query)
      
      const filter: any = {}
      if (personaId) {
        filter.must = [{ key: 'personaId', match: { value: personaId } }]
      }
      if (type) {
        if (filter.must) {
          filter.must.push({ key: 'type', match: { value: type } })
        } else {
          filter.must = [{ key: 'type', match: { value: type } }]
        }
      }

      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit,
        with_payload: true,
      })

      return searchResult.map((result) => ({
        content: result.payload?.content as string,
        score: result.score,
        metadata: {
          personaId: result.payload?.personaId,
          type: result.payload?.type,
          category: result.payload?.category,
        },
      }))
    } catch (error) {
      console.error('Error searching vector store:', error)
      return this.fallbackSearch(query, personaId, type, limit)
    }
  }

  private async fallbackSearch(
    query: string,
    personaId?: string,
    type?: string,
    limit: number = 5
  ): Promise<Array<{ content: string; score: number; metadata: any }>> {
    // Fallback search using local data and embedding similarity
    const documents = await this.preparePersonaDocuments()
    const queryEmbedding = await embeddingService.getEmbedding(query)

    let filteredDocs = documents
    if (personaId) {
      filteredDocs = filteredDocs.filter((doc) => doc.metadata.personaId === personaId)
    }
    if (type) {
      filteredDocs = filteredDocs.filter((doc) => doc.metadata.type === type)
    }

    const results = await Promise.all(
      filteredDocs.map(async (doc) => {
        const docEmbedding = await embeddingService.getEmbedding(doc.content)
        const score = embeddingService.cosineSimilarity(queryEmbedding, docEmbedding)
        return {
          content: doc.content,
          score,
          metadata: doc.metadata,
        }
      })
    )

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  async isReady(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return this.isInitialized && this.client !== null
  }

  async getCollectionInfo(): Promise<any> {
    if (!this.client) return null

    try {
      const info = await this.client.getCollection(this.collectionName)
      const count = await this.client.count(this.collectionName)
      return { ...info, count: count.count }
    } catch (error) {
      console.error('Error getting collection info:', error)
      return null
    }
  }
}

// Export singleton instances for different agent types
export const ritualVectorStore = new VectorStoreManager('essence_rituals')
export const moodVectorStore = new VectorStoreManager('essence_mood_patterns')
export const shadowVectorStore = new VectorStoreManager('essence_shadow_work')
export const generalVectorStore = new VectorStoreManager('essence_personas')