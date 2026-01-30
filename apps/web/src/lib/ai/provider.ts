import type { AIMessage, AIResponse, AIStreamChunk, AIConfig } from './types'
import { OpenAIProvider } from './openai/provider'
import { MockProvider } from './mock/provider'

export interface AIProvider {
  // Resposta completa
  complete(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse>

  // Resposta em streaming
  stream(messages: AIMessage[], config?: Partial<AIConfig>): AsyncIterable<AIStreamChunk>
}

// Factory para obter provider
export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'openai'

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider()
    case 'mock':
      return new MockProvider()
    default:
      throw new Error(`Unknown AI provider: ${providerType}`)
  }
}
