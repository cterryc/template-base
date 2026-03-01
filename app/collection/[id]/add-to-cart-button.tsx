'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { FiCheckCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'

interface Product {
  id: number
  name: string
  price: number | { toNumber: () => number }
  image: string
  size?: string | null
  stock: number
}

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleAddToCart = async () => {
    setButtonState('loading')
    
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'number' ? product.price : product.price.toNumber(),
        quantity,
        image: product.image,
        size: selectedSize || undefined
      })
      setButtonState('success')
      
      setTimeout(() => {
        setButtonState('idle')
      }, 2000)
    }, 500)
  }

  const isOutOfStock = product.stock === 0
  const hasSizes = !!(product.size && String(product.size).trim() !== '')
  const sizes = hasSizes && product.size ? String(product.size).split('-').map(s => s.trim()) : []

  return (
    <div className='space-y-4'>
      {/* Selector de tallas */}
      {hasSizes && (
        <div>
          <label className='block text-sm font-medium mb-2'>
            Selecciona tu talla:
          </label>
          <div className='flex flex-wrap gap-2'>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {!selectedSize && (
            <p className='text-sm text-destructive mt-1'>
              Por favor selecciona una talla
            </p>
          )}
        </div>
      )}

      {/* Selector de cantidad */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Cantidad:
        </label>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className='w-10 h-10 border rounded-md flex items-center justify-center hover:bg-muted'
          >
            -
          </button>
          <span className='w-12 text-center'>{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className='w-10 h-10 border rounded-md flex items-center justify-center hover:bg-muted'
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Botón de añadir */}
      <Button
        onClick={handleAddToCart}
        disabled={
          isOutOfStock ||
          buttonState === 'loading' ||
          buttonState === 'success' ||
          (hasSizes && !selectedSize)
        }
        className='w-full h-12 text-lg'
      >
        {buttonState === 'loading' && (
          <ImSpinner2 className='animate-spin mr-2' />
        )}
        {buttonState === 'success' && (
          <FiCheckCircle className='mr-2 text-green-600' />
        )}
        {buttonState === 'idle' && isOutOfStock ? (
          'Agotado'
        ) : buttonState === 'idle' ? (
          <>
            Añadir al carrito <MdOutlineShoppingCart className='ml-2' />
          </>
        ) : buttonState === 'success' ? (
          '¡Añadido!'
        ) : (
          'Añadiendo...'
        )}
      </Button>
    </div>
  )
}
