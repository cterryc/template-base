import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CartProvider } from '@/contexts/CartContext'
import { Suspense } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { esMX } from '@clerk/localizations'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { shadcn } from '@clerk/themes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Savior | Calidad y Estilo',
  description:
    'Descubre nuestra colección de ropa con diseños únicos. Polos, gorros y más.',
  keywords: 'ropa, polos, gorros, moda, casacas, pantalones',
  openGraph: {
    title: 'Savior | Ropa de tendencia',
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Savior',
    url: 'https://savior.vercel.app',
    images: [
      {
        url: 'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg',
        width: 1200,
        height: 630,
        alt: 'Savior Logo',
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Savior | Ropa de tendencia',
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    images: [
      'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
    ]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: 'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
  }
}

const customEs = {
  ...esMX,
  signIn: {
    ...esMX.signIn,
    start: {
      ...esMX.signIn?.start,
      subtitle: 'para continuar con Savior'
    }
  },
  signUp: {
    ...esMX.signUp,
    start: { ...esMX.signUp?.start, subtitle: 'para continuar con Savior' }
  },
  formFieldHintText__optional: ''
}

// Apariencia personalizada con tema shadcn y colores de Savior
// Usa variables CSS para soportar modo claro/oscuro
const clerkAppearance = {
  ...shadcn,
  variables: {
    ...shadcn.variables,
    // Color primario basado en --primary del proyecto (negro)
    colorPrimary: 'hsl(0 0% 9%)',
    // Fondo basado en --background (cambia con tema oscuro)
    colorBackground: 'var(--background)',
    // Texto basado en --foreground (cambia con tema oscuro)
    colorText: 'var(--foreground)',
    // Color de texto en inputs
    colorInputText: 'var(--foreground)',
    // Color de fondo de inputs
    colorInputBackground: 'var(--background)',
    // Color de borde
    colorBorder: 'var(--border)',
    // Color de fondo de botones sociales (cambia con tema)
    colorNeutral: 'var(--muted)',
    // Color de texto en botones sociales
    colorNeutralText: 'var(--muted-foreground)',
    // Border radius basado en --radius (0.5rem)
    borderRadius: '0.5rem',
    // Fuente del proyecto
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    // Logo más pequeño (50% del tamaño original)
    logoFilter: 'scale(0.2)'
  },
  elements: {
    ...shadcn.elements,
    logoBox: {
      transform: 'scale(0.2)',
      transformOrigin: 'center'
    },
    // Botones sociales con fondo y texto correcto
    socialButtonsBlockButton: {
      backgroundColor: 'var(--muted)',
      color: 'var(--muted-foreground)',
      border: '1px solid var(--border)'
    },
    socialButtonsBlockButtonText: {
      color: 'var(--muted-foreground)'
    },
    socialButtonsIconButton: {
      backgroundColor: 'var(--muted)',
      border: '1px solid var(--border)',
      color: 'var(--muted-foreground)'
    },
    // Iconos dentro de botones sociales
    socialButtonsIconButtonSvg: {
      color: 'var(--muted-foreground)'
    }
  },
  layout: {
    ...shadcn.layout,
    // Logo de Savior
    logoImageUrl:
      'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg',
    // Botones sociales como iconos (más limpio)
    socialButtonsVariant: 'iconButton' as const,
    // Posición de botones sociales
    socialButtonsPlacement: 'bottom' as const
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const SIGN_OUT_URL = '/cleanup-session'
  return (
    <Suspense>
      <ClerkProvider
        localization={customEs}
        afterSignOutUrl={SIGN_OUT_URL}
        appearance={clerkAppearance}
      >
        <html lang='es' suppressHydrationWarning>
          <body className={`${inter.className} body`}>
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
    </Suspense>
  )
}
