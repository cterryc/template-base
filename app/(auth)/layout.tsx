import { Metadata } from 'next'
import { ecommerceName } from '@/lib/constants'

// Metadata estática para páginas de auth
export const metadata: Metadata = {
  title: `Autenticación | ${ecommerceName}`,
  description: `Inicia sesión o crea tu cuenta en ${ecommerceName}`
}

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='w-full h-full min-h-screen flex items-center justify-center'>
      {children}
    </div>
  )
}
