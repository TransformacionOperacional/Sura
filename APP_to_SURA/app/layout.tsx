import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClientProviders } from '@/components/client-providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Cargue Documental',
  description: 'Portal de contingencia para validación de identidad y carga segura de documentos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}