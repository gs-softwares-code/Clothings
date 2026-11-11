import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/session-provider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LUXE THREADS — Premium Indian Fashion',
    template: '%s | LUXE THREADS',
  },
  description:
    'Discover curated premium clothing for men, women, and kids. Authentic Indian fashion with global style.',
  keywords: ['clothing', 'fashion', 'India', 'premium', 'ethnic wear', 'western wear'],
  authors: [{ name: 'Luxe Threads' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'LUXE THREADS',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#36454F',
                color: '#fff',
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                borderRadius: '0',
              },
              success: {
                iconTheme: {
                  primary: '#C9A84C',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
