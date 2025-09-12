import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agendamento de Barbearia - Sistema Inteligente',
  description: 'Sistema completo de agendamento para barbearias com horários em tempo real',
  keywords: 'barbearia, agendamento, horário, corte, barba',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="public/manifest.json" />
        <meta name="theme-color" content="#5e819e" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}