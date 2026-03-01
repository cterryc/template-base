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
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success'
  >('idle')

  const handleAddToCart = async () => {
    setButtonState('loading')

    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price:
          typeof product.price === 'number'
            ? product.price
            : product.price.toNumber(),
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
  const sizes =
    hasSizes && product.size
      ? String(product.size)
          .split('-')
          .map((s) => s.trim())
      : []

  return (
    <div className='space-y-10'>
      {/* Selector de tallas */}
      {hasSizes && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <label className='text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/80'>
              Selecciona tu talla
            </label>
            {selectedSize && (
              <button
                onClick={() => setSelectedSize('')}
                className='text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors underline underline-offset-4'
              >
                Limpiar
              </button>
            )}
          </div>
          <div className='flex flex-wrap gap-3'>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[50px] h-[50px] border flex items-center justify-center text-xs tracking-widest transition-all duration-300 ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {!selectedSize && buttonState === 'idle' && (
            <p className='text-[10px] uppercase tracking-tighter text-foreground/40 italic'>
              * Selección requerida para proceder
            </p>
          )}
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-4 sm:items-end'>
        {/* Selector de cantidad */}
        <div className='space-y-4 flex-shrink-0'>
          <label className='text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/80 block'>
            Cantidad
          </label>
          <div className='flex items-center border border-border h-[56px] w-full sm:w-[140px]'>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className='flex-1 h-full flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-20'
              disabled={quantity <= 1}
            >
              <span className='text-lg font-light'>−</span>
            </button>
            <span className='w-12 text-center text-sm font-medium'>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className='flex-1 h-full flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-20'
              disabled={quantity >= product.stock}
            >
              <span className='text-lg font-light'>+</span>
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
          className={`flex-grow h-[56px] rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all duration-500 shadow-none border ${
            buttonState === 'success'
              ? 'bg-background text-foreground border-foreground hover:bg-background'
              : 'bg-primary text-primary-foreground border-primary hover:opacity-90'
          }`}
        >
          {buttonState === 'loading' && (
            <ImSpinner2 className='animate-spin mr-3 text-lg' />
          )}
          {buttonState === 'success' && (
            <FiCheckCircle className='mr-3 text-lg' />
          )}

          {isOutOfStock ? (
            'Agotado'
          ) : buttonState === 'idle' ? (
            <>Añadir al carrito</>
          ) : buttonState === 'success' ? (
            '¡Completado!'
          ) : (
            'Procesando...'
          )}
        </Button>
      </div>
    </div>
  )
}
