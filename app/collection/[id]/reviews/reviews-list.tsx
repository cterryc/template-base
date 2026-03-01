import { getProductReviews, canUserReview, createReview, type CreateReviewFormData } from './actions'
import { StarsDisplay } from './stars-display'
import { VerifiedBadge } from './verified-badge'
import { CreateReviewForm } from './create-review-form'

interface ProductReviewsProps {
  productId: number
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, averageRating, totalReviews } = await getProductReviews(productId)
  const { canReview, reason } = await canUserReview(productId)

  return (
    <section className='border-t pt-8'>
      <h2 className='text-2xl font-bold mb-6'>Opiniones de clientes</h2>

      {/* Resumen */}
      <div className='bg-muted rounded-lg p-6 mb-8'>
        <div className='flex items-center space-x-4'>
          <div className='text-5xl font-bold'>{averageRating.toFixed(1)}</div>
          <div>
            <StarsDisplay rating={averageRating} size='lg' showNumber={false} />
            <p className='text-sm text-muted-foreground mt-1'>
              {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario (si puede revisar) */}
      {canReview ? (
        <div className='mb-8'>
          <CreateReviewForm productId={productId} />
        </div>
      ) : reason === 'already_reviewed' ? (
        <div className='mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-800'>Ya dejaste una opinión para este producto.</p>
        </div>
      ) : reason === 'auth_required' ? (
        <div className='mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <p className='text-sm text-yellow-800'>Inicia sesión para dejar tu opinión.</p>
        </div>
      ) : null}

      {/* Lista de reviews */}
      <div className='space-y-6'>
        {reviews.length === 0 ? (
          <p className='text-muted-foreground text-center py-8'>
            Aún no hay opiniones. ¡Sé el primero en opinar!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className='border-b pb-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold'>
                    {review.user.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <div className='font-semibold'>
                      {review.user.name || 'Cliente anónimo'}
                    </div>
                    <StarsDisplay rating={review.rating} size='sm' />
                  </div>
                </div>
                {review.verified && <VerifiedBadge />}
              </div>
              
              {review.comment && (
                <p className='text-muted-foreground mt-3'>{review.comment}</p>
              )}
              
              <div className='text-xs text-muted-foreground mt-2'>
                {new Date(review.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
