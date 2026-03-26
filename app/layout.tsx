import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CartProvider } from '@/contexts/CartContext'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { esMX } from '@clerk/localizations'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { ecommerceLogo, ecommerceName } from '@/lib/constants'

import { Noto_Serif, Manrope } from 'next/font/google'

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['400', '700'],
  style: ['normal', 'italic']
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: `${ecommerceName} | Calidad y Estilo`,
  description:
    'Descubre nuestra colección de ropa con diseños únicos. Polos, gorros y más.',
  keywords: 'ropa, polos, gorros, moda, casacas, pantalones',
  openGraph: {
    title: `${ecommerceName} | Ropa de tendencia`,
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    type: 'website',
    locale: 'es_PE',
    siteName: `${ecommerceName}`,
    url: `https://${ecommerceName.toLowerCase().replace(/ /g, '')}.vercel.app`,
    images: [
      {
        url: ecommerceLogo,
        width: 1200,
        height: 630,
        alt: `${ecommerceName} Logo`,
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${ecommerceName} | Ropa de tendencia`,
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    images: [ecommerceLogo]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: ecommerceLogo
  }
}

const customEs = {
  ...esMX,
  signIn: {
    ...esMX.signIn,
    start: {
      ...esMX.signIn?.start
      // subtitle: 'para continuar con ' + ecommerceName
    }
  },
  signUp: {
    ...esMX.signUp
    // start: { ...esMX.signUp?.start, subtitle: 'para continuar con ' + ecommerceName }
  },
  formFieldHintText__optional: ''
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const SIGN_OUT_URL = '/cleanup-session'
  return (
    <ClerkProvider localization={customEs} afterSignOutUrl={SIGN_OUT_URL}>
      <html lang='es' suppressHydrationWarning>
        <head>
          <link
            href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
            rel='stylesheet'
          />
        </head>
        <body
          className={`${notoSerif.variable} ${manrope.variable} font-body bg-background text-on-background antialiased`}
        >
          <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
            <CartProvider>
              <AuthProvider>
                <ConfigProvider>
                  <Header />
                  <main className='pt-[72px]'>{children}</main>
                  <Footer />
                </ConfigProvider>
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
