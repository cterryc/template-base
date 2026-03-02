import {
  getProductReviews,
  canUserReview,
  createReview,
  type CreateReviewFormData
} from './actions'
import { StarsDisplay } from './stars-display'
import { VerifiedBadge } from './verified-badge'
import { CreateReviewForm } from './create-review-form'

interface ProductReviewsProps {
  productId: number
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, averageRating, totalReviews } =
    await getProductReviews(productId)
  const { canReview, reason } = await canUserReview(productId)

  return (
    <div className='bg-background'>
      {/* Resumen de Calificación */}
      <div className='flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-8 mb-16'>
        <div className='text-7xl font-light tracking-tighter text-foreground'>
          {averageRating.toFixed(1)}
        </div>
        <div className='flex flex-col items-center sm:items-start pb-2'>
          <StarsDisplay rating={averageRating} size='lg' showNumber={false} />
          <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 mt-3'>
            Basado en {totalReviews}{' '}
            {totalReviews === 1 ? 'opinión' : 'opiniones'}
          </p>
        </div>
      </div>

      {/* Lista de Reviews */}
      <div className='space-y-12'>
        {reviews.length === 0 ? (
          <div className='py-20 border-t border-border/50 text-center'>
            <p className='text-[10px] uppercase tracking-[0.2em] text-foreground/30 italic'>
              No hay opiniones disponibles para este artículo.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className='border-t border-border/50 pt-12 first:border-t-0 first:pt-0'
            >
              <div className='flex flex-col space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-8 h-8 bg-foreground text-background flex items-center justify-center text-[10px] font-bold'>
                      {review.user.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs font-bold uppercase tracking-widest text-foreground'>
                        {review.user.name || 'Cliente'}
                      </div>
                      <StarsDisplay
                        rating={review.rating}
                        size='sm'
                        showNumber={false}
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-6'>
                    <span className='text-[10px] text-foreground/30 uppercase tracking-widest font-medium'>
                      {new Date(review.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {review.verified && <VerifiedBadge />}
                  </div>
                </div>

                {review.comment && (
                  <div className='max-w-3xl'>
                    <p className='text-sm leading-relaxed text-foreground/80 italic'>
                      "{review.comment}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Acciones de Review (Condicionales) */}
      <div className='mt-16'>
        {canReview ? (
          <div className='max-w-2xl'>
            <CreateReviewForm productId={productId} />
          </div>
        ) : reason === 'already_reviewed' ? (
          <div className='inline-block border border-border px-6 py-4'>
            <p className='text-[10px] uppercase tracking-widest text-foreground/60'>
              Ya has compartido tu opinión sobre este producto.
            </p>
          </div>
        ) : reason === 'auth_required' ? (
          <div className='inline-block border border-border px-6 py-4'>
            <p className='text-[10px] uppercase tracking-widest text-foreground/60'>
              Inicia sesión para compartir tu experiencia.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
