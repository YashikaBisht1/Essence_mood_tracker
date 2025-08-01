import { generalVectorStore, ritualVectorStore, moodVectorStore, shadowVectorStore } from './vector-store'
import { embeddingService } from './embedding-service'

export async function initializeAllVectorStores(): Promise<void> {
  console.log('Initializing all vector stores...')
  
  try {
    // Initialize embedding service first
    await embeddingService.initialize()
    console.log('Embedding service initialized')
    
    // Initialize all vector stores
    await Promise.all([
      generalVectorStore.initialize(),
      ritualVectorStore.initialize(),
      moodVectorStore.initialize(),
      shadowVectorStore.initialize(),
    ])
    
    console.log('All vector stores initialized successfully')
  } catch (error) {
    console.error('Error initializing vector stores:', error)
    console.log('Vector stores will use fallback mode')
  }
}

export async function testVectorStoreConnection(): Promise<{
  status: 'connected' | 'fallback' | 'error'
  details: any
}> {
  try {
    const isReady = await generalVectorStore.isReady()
    
    if (isReady) {
      const info = await generalVectorStore.getCollectionInfo()
      return {
        status: 'connected',
        details: {
          connected: true,
          collectionInfo: info,
          embeddingService: 'huggingface'
        }
      }
    } else {
      return {
        status: 'fallback',
        details: {
          connected: false,
          message: 'Using fallback search with local embeddings',
          embeddingService: 'local'
        }
      }
    }
  } catch (error) {
    return {
      status: 'error',
      details: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        embeddingService: 'none'
      }
    }
  }
}

export async function searchExample(query: string = 'meditation routine'): Promise<any> {
  try {
    await generalVectorStore.initialize()
    const results = await generalVectorStore.searchSimilar(query, undefined, undefined, 3)
    
    return {
      query,
      results: results.map(r => ({
        content: r.content.substring(0, 100) + '...',
        score: r.score,
        metadata: r.metadata
      }))
    }
  } catch (error) {
    return {
      query,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to validate environment setup
export function validateEnvironment(): {
  valid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Check for Qdrant configuration
  if (!process.env.QDRANT_URL) {
    issues.push('QDRANT_URL not configured')
    recommendations.push('Sign up for Qdrant Cloud (free tier) at https://cloud.qdrant.io/')
  }
  
  if (!process.env.QDRANT_API_KEY) {
    issues.push('QDRANT_API_KEY not configured')
    recommendations.push('Get your API key from Qdrant Cloud dashboard')
  }
  
  if (!process.env.GROQ_API_KEY) {
    issues.push('GROQ_API_KEY not configured')
    recommendations.push('Get your Groq API key from https://console.groq.com/')
  }
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  }
}