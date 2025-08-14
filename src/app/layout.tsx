import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Spiler - Professional Campaign Auto-Dialer',
  description: 'State-of-the-art fundraising that uses YOUR phone',
  manifest: '/manifest.json',
  themeColor: '#1a1a2e',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-spiler-darker text-white`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '',
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #6366f1',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}