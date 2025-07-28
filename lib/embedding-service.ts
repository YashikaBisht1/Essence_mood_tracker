// Simple embedding service using local computation
export class EmbeddingService {
  private cache: Map<string, number[]> = new Map()

  async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!
    }

    // Simple text-to-vector conversion (in production, use proper embeddings)
    const embedding = this.textToVector(text)
    this.cache.set(text, embedding)
    return embedding
  }

  private textToVector(text: string): number[] {
    // Simple hash-based embedding (replace with proper embeddings in production)
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

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

export const embeddingService = new EmbeddingService()
