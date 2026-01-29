import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoHire Copilot | Decisões de carreira com clareza',
  description: 'Responda algumas perguntas e receba um primeiro direcionamento baseado no seu contexto. Sem cadastro, sem enrolação.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
