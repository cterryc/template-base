/**
 * Auth Helpers
 * Helpers de autenticación reutilizables para Server Components y Route Handlers
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { userRepository } from '@/lib/repositories/user.repository'

/**
 * Verificar si el usuario está autenticado
 * Usar en Server Components
 */
export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}

/**
 * Verificar si el usuario es admin
 * Usar en Server Components
 */
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (role !== 'admin') {
    throw new Error('Forbidden')
  }

  return userId
}

/**
 * Verificar si el usuario es admin o editor
 * Usar en Server Components
 */
export async function requireAdminOrEditor() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (role !== 'admin' && role !== 'editor') {
    throw new Error('Forbidden')
  }

  return userId
}

/**
 * Obtener usuario opcional (no requiere auth)
 * Usar en Server Components
 */
export async function getOptionalUser() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const user = await userRepository.findByClerkId(userId)
    return user
  } catch {
    return null
  }
}

/**
 * Verificar si el usuario es admin (para Route Handlers)
 * Devuelve Response 401/403 si no tiene permisos
 */
export async function isAdminUser(request: Request) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return {
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (role !== 'admin') {
    return {
      error: NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }
  }

  return { userId }
}

/**
 * Helper para envolver handlers que requieren auth
 */
export async function withAuth<T>(
  handler: (userId: string) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const userId = await requireAuth()
    return await handler(userId)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        )
      }
    }
    throw error
  }
}

/**
 * Helper para envolver handlers que requieren admin
 */
export async function withAdmin<T>(
  handler: (userId: string) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const userId = await requireAdmin()
    return await handler(userId)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        )
      }
    }
    throw error
  }
}
