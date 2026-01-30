/**
 * Input Guard - Protege contra prompt injection e inputs maliciosos
 */

export type InputValidationResult = {
  valid: boolean
  sanitized: string
  blocked: boolean
  reason?: string
}

// Padrões comuns de prompt injection
const INJECTION_PATTERNS = [
  // Tentativas de ignorar instruções
  /ignore\s*(all\s*)?(previous|above|prior)\s*(instructions?|prompts?|rules?)/i,
  /disregard\s*(all\s*)?(previous|above|prior)/i,
  /forget\s*(everything|all|your)\s*(instructions?|rules?|prompts?)/i,
  
  // Tentativas de mudar o papel/persona
  /you\s*are\s*now\s*(a|an|the)/i,
  /act\s*as\s*(a|an|if)/i,
  /pretend\s*(to\s*be|you\s*are)/i,
  /roleplay\s*as/i,
  /switch\s*(to|into)\s*(a|an)/i,
  
  // Tentativas de extrair system prompt
  /what\s*(is|are)\s*your\s*(instructions?|prompts?|rules?|system)/i,
  /show\s*(me\s*)?(your\s*)?(system\s*)?prompt/i,
  /reveal\s*(your\s*)?(instructions?|prompts?)/i,
  /print\s*(your\s*)?(system|initial)\s*(prompt|message)/i,
  
  // Tentativas de bypass com delimitadores
  /\[\s*system\s*\]/i,
  /\[\s*INST\s*\]/i,
  /<\s*\|?\s*system\s*\|?\s*>/i,
  /###\s*(system|instruction)/i,
  
  // Tentativas de injeção via markdown/código
  /```\s*(system|prompt|instruction)/i,
  
  // Tentativas de acessar dados de outros usuários
  /other\s*users?\s*(data|info|applications?)/i,
  /all\s*users?\s*(data|info|metrics?)/i,
  /dados?\s*(de\s*)?outros?\s*usuarios?/i,
  /informacoes?\s*(de\s*)?outros?\s*usuarios?/i,
]

// Palavras-chave que indicam tentativa de manipulação
const MANIPULATION_KEYWORDS = [
  'jailbreak',
  'dan mode',
  'developer mode',
  'sudo',
  'admin mode',
  'bypass',
  'override',
  'hack',
]

/**
 * Detecta tentativas de prompt injection
 */
function detectInjection(input: string): { detected: boolean; pattern?: string } {
  const normalizedInput = input.toLowerCase()
  
  // Verificar padrões de regex
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { detected: true, pattern: pattern.toString() }
    }
  }
  
  // Verificar keywords de manipulação
  for (const keyword of MANIPULATION_KEYWORDS) {
    if (normalizedInput.includes(keyword)) {
      return { detected: true, pattern: `keyword: ${keyword}` }
    }
  }
  
  return { detected: false }
}

/**
 * Sanitiza o input removendo caracteres potencialmente perigosos
 */
function sanitizeInput(input: string): string {
  return input
    // Remover caracteres de controle Unicode (exceto newlines e tabs)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Limitar sequências repetidas de caracteres especiais
    .replace(/([#*`_~\[\]<>{}])\1{3,}/g, '$1$1$1')
    // Remover tentativas de escape
    .replace(/\\{2,}/g, '\\')
    // Trim e limitar tamanho
    .trim()
    .slice(0, 2000)
}

/**
 * Valida e sanitiza o input do usuário
 */
export function validateInput(input: string): InputValidationResult {
  // Input vazio ou muito curto
  if (!input || input.trim().length < 2) {
    return {
      valid: false,
      sanitized: '',
      blocked: true,
      reason: 'Mensagem muito curta',
    }
  }
  
  // Input muito longo
  if (input.length > 2000) {
    return {
      valid: false,
      sanitized: '',
      blocked: true,
      reason: 'Mensagem muito longa (máximo 2000 caracteres)',
    }
  }
  
  // Sanitizar
  const sanitized = sanitizeInput(input)
  
  // Detectar injection
  const injection = detectInjection(sanitized)
  if (injection.detected) {
    console.warn(`[Security] Prompt injection detected: ${injection.pattern}`)
    return {
      valid: false,
      sanitized: '',
      blocked: true,
      reason: 'Sua mensagem contém padrões não permitidos',
    }
  }
  
  return {
    valid: true,
    sanitized,
    blocked: false,
  }
}
