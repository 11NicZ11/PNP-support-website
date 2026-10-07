// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { DiceLogProvider } from '@/contexts/DiceLogContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastNotifications } from '@/components/ui/ToastNotifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pen & Paper Character Manager',
  description: 'Erstelle und verwalte deine Pen & Paper Charaktere - Besser als D&D Beyond',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ToastProvider>
          <DiceLogProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <ToastNotifications />
          </DiceLogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}