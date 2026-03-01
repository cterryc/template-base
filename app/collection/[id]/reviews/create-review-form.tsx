'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReview } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FiCheckCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'
import { Star } from 'lucide-react'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(500).optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface CreateReviewFormProps {
  productId: number
}

export function CreateReviewForm({ productId }: CreateReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

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

  if (submitted) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
        <FiCheckCircle className='w-12 h-12 text-green-600 mx-auto mb-3' />
        <h3 className='text-lg font-semibold text-green-800'>¡Gracias por tu opinión!</h3>
        <p className='text-green-600 mt-1'>Tu review ha sido publicada.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='border rounded-lg p-6 space-y-4'>
      <h3 className='text-lg font-semibold'>Deja tu opinión</h3>

      {/* Rating */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Calificación:
        </label>
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
          <p className='text-sm text-destructive mt-1'>{errors.rating.message}</p>
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
