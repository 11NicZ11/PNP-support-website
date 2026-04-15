import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { DiceLogProvider } from '@/contexts/DiceLogContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pen & Paper Character Manager',
  description: 'Erstelle und verwalte deine Pen & Paper Charaktere - Besser als D&D Beyond',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <DiceLogProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </DiceLogProvider>
      </body>
    </html>
  )
}