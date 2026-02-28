/**
 * lib/auth.ts
 * Helpers de autenticación reutilizables para Server Components y Route Handlers.
 * Usa siempre `await auth()` desde @clerk/nextjs/server (nunca mezclar con hooks de cliente).
 */
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SessionMetadata {
  role?: 'admin' | 'user'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Requiere que el usuario esté autenticado.
 * Si no lo está, redirige a /sign-in.
 * Retorna el userId para uso directo.
 *
 * @example
 * const userId = await requireAuth()
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return userId
}

/**
 * Requiere que el usuario esté autenticado Y tenga rol 'admin'.
 * Si no lo está, redirige a /sign-in.
 * Si no es admin, redirige a /.
 *
 * @example
 * const userId = await requireAdmin()
 */
export async function requireAdmin(): Promise<string> {
  const { userId, sessionClaims } = await auth()

  if (!userId) redirect('/sign-in')

  const role = (sessionClaims?.metadata as SessionMetadata)?.role
  if (role !== 'admin') redirect('/')

  return userId
}

/**
 * Obtiene el userId si el usuario está autenticado, o null si no lo está.
 * Útil para componentes que tienen comportamiento diferente según auth.
 *
 * @example
 * const userId = await getOptionalUser()
 * if (userId) { ... } // mostrar funciones autenticadas
 */
export async function getOptionalUser(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Verifica si el usuario actual tiene rol de admin.
 * No redirige — solo retorna boolean. Útil para condicionales en UI.
 *
 * @example
 * const isAdmin = await isAdminUser()
 * if (isAdmin) { ... }
 */
export async function isAdminUser(): Promise<boolean> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as SessionMetadata)?.role
  return role === 'admin'
}
