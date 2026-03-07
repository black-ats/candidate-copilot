'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card } from '@ui/components'
import {
  Sparkles,
  Upload,
  FileText,
  ArrowRight,
  AlertCircle,
  Target,
  Shield,
  TrendingUp,
  Loader2,
  X,
} from 'lucide-react'
import { analyzeMatchAction } from './actions'
import { track } from '@/lib/analytics/track'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file)
      return
    }
    reject(new Error('Formato não suportado. Use um arquivo .txt ou cole o texto diretamente.'))
  })
}

export default function MatchPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = resumeText.trim().length >= 50 && jobDescription.trim().length >= 50

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande. Máximo 5MB.')
      return
    }

    try {
      const text = await extractTextFromFile(file)
      setResumeText(text)
      setFileName(file.name)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ler arquivo')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveFile() {
    setResumeText('')
    setFileName(null)
  }

  async function handleAnalyze() {
    if (!canSubmit || isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await analyzeMatchAction({
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
      })

      if (response.success) {
        sessionStorage.setItem('matchResult', JSON.stringify({
          ...response.result,
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
        }))
        track('insight_generated', { insightType: 'resume_match' })
        router.push('/match/resultado')
      } else {
        setError(response.error)
        setIsAnalyzing(false)
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Target className="w-8 h-8 text-navy" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Analisando compatibilidade...</h2>
          <p className="text-navy/70 max-w-sm mx-auto">
            Estamos comparando seu currículo com a vaga, identificando gaps e gerando recomendações.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-navy/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Isso pode levar alguns segundos
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
          <Link href="/auth">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-10 sm:py-16">
          <div className="container-narrow text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight tracking-tight">
              Por que você não está sendo chamado para entrevistas?
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-navy/70 max-w-2xl mx-auto">
              Cole seu currículo e a descrição da vaga. Receba seu score de compatibilidade, risco ATS e ações concretas para melhorar.
            </p>
          </div>
        </section>

        {/* Input Form */}
        <section className="pb-16">
          <div className="container-narrow">
            <div className="grid gap-6">
              {/* Resume Input */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-navy uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal" />
                    Seu currículo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload de currículo"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-teal hover:text-teal/80 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload .txt
                  </button>
                </div>

                {fileName && (
                  <div className="mb-3 flex items-center gap-2 bg-teal/10 text-teal px-3 py-2 rounded-lg text-sm">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{fileName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="ml-auto p-1 hover:bg-teal/20 rounded"
                      aria-label="Remover arquivo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value)
                    if (fileName) setFileName(null)
                  }}
                  placeholder="Cole o texto do seu currículo aqui...&#10;&#10;Ex: Engenheiro de Software com 5 anos de experiência em desenvolvimento web..."
                  className="w-full h-48 sm:h-56 p-3 text-sm text-navy bg-sand/50 border border-stone/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal placeholder:text-navy/40"
                  aria-label="Texto do currículo"
                />
                <p className="mt-2 text-xs text-navy/50">
                  {resumeText.length > 0 ? `${resumeText.length.toLocaleString()} caracteres` : 'Mínimo 50 caracteres'}
                </p>
              </Card>

              {/* Job Description Input */}
              <Card className="p-4 sm:p-6">
                <label className="text-sm font-semibold text-navy uppercase tracking-wide flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-amber" />
                  Descrição da vaga
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Cole a descrição completa da vaga aqui...&#10;&#10;Ex: Estamos buscando um Engenheiro de Software Sênior para..."
                  className="w-full h-48 sm:h-56 p-3 text-sm text-navy bg-sand/50 border border-stone/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal placeholder:text-navy/40"
                  aria-label="Descrição da vaga"
                />
                <p className="mt-2 text-xs text-navy/50">
                  {jobDescription.length > 0 ? `${jobDescription.length.toLocaleString()} caracteres` : 'Mínimo 50 caracteres'}
                </p>
              </Card>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-red text-sm bg-red/10 p-3 rounded-lg" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* CTA */}
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!canSubmit}
                className="w-full"
              >
                Analisar compatibilidade
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-center text-sm text-navy/50">
                Sem cadastro. Resultado em segundos.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy text-center mb-12">
              O que você vai receber
            </h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Score de compatibilidade
                </h3>
                <p className="text-navy/70">
                  Uma nota de 0 a 100 mostrando o quanto seu currículo se encaixa nessa vaga específica.
                </p>
              </Card>

              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-red" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Risco ATS e gaps
                </h3>
                <p className="text-navy/70">
                  Descubra quais palavras-chave e competências estão faltando e podem estar te eliminando.
                </p>
              </Card>

              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Ações para melhorar
                </h3>
                <p className="text-navy/70">
                  Receba sugestões concretas e priorizadas para aumentar suas chances nessa vaga.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-navy text-sand">
          <div className="container-narrow text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
              Mais que uma análise avulsa
            </h2>
            <p className="text-sand/70 mb-8 max-w-xl mx-auto">
              O GoHire Copilot é o sistema que gerencia toda a sua busca de emprego: tracking de vagas, entrevista com IA, análises de carreira e próximos passos personalizados.
            </p>
            <Link href="/comecar">
              <Button size="lg" className="bg-amber hover:bg-amber/90 text-navy">
                Conhecer o Copilot
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone/30 py-8">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-navy" />
            </div>
            <span className="text-sm text-navy/70">GoHire Copilot</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-navy/60">
            <Link href="/pricing" className="hover:text-navy transition-colors">Preços</Link>
            <Link href="/privacidade" className="hover:text-navy transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-navy transition-colors">Termos</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
