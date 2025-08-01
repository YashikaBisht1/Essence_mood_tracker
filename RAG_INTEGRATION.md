# RAG Integration for Essence Mood Tracker

This document describes the Retrieval-Augmented Generation (RAG) implementation that enhances the mood tracker app with intelligent context retrieval and persona-specific knowledge.

## Overview

The RAG system integrates vector search capabilities with the existing persona-based chat system, allowing for more contextually relevant and specialized responses based on the user's query type and chosen persona.

## Architecture

### Core Components

1. **Vector Store Manager** (`lib/vector-store.ts`)
   - Manages Qdrant Cloud vector database connections
   - Handles persona data indexing and retrieval
   - Provides fallback search when vector DB is unavailable

2. **Enhanced Embedding Service** (`lib/embedding-service.ts`)
   - Uses Hugging Face `sentence-transformers/all-mpnet-base-v2` model
   - Provides local embedding generation with caching
   - Falls back to simple hash-based embeddings if model fails

3. **Agentic System** (`lib/agents.ts`)
   - **RitualAgent**: Specializes in spiritual practices, routines, and rituals
   - **MoodReflectionAgent**: Focuses on emotional patterns and mood analysis
   - **ShadowWorkAgent**: Handles deep psychological exploration and shadow work
   - **GeneralWisdomAgent**: Provides general life guidance and support

4. **Enhanced Chat API** (`app/api/chat/route.ts`)
   - Automatically detects query type (ritual, mood, shadow, or general)
   - Creates appropriate agent for the persona and query type
   - Retrieves relevant context from vector store
   - Feeds enhanced context to LLM for better responses

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster-url.qdrant.io
QDRANT_API_KEY=your-api-key-here

# Groq API (existing)
GROQ_API_KEY=your-groq-api-key
```

### 2. Qdrant Cloud Setup

1. Sign up for a free account at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a new cluster
3. Copy the cluster URL and API key to your environment variables

### 3. Local Development (Optional)

To run Qdrant locally for development:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Then set `QDRANT_URL=http://localhost:6333` in your environment.

## Usage

### Automatic Query Detection

The system automatically detects the type of query based on keywords:

- **Ritual queries**: meditation, routine, morning, spiritual, practice
- **Mood queries**: mood, feeling, emotion, pattern, track, analysis
- **Shadow work**: shadow, dark, hidden, unconscious, fear, integrate
- **General**: All other queries

### Agent Specialization

Each persona can operate in different agent modes:

- **Aurora** excels as a Ritual Agent for spiritual practices
- **Luna** specializes as a Shadow Work Agent for deep exploration
- **Scarleet** works well as a General Wisdom Agent for confidence building
- All personas can function in Mood Reflection mode

### Vector Store Collections

The system uses separate vector stores for different agent types:

- `essence_personas`: General persona knowledge
- `essence_rituals`: Ritual and spiritual practice data
- `essence_mood_patterns`: Mood and emotional pattern insights
- `essence_shadow_work`: Shadow work and deep psychology data

## API Endpoints

### Chat API (`/api/chat`)

Enhanced to support RAG with the following request format:

```typescript
{
  messages: ChatMessage[],
  personaId: string
}
```

Response includes metadata about the RAG process:

```typescript
{
  content: string,
  metadata: {
    queryType: 'ritual' | 'mood' | 'shadow' | 'general',
    contextUsed: number,
    agentType: string,
    personaId: string
  }
}
```

### RAG Test API (`/api/rag-test`)

For testing and validating the RAG system:

- `GET /api/rag-test?action=status` - Check vector store connection and environment
- `GET /api/rag-test?action=search&query=meditation` - Test search functionality
- `GET /api/rag-test?action=validate` - Validate environment configuration

## Technical Details

### Embedding Model

Uses the `sentence-transformers/all-mpnet-base-v2` model, which provides:
- 384-dimensional embeddings
- Excellent semantic understanding
- Good performance on sentence similarity tasks

### Vector Database

Qdrant Cloud provides:
- Cosine similarity search
- High-performance vector operations
- Free tier suitable for development and small applications
- RESTful API for easy integration

### Fallback Strategy

The system gracefully degrades when components are unavailable:

1. If Qdrant is unavailable, uses local similarity search
2. If Hugging Face model fails, uses simple hash-based embeddings
3. If RAG system fails entirely, falls back to basic persona context

## Monitoring and Debugging

### RAG Test Endpoint

Use the test endpoint to monitor system health:

```bash
curl "http://localhost:3000/api/rag-test?action=status"
```

### Console Logging

The system logs helpful information for debugging:
- Agent type selection
- Number of context documents retrieved
- Vector store connection status
- Embedding model initialization

## Performance Considerations

1. **Embedding Caching**: Embeddings are cached to avoid recomputation
2. **Batch Processing**: Documents are processed in batches during initialization
3. **Lazy Loading**: Vector stores initialize only when needed
4. **Model Quantization**: Uses quantized Hugging Face models for better performance

## Extending the System

### Adding New Agent Types

1. Create a new agent class extending `BaseAgent`
2. Implement `getRelevantTypes()` and `buildSystemPrompt()`
3. Add to the `createAgent()` factory function
4. Update query type detection in `detectQueryType()`

### Adding Custom Data

1. Extend `preparePersonaDocuments()` in `VectorStoreManager`
2. Add new document types with appropriate metadata
3. Update agent implementations to handle new data types

### Custom Vector Stores

Create specialized vector stores for specific use cases:

```typescript
const customVectorStore = new VectorStoreManager('custom_collection')
await customVectorStore.initialize()
```

## Troubleshooting

### Common Issues

1. **Qdrant Connection Failed**: Check your API key and cluster URL
2. **Embedding Model Not Loading**: Ensure internet connection and sufficient memory
3. **No Context Retrieved**: Verify persona data was properly indexed
4. **Slow Responses**: Consider using local Qdrant instance for development

### Debug Commands

```bash
# Test vector store connection
curl "http://localhost:3000/api/rag-test?action=status"

# Test search functionality
curl "http://localhost:3000/api/rag-test?action=search&query=meditation"

# Validate environment
curl "http://localhost:3000/api/rag-test?action=validate"
```

## Security Considerations

- API keys should be stored securely in environment variables
- Vector store access is controlled through Qdrant Cloud authentication
- No sensitive user data is stored in the vector database
- All persona data is public knowledge suitable for indexing