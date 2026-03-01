// hooks/useUserRole.ts
import { useAuthContext } from '@/contexts/AuthContext'

export function useUserRole() {
  const { isAdminOrEditor, userData, isLoading } = useAuthContext()

  return {
    isAdminOrEditor,
    userRole: userData?.role,
    isLoading,
    userData
  }
}
