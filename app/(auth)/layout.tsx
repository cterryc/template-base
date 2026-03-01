import { Metadata } from 'next'

// Metadata estática para páginas de auth
export const metadata: Metadata = {
  title: 'Autenticación | Savior',
  description: 'Inicia sesión o crea tu cuenta en Savior'
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
