import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Patrimônio Cassol — Gestão de TI',
  description: 'Sistema de Gestão Patrimonial de Equipamentos de TI — Grupo Cassol',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
