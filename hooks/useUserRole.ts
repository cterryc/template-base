// hooks/useUserRole.ts
import { useAuthContext } from '@/contexts/AuthContext'

export function useUserRole() {
  const { isAdminOrEditor, userRole, userData, isLoading } = useAuthContext()

  return {
    isAdminOrEditor,
    userRole,
    isLoading,
    userData
  }
}
