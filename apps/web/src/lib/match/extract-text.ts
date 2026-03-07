import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'
import { logger } from '@/lib/logger'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const SUPPORTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
}

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.txt': 'txt',
}

function detectFileType(file: File): string | null {
  if (SUPPORTED_TYPES[file.type]) {
    return SUPPORTED_TYPES[file.type]
  }

  const name = file.name.toLowerCase()
  for (const [ext, type] of Object.entries(SUPPORTED_EXTENSIONS)) {
    if (name.endsWith(ext)) return type
  }

  return null
}

export async function extractTextFromUpload(file: File): Promise<{
  text: string
  error?: string
}> {
  if (file.size > MAX_FILE_SIZE) {
    return { text: '', error: 'Arquivo muito grande. Máximo 5MB.' }
  }

  const fileType = detectFileType(file)
  if (!fileType) {
    return { text: '', error: 'Formato não suportado. Use PDF, DOCX ou TXT.' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    switch (fileType) {
      case 'pdf': {
        const parser = new PDFParse({ data: new Uint8Array(buffer) })
        const result = await parser.getText()
        await parser.destroy()
        const text = result.text?.trim()
        if (!text) {
          return { text: '', error: 'Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem escaneada. Tente colar o texto diretamente.' }
        }
        return { text }
      }

      case 'docx': {
        const result = await mammoth.extractRawText({ buffer })
        const text = result.value?.trim()
        if (!text) {
          return { text: '', error: 'Não foi possível extrair texto do DOCX. Tente colar o texto diretamente.' }
        }
        return { text }
      }

      case 'txt': {
        const text = buffer.toString('utf-8').trim()
        if (!text) {
          return { text: '', error: 'Arquivo vazio.' }
        }
        return { text }
      }

      default:
        return { text: '', error: 'Formato não suportado.' }
    }
  } catch (err) {
    logger.error('File text extraction failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
      feature: 'resume_match',
    })
    return { text: '', error: 'Erro ao processar o arquivo. Tente colar o texto diretamente.' }
  }
}
