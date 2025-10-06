import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Ambala Road Management System',
  description: 'Road construction and maintenance tracking system',
  generator: 'Next.js',
  applicationName: 'ambala road management system',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'ambala road management system' }],
  colorScheme: 'light dark',
  creator: 'ambala road management system',
  publisher: 'ambala road management system',
  themeColor: '#ffffff',
  openGraph: {
    title: 'ambala road management system',
    description: 'ambala road management system',
    url: 'https://ambala-road-management-system.vercel.app',
    siteName: 'ambala road management system',
    images: [
      {
        url: 'https://ambala-road-management-system.vercel.app/og.png',
        width: 800,
        height: 600,
        alt: 'ambala road management system',
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ambala road management system',
    description: 'ambala road management system',
    images: [
      {
        url: 'https://ambala-road-management-system.vercel.app/og.png',
        width: 800,
        height: 600,
        alt: 'ambala road management system',
      },
    ],
    creator: '@ambala-road-management-system',
  },
}

export const viewport = {
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
