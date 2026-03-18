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
      OR: [{ aiModerated: false }, { aiApproved: true }]
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
  const averageRating =
    reviews.length > 0
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
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productoId: data.productId,
      order: {
        userId: dbUser.id,
        status: { in: ['Pagado', 'Enviado', 'Entregado'] }
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
        aiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview',
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
 * Actualizar una review existente con moderación de IA
 */
export async function updateReview(
  reviewId: number,
  data: { rating: number; comment?: string }
) {
  // 1. Verificar autenticación
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return {
      success: false,
      error: 'Debes iniciar sesión para editar tu review'
    }
  }

  // 2. Validar datos
  const validated = createReviewSchema.partial().safeParse(data)
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

  // 4. Verificar propiedad de la review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId }
  })

  if (!existingReview || existingReview.userId !== dbUser.id) {
    return {
      success: false,
      error: 'No tienes permiso para editar esta review'
    }
  }

  // 5. Moderar con IA (solo si el comentario cambió)
  let aiResult: { approved: boolean; reason?: string; error?: boolean } = {
    approved: existingReview.aiApproved ?? true,
    reason: existingReview.aiReason || undefined,
    error: existingReview.aiError || false
  }

  const commentChanged = data.comment !== existingReview.comment

  if (commentChanged && data.comment) {
    aiResult = await moderateReview(data.comment)
  }

  // Determinar si la review fue aprobada por IA
  const isAiApproved = aiResult.approved && !aiResult.error

  // 6. Actualizar review
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
        aiModerated: commentChanged ? true : existingReview.aiModerated,
        aiApproved: commentChanged
          ? isAiApproved
            ? true
            : null
          : existingReview.aiApproved,
        aiReason: commentChanged ? aiResult.reason : existingReview.aiReason,
        aiError: commentChanged
          ? aiResult.error || false
          : existingReview.aiError
      }
    })

    // 7. Invalidar caché
    revalidatePath(`/collection/${existingReview.productoId}`)
    revalidatePath(`/collection/${existingReview.productoId}/reviews`)

    return {
      success: true,
      message: 'Review actualizada correctamente',
      pending: commentChanged && (!isAiApproved || aiResult.error)
    }
  } catch (error) {
    console.error('Error updating review:', error)
    return {
      success: false,
      error: 'Error al actualizar la review. Inténtalo de nuevo.'
    }
  }
}

/**
 * Eliminar una review existente
 */
export async function deleteReview(reviewId: number) {
  // 1. Verificar autenticación
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return {
      success: false,
      error: 'Debes iniciar sesión para eliminar tu review'
    }
  }

  // 2. Obtener usuario de la DB
  const dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!dbUser) {
    return {
      success: false,
      error: 'Usuario no encontrado en la base de datos'
    }
  }

  // 3. Verificar propiedad de la review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId }
  })

  if (!existingReview || existingReview.userId !== dbUser.id) {
    return {
      success: false,
      error: 'No tienes permiso para eliminar esta review'
    }
  }

  // 4. Eliminar review
  try {
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // 5. Invalidar caché
    revalidatePath(`/collection/${existingReview.productoId}`)
    revalidatePath(`/collection/${existingReview.productoId}/reviews`)

    return {
      success: true,
      message: 'Review eliminada correctamente'
    }
  } catch (error) {
    console.error('Error deleting review:', error)
    return {
      success: false,
      error: 'Error al eliminar la review. Inténtalo de nuevo.'
    }
  }
}

/**
 * Obtener review del usuario para un producto
 */
export async function getUserReview(productId: number) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const dbUser = await prisma.user.findUnique({ where: { clerkId } })
  if (!dbUser) return null

  const review = await prisma.review.findFirst({
    where: {
      userId: dbUser.id,
      productoId: productId
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      aiApproved: true,
      aiError: true
    }
  })

  return review
}

/**
 * Obtener todas las reviews del usuario para los productos de un pedido
 */
export async function getUserReviewsForOrder(orderId: number) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return {}

  const dbUser = await prisma.user.findUnique({ where: { clerkId } })
  if (!dbUser) return {}

  // Obtener IDs de productos del pedido
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { productoId: true }
  })

  const productIds = orderItems.map((item) => item.productoId)

  // Obtener reviews para esos productos
  const reviews = await prisma.review.findMany({
    where: {
      userId: dbUser.id,
      productoId: { in: productIds }
    },
    select: {
      productoId: true,
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      aiApproved: true,
      aiError: true
    }
  })

  // Convertir a mapa para acceso rápido
  const reviewsMap: Record<number, (typeof reviews)[0]> = {}
  reviews.forEach((review) => {
    reviewsMap[review.productoId] = review
  })

  return reviewsMap
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

  console.log({ existingReview })

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  // Verificar si compró el producto
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productoId: productId,
      order: {
        userId: dbUser.id,
        status: { in: ['Pagado', 'Enviado', 'Entregado'] }
      }
    }
  })

  console.log({
    hasPurchased,
    existingReview
  })

  return {
    canReview: true,
    hasPurchased: !!hasPurchased
  }
}
