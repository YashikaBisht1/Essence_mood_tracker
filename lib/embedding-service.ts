import { pipeline, Pipeline } from '@xenova/transformers'

// Enhanced embedding service using Hugging Face transformers
export class EmbeddingService {
  private cache: Map<string, number[]> = new Map()
  private extractor: Pipeline | null = null
  private initPromise: Promise<void> | null = null

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.initializeModel()
    return this.initPromise
  }

  private async initializeModel(): Promise<void> {
    try {
      console.log('Initializing sentence-transformers/all-mpnet-base-v2 model...')
      this.extractor = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-mpnet-base-v2',
        {
          quantized: true, // Use quantized model for better performance
        }
      )
      console.log('Embedding model initialized successfully')
    } catch (error) {
      console.error('Failed to initialize embedding model:', error)
      // Fallback to simple embedding if model fails to load
      this.extractor = null
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!
    }

    let embedding: number[]

    if (this.extractor) {
      try {
        // Use Hugging Face model
        const output = await this.extractor(text, { pooling: 'mean', normalize: true })
        embedding = Array.from(output.data)
      } catch (error) {
        console.error('Error getting embedding from model:', error)
        // Fallback to simple embedding
        embedding = this.textToVector(text)
      }
    } else {
      // Fallback to simple embedding
      embedding = this.textToVector(text)
    }

    this.cache.set(text, embedding)
    return embedding
  }

  private textToVector(text: string): number[] {
    // Simple hash-based embedding (fallback)
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 0)
    const vector = new Array(384).fill(0) // Standard embedding size

    words.forEach((word, index) => {
      const hash = this.simpleHash(word)
      vector[hash % vector.length] += 1 / (index + 1)
    })

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? vector.map((val) => val / magnitude) : vector
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Get multiple embeddings efficiently
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []
    for (const text of texts) {
      const embedding = await this.getEmbedding(text)
      embeddings.push(embedding)
    }
    return embeddings
  }
}

export const embeddingService = new EmbeddingService()
