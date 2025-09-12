'use client'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

const Layout = ({ children, title, showBackButton = true }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              )}
              {title && (
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Início
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout