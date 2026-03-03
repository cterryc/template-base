'use client'

import { useState } from 'react'
import { Star, X, CheckCircle } from 'lucide-react'
import { CreateReviewForm } from '@/app/collection/[id]/reviews/create-review-form'

interface ProductReviewButtonProps {
  productId: number
  productName: string
  userReview?: {
    id: number
    rating: number
    comment: string | null
    aiApproved: boolean | null
    aiError: boolean
    createdAt: Date | string
  } | null
}

export function ProductReviewButton({ productId, productName, userReview }: ProductReviewButtonProps) {
  const [showModal, setShowModal] = useState(false)

  // Si ya tiene review y no está cargando, mostrar estado
  if (userReview) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className='text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 transition-colors'
          title='Ver tu opinión'
        >
          <CheckCircle className='w-4 h-4' />
          <span className='hidden sm:inline'>Opinión enviada</span>
        </button>

        {showModal && (
          <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            onClick={() => setShowModal(false)}
          >
            <div
              className='bg-card rounded-lg border border-border max-w-md w-full mx-4 overflow-hidden shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className='flex items-center justify-between p-4 border-b border-border'>
                <div>
                  <h3 className='font-bold text-foreground'>Tu opinión</h3>
                  <p className='text-xs text-muted-foreground truncate max-w-[200px]'>
                    {productName}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className='p-1.5 rounded-lg hover:bg-accent transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Review existente */}
              <div className='p-4 space-y-3'>
                {/* Estrellas */}
                <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= userReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Comentario */}
                {userReview.comment && (
                  <p className='text-sm text-foreground/80 italic'>
                    "{userReview.comment}"
                  </p>
                )}

                {/* Estado de moderación */}
                {userReview.aiError || userReview.aiApproved === false ? (
                  <div className='flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400'>
                    <span>⏳</span>
                    <span>Tu opinión está en revisión</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400'>
                    <CheckCircle className='w-3 h-3' />
                    <span>Opinión publicada</span>
                  </div>
                )}

                {/* Fecha */}
                <p className='text-xs text-muted-foreground'>
                  {new Date(userReview.createdAt).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Footer */}
              <div className='p-4 border-t border-border bg-accent/50'>
                <button
                  onClick={() => setShowModal(false)}
                  className='w-full text-sm text-muted-foreground hover:underline py-2'
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Sin review - mostrar botón normal
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className='text-sm text-foreground hover:underline flex items-center gap-1 transition-colors'
        title='Dejar una opinión sobre este producto'
      >
        <Star className='w-4 h-4' />
        <span className='hidden sm:inline'>Dejar opinión</span>
      </button>

      {showModal && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
          onClick={() => setShowModal(false)}
        >
          <div
            className='bg-card rounded-lg border border-border max-w-md w-full mx-4 overflow-hidden shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-border'>
              <div>
                <h3 className='font-bold text-foreground'>Tu opinión importa</h3>
                <p className='text-xs text-muted-foreground truncate max-w-[200px]'>
                  {productName}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='p-1.5 rounded-lg hover:bg-accent transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Form */}
            <div className='p-4'>
              <CreateReviewForm productId={productId} />
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-border bg-accent/50'>
              <button
                onClick={() => setShowModal(false)}
                className='w-full text-sm text-muted-foreground hover:underline py-2'
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
