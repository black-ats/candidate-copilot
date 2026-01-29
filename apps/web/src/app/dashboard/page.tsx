import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, LogOut, ArrowRight, Mic } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-navy mb-2">
            Bem-vindo ao seu Copilot
          </h1>
          <p className="text-navy/70">
            {user.email}
          </p>
        </div>

        <div className="grid gap-6">
          <Card variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-navy mb-2">
              Comece sua jornada
            </h2>
            <p className="text-navy/70 mb-4">
              Responda algumas perguntas para receber insights personalizados sobre sua carreira.
            </p>
            <Link href="/comecar">
              <Button>
                Novo insight
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-2">
              Seus insights
            </h2>
            <p className="text-navy/50 text-sm">
              Seus insights salvos aparecerao aqui. Comece gerando seu primeiro insight!
            </p>
          </Card>

          {/* Interview Pro Teaser */}
          <Card className="p-6 border-amber/30 bg-amber/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-amber" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2 bg-amber/20 text-amber">Em breve</Badge>
                <h3 className="text-lg font-semibold text-navy mb-1">
                  Interview Pro
                </h3>
                <p className="text-navy/70 text-sm mb-3">
                  Mock interviews com IA. Pratique e receba feedback instantaneo.
                </p>
                <Link href="/interview-pro" className="text-sm font-medium text-amber hover:text-amber/80 transition-colors">
                  Entrar na lista →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
