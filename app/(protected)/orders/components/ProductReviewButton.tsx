'use client'

import { useState, useTransition } from 'react'
import { Star, X, CheckCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { CreateReviewForm } from '@/app/collection/[id]/reviews/create-review-form'
import { deleteReview } from '@/app/collection/[id]/reviews/actions'

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
  onReviewCreated?: () => void
}

export function ProductReviewButton({
  productId,
  productName,
  userReview,
  onReviewCreated
}: ProductReviewButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (!userReview) return

    startTransition(async () => {
      const result = await deleteReview(userReview.id)
      if (result.success) {
        onReviewCreated?.()
        setShowModal(false)
        setIsDeleting(false)
      } else {
        alert(result.error)
      }
    })
  }

  // Si ya tiene review y no está cargando, mostrar estado
  if (userReview) {
    return (
      <>
        <button
          onClick={() => {
            setIsEditing(false)
            setIsDeleting(false)
            setShowModal(true)
          }}
          className='text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 transition-colors'
          title='Ver tu opinión'
        >
          <CheckCircle className='w-4 h-4' />
          <span className='hidden sm:inline'>Opinión enviada</span>
        </button>

        {showModal && (
          <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            onClick={() => {
              if (!isPending) setShowModal(false)
            }}
          >
            <div
              className='bg-card rounded-lg border border-border max-w-md w-full mx-4 overflow-hidden shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className='flex items-center justify-between p-4 border-b border-border'>
                <div>
                  <h3 className='font-bold text-foreground'>
                    {isDeleting
                      ? '¿Eliminar opinión?'
                      : isEditing
                      ? 'Editar tu opinión'
                      : 'Tu opinión'}
                  </h3>
                  <p className='text-xs text-muted-foreground truncate max-w-[200px]'>
                    {productName}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isPending}
                  className='p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Contenido: Review existente o Formulario de edición */}
              <div className='p-4'>
                {isDeleting ? (
                  <div className='space-y-4 py-2'>
                    <div className='flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
                      <AlertTriangle className='w-5 h-5 text-destructive shrink-0 mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-destructive'>
                          Esta acción no se puede deshacer
                        </p>
                        <p className='text-xs text-destructive/80 mt-1'>
                          Tu opinión y calificación serán eliminadas
                          permanentemente.
                        </p>
                      </div>
                    </div>

                    <div className='flex gap-3'>
                      <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className='flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2'
                      >
                        {isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <Trash2 className='w-4 h-4' />
                        )}
                        Confirmar
                      </button>
                      <button
                        onClick={() => setIsDeleting(false)}
                        disabled={isPending}
                        className='flex-1 bg-accent text-accent-foreground hover:bg-accent/80 px-4 py-2 rounded-md text-sm font-medium transition-colors'
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <CreateReviewForm
                    productId={productId}
                    initialData={{
                      id: userReview.id,
                      rating: userReview.rating,
                      comment: userReview.comment
                    }}
                    onReviewCreated={() => {
                      onReviewCreated?.()
                      setIsEditing(false)
                      // No cerramos el modal para que vea el mensaje de éxito
                    }}
                  />
                ) : (
                  <div className='space-y-3'>
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
                    {userReview.aiError || !userReview.aiApproved ? (
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
                      {new Date(userReview.createdAt).toLocaleDateString(
                        'es-PE',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }
                      )}
                    </p>

                    {/* Botones de acción */}
                    <div className='flex items-center gap-4 mt-2'>
                      <button
                        onClick={() => setIsEditing(true)}
                        className='text-xs text-blue-600 hover:underline flex items-center gap-1'
                      >
                        Editar opinión
                      </button>
                      <button
                        onClick={() => setIsDeleting(true)}
                        className='text-xs text-destructive hover:underline flex items-center gap-1'
                      >
                        <Trash2 className='w-3 h-3' />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className='p-4 border-t border-border bg-accent/50'>
                <button
                  onClick={() => {
                    if (isEditing || isDeleting) {
                      setIsEditing(false)
                      setIsDeleting(false)
                    } else {
                      setShowModal(false)
                    }
                  }}
                  disabled={isPending}
                  className='w-full text-sm text-muted-foreground hover:underline py-2 disabled:opacity-50'
                >
                  {isEditing || isDeleting ? 'Volver' : 'Cerrar'}
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
                <h3 className='font-bold text-foreground'>
                  Tu opinión importa
                </h3>
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
              <CreateReviewForm
                productId={productId}
                onReviewCreated={() => {
                  onReviewCreated?.()
                  setShowModal(false)
                }}
              />
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
