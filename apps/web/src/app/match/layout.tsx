import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match CV × Vaga | GoHire Copilot',
  description:
    'Descubra por que você não está sendo chamado para entrevistas. Cole seu currículo e a descrição da vaga para receber score de compatibilidade, risco ATS e ações concretas.',
  openGraph: {
    title: 'Match CV × Vaga | GoHire Copilot',
    description:
      'Score de compatibilidade instantâneo entre seu currículo e a vaga. Identifique gaps e melhore suas chances.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children
}
