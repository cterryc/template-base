'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReview, canUserReview } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'
import { Star } from 'lucide-react'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500)
    .optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface CreateReviewFormProps {
  productId: number
}

export function CreateReviewForm({ productId }: CreateReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [canReview, setCanReview] = useState<{
    canReview: boolean
    hasPurchased?: boolean
    reason?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: ''
    }
  })

  const rating = watch('rating')

  // Verificar si puede revisar al montar
  useEffect(() => {
    const checkPermission = async () => {
      const result = await canUserReview(productId)
      setCanReview(result)
      setLoading(false)
    }
    checkPermission()
  }, [productId])

  const onSubmit = async (data: ReviewFormData) => {
    startTransition(async () => {
      const result = await createReview({
        productId,
        rating: data.rating,
        comment: data.comment
      })

      if (result.success) {
        setSubmitted(true)
        reset()
      } else {
        alert(result.error)
      }
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center p-6'>
        <ImSpinner2 className='animate-spin w-6 h-6' />
      </div>
    )
  }

  // Si no puede revisar
  if (canReview && !canReview.canReview) {
    if (canReview.reason === 'auth_required') {
      return (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
          <FiAlertCircle className='w-12 h-12 text-yellow-600 mx-auto mb-3' />
          <h3 className='text-lg font-semibold text-yellow-800'>
            Inicia sesión
          </h3>
          <p className='text-yellow-600 mt-1'>
            Debes iniciar sesión para dejar una review.
          </p>
        </div>
      )
    }

    if (canReview.reason === 'already_reviewed') {
      return (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 text-center'>
          <FiCheckCircle className='w-12 h-12 text-blue-600 mx-auto mb-3' />
          <h3 className='text-lg font-semibold text-blue-800'>
            Ya dejaste tu opinión
          </h3>
          <p className='text-blue-600 mt-1'>
            Ya has enviado una review para este producto.
          </p>
        </div>
      )
    }
  }

  // Si puede revisar pero no compró
  if (canReview && canReview.canReview && !canReview.hasPurchased) {
    return (
      <div className='bg-orange-50 border border-orange-200 rounded-lg p-6 text-center'>
        <p className='text-orange-600 mt-1'>
          Solo puedes reseñar productos que hayas comprado.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
        <FiCheckCircle className='w-12 h-12 text-green-600 mx-auto mb-3' />
        <h3 className='text-lg font-semibold text-green-800'>
          ¡Gracias por tu opinión!
        </h3>
        <p className='text-green-600 mt-1'>
          Tu review está en revisión y se publicará pronto.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='border rounded-lg p-6 space-y-4'
    >
      <h3 className='text-lg font-semibold'>Deja tu opinión</h3>

      {/* Rating */}
      <div>
        <label className='block text-sm font-medium mb-2'>Calificación:</label>
        <div className='flex space-x-2'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type='button'
              onClick={() => setValue('rating', star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className='focus:outline-none'
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className='text-sm text-destructive mt-1'>
            {errors.rating.message}
          </p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Comentario (opcional):
        </label>
        <Textarea
          {...register('comment')}
          placeholder='Cuéntanos tu experiencia con este producto...'
          rows={4}
          className={errors.comment ? 'border-destructive' : ''}
        />
        <div className='flex justify-between mt-1'>
          {errors.comment ? (
            <p className='text-sm text-destructive'>{errors.comment.message}</p>
          ) : (
            <span />
          )}
          <span className='text-xs text-muted-foreground'>
            {watch('comment')?.length || 0}/500
          </span>
        </div>
      </div>

      {/* Submit */}
      <Button
        type='submit'
        disabled={isPending || rating === 0}
        className='w-full'
      >
        {isPending ? (
          <>
            <ImSpinner2 className='animate-spin mr-2' />
            Publicando...
          </>
        ) : (
          'Publicar opinión'
        )}
      </Button>
    </form>
  )
}
