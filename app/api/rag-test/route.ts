import { NextResponse } from "next/server"
import { testVectorStoreConnection, searchExample, validateEnvironment } from "@/lib/rag-utils"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'status'
  const query = searchParams.get('query')

  try {
    switch (action) {
      case 'status':
        const connection = await testVectorStoreConnection()
        const env = validateEnvironment()
        
        return NextResponse.json({
          vectorStore: connection,
          environment: env,
          timestamp: new Date().toISOString()
        })

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 })
        }
        
        const searchResult = await searchExample(query)
        return NextResponse.json(searchResult)

      case 'validate':
        const validation = validateEnvironment()
        return NextResponse.json(validation)

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: ['status', 'search', 'validate']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('RAG test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}