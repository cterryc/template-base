'use client'

import { createContext, useContext } from 'react'
import { useUser } from '@clerk/nextjs'

interface AuthContextType {
  userData: any | null
  isAdminOrEditor: boolean
  userRole: 'ADMIN' | 'EDITOR' | 'USER' | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()

  // Obtener el rol del metadata público de Clerk
  // Nota: Asegúrate de configurar el webhook de Clerk para sync con la DB
  const userRole = (user?.publicMetadata?.role as 'ADMIN' | 'EDITOR' | 'USER' | null) || 'USER'
  const isAdminOrEditor = userRole === 'ADMIN' || userRole === 'EDITOR'

  const value: AuthContextType = {
    userData: user,
    isAdminOrEditor,
    userRole,
    isLoading: !isLoaded
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
