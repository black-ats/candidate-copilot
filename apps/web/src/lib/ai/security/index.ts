export { validateInput, type InputValidationResult } from './input-guard'
export { checkTopic, type TopicCheckResult } from './topic-guard'

import { validateInput } from './input-guard'
import { checkTopic } from './topic-guard'

export type SecurityCheckResult = {
  allowed: boolean
  reason?: string
  suggestedResponse?: string
}

/**
 * Executa todas as verificações de segurança
 */
export function runSecurityChecks(message: string): SecurityCheckResult {
  // 1. Validar input (injection, sanitização)
  const inputResult = validateInput(message)
  
  if (!inputResult.valid) {
    return {
      allowed: false,
      reason: inputResult.reason,
      suggestedResponse: inputResult.reason,
    }
  }
  
  // 2. Verificar tópico
  const topicResult = checkTopic(inputResult.sanitized)
  
  if (!topicResult.onTopic) {
    return {
      allowed: false,
      reason: 'off_topic',
      suggestedResponse: topicResult.suggestedResponse,
    }
  }
  
  return {
    allowed: true,
  }
}
