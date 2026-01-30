import type { AIMessage } from '../types'

export abstract class ContextBuilder {
  protected systemPrompt: string = ''
  protected userContext: Record<string, unknown> = {}

  abstract build(userMessage: string): AIMessage[]

  protected formatContext(): string {
    return Object.entries(this.userContext)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')
  }
}
