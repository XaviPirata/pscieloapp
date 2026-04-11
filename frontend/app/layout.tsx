import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'PsCielo - Sistema de Gestión',
  description: 'Plataforma integral para la gestión de centros psicológicos',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#FFD6E0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        {/* Prevent flash: only apply dark if the user explicitly chose it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('pscielo-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
