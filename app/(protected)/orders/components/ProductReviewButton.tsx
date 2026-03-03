'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { CreateReviewForm } from '@/app/collection/[id]/reviews/create-review-form'

interface ProductReviewButtonProps {
  productId: number
  productName: string
}

export function ProductReviewButton({
  productId,
  productName
}: ProductReviewButtonProps) {
  const [showModal, setShowModal] = useState(false)

  console.log('productId', { productId })

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
