import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AtomQuest | Goal Setting & Tracking',
  description: 'In-House Goal Setting & Tracking Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}