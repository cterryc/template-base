'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { moderateReview } from './ai-moderation'

// Schema de validación
const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500).optional()
})

export type CreateReviewFormData = z.infer<typeof createReviewSchema>

export type CreateReviewResult = 
  | { success: true; message: string; pending?: boolean }
  | { success: false; error: string }

/**
 * Obtener reviews de un producto (solo aprobadas por IA)
 */
export async function getProductReviews(productId: number) {
  const reviews = await prisma.review.findMany({
    where: { 
      productoId: productId,
      // Solo mostrar reviews:
      // - Sin moderar (aiModerated: false) O
      // - Aprobadas por IA (aiApproved: true)
      OR: [
        { aiModerated: false },
        { aiApproved: true }
      ]
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calcular promedio
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return {
    reviews,
    averageRating,
    totalReviews: reviews.length
  }
}

/**
 * Crear una nueva review con moderación de IA
 */
export async function createReview(data: CreateReviewFormData) {
  // 1. Verificar autenticación
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return {
      success: false,
      error: 'Debes iniciar sesión para dejar una review'
    }
  }

  // 2. Validar datos
  const validated = createReviewSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message
    }
  }

  // 3. Obtener usuario de la DB
  const dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!dbUser) {
    return {
      success: false,
      error: 'Usuario no encontrado en la base de datos'
    }
  }

  // 4. Verificar si el usuario compró el producto (verified badge)
  const hasPurchased = await prisma.orders.findFirst({
    where: {
      userId: dbUser.id,
      status: { in: ['Pagado', 'Enviado', 'Entregado'] },
      orderItems: {
        some: {
          productoId: data.productId
        }
      }
    }
  })

  // 5. Moderar con IA (si hay comentario)
  let aiResult: { approved: boolean; reason?: string; error?: boolean } = {
    approved: true,
    reason: undefined,
    error: false
  }

  if (validated.data.comment) {
    aiResult = await moderateReview(validated.data.comment)
  }

  // Determinar si la review fue aprobada por IA
  const isAiApproved = aiResult.approved && !aiResult.error

  // 6. Crear review
  try {
    await prisma.review.create({
      data: {
        rating: validated.data.rating,
        comment: validated.data.comment,
        userId: dbUser.id,
        productoId: data.productId,
        verified: !!hasPurchased,
        aiModerated: true,
        aiApproved: isAiApproved ? true : null, // null = pendiente/rechazada/error
        aiReason: aiResult.reason,
        aiModel: 'gemini-1.5-flash',
        aiError: aiResult.error || false
      }
    })

    // 7. Invalidar caché
    revalidatePath(`/collection/${data.productId}`)
    revalidatePath(`/collection/${data.productId}/reviews`)

    // 8. Retornar mensaje apropiado
    if (aiResult.error || !isAiApproved) {
      return {
        success: true,
        message: 'Tu opinión está en revisión y se publicará pronto.',
        pending: true
      }
    }

    return {
      success: true,
      message: '¡Gracias por tu review!'
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return {
      success: false,
      error: 'Error al crear la review. Inténtalo de nuevo.'
    }
  }
}

/**
 * Verificar si el usuario puede revisar un producto
 */
export async function canUserReview(productId: number) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return { canReview: false, reason: 'auth_required' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!dbUser) {
    return { canReview: false, reason: 'user_not_found' }
  }

  // Verificar si ya dejó review
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: dbUser.id,
      productoId: productId
    }
  })

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  // Verificar si compró el producto
  const hasPurchased = await prisma.orders.findFirst({
    where: {
      userId: dbUser.id,
      status: { in: ['Pagado', 'Enviado', 'Entregado'] },
      orderItems: {
        some: {
          productoId: productId
        }
      }
    }
  })

  return {
    canReview: true,
    hasPurchased: !!hasPurchased
  }
}
