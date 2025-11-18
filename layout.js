import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Flowboard Bluen - Painel Inteligente de Gestão',
  description: 'Sistema Flowboard da Bluen: dashboard inteligente com visão em tempo real de tarefas, automações e desempenho.',
  keywords: 'bluen, flowboard, dashboard, automação, gestão, produtividade, tarefas',
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