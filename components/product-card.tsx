'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, CheckCircle, Loader2, Eye } from 'lucide-react'
import { optimizeCloudinaryUrl } from '@/lib/utils/image-optimizer'

interface Product {
  id: number
  name: string
  price: number
  image: string
  image2?: string
  size?: string
  estado?: string
  stock: number
}

export default function ProductCard({
  product,
  from,
  isLoading = false
}: {
  product: Product
  from?: string
  isLoading?: boolean
}) {
  const { addToCart } = useCart()
  const [image, setImage] = useState<string>(product.image)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success'
  >('idle')
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = async () => {
    if (product.estado === 'NO DISPONIBLE' || product.stock === 0) return

    setButtonState('loading')
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        size: selectedSize
      })
      setButtonState('success')
      setTimeout(() => {
        setButtonState('idle')
      }, 500)
    }, 500)
  }

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className='group flex flex-col w-full h-full animate-pulse'>
        <div className='relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 aspect-[4/5] mb-4 skeletonShimmer' />
        <div className='flex flex-col flex-grow space-y-3'>
          <div className='h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-3/4 skeletonShimmer' />
          <div className='h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/3 skeletonShimmer' />
          <div className='h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full skeletonShimmer' />
        </div>
      </div>
    )
  }

  // Variante para Best Sellers
  if (from === 'bestSellers') {
    return (
      <div
        className='group flex flex-col items-center text-center cursor-pointer w-full'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/collection?category=${product.name}`} className='w-full'>
          <div className='relative w-full aspect-[3/4] mb-6 overflow-hidden rounded-2xl bg-muted shadow-lg group-hover:shadow-xl transition-all duration-300'>
            <Image
              src={optimizeCloudinaryUrl(image, 600, 85) || '/placeholder.svg'}
              alt={product.name}
              fill
              className='object-cover transition-transform duration-700 group-hover:scale-110'
              onMouseEnter={() =>
                setImage(product.image2 ? product.image2 : product.image)
              }
              onMouseLeave={() => setImage(product.image)}
            />
            {/* Overlay con ícono de vista */}
            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
              <Eye className='w-8 h-8 text-white' />
            </div>
          </div>
          <h3 className='font-medium text-lg mb-1 group-hover:text-primary transition-colors text-white dark:text-black'>
            Ver {product.name}
          </h3>
        </Link>
      </div>
    )
  }

  // Variante principal para Featured Products
  const isDisabled = product.estado === 'NO DISPONIBLE' || product.stock === 0
  const needsSize = product.size && !selectedSize && product.size !== ''

  return (
    <div
      className='group flex flex-col w-full h-full'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de imagen con efectos mejorados */}
      <Link href={`/collection/${product.id}`} className='block w-full'>
        <div className='relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 aspect-[4/5] shadow-md group-hover:shadow-xl transition-all duration-300'>
          <Image
            src={optimizeCloudinaryUrl(image, 600, 85) || '/placeholder.svg'}
            alt={product.name}
            fill
            className='object-cover transition-all duration-700 group-hover:scale-110'
            onMouseEnter={() =>
              setImage(product.image2 ? product.image2 : product.image)
            }
            onMouseLeave={() => setImage(product.image)}
          />

          {/* Badge de disponibilidad */}
          {isDisabled && (
            <div className='absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10'>
              Agotado
            </div>
          )}

          {/* Badge de "Nuevo" simulado */}
          {!isDisabled && product.id % 3 === 0 && (
            <div className='absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10'>
              Nuevo
            </div>
          )}

          {/* Overlay con acción rápida */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4`}
          >
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAddToCart()
              }}
              disabled={isDisabled || needsSize || buttonState !== 'idle'}
              className={`bg-white hover:text-green-100 dark:hover:text-green-800 text-neutral-900 hover:bg-primary rounded-full px-6 py-2 text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300`}
            >
              {buttonState === 'loading' && (
                <Loader2 className='w-4 h-4 animate-spin' />
              )}
              {buttonState === 'success' && (
                <CheckCircle className='w-4 h-4 text-green-500' />
              )}
              {buttonState === 'idle' && (
                <>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Añadir al Carrito
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>

      {/* Información del producto */}
      <div className='flex flex-col flex-grow mt-4 space-y-2'>
        <Link href={`/collection/${product.id}`}>
          <h3 className='font-medium text-base dark:text-white dark:hover:text-slate-300 md:text-lg hover:text-primary transition-colors line-clamp-2'>
            {product.name}
          </h3>
        </Link>

        <p className='text-xl font-bold text-primary'>
          S/ {Number(product.price).toFixed(2)}
        </p>

        {/* Selector de tallas */}
        {product.size && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {product.size.split(' - ').map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedSize(size)
                }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Botón principal de compra (visible en móvil o como respaldo) */}
        <Button
          className='w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium transition-all active:scale-95 md:hidden'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCart()
          }}
          disabled={
            isDisabled ||
            (product.size ? !selectedSize : false) ||
            buttonState !== 'idle'
          }
        >
          {buttonState === 'loading' && (
            <Loader2 className='w-4 h-4 animate-spin mr-2' />
          )}
          {buttonState === 'success' && (
            <CheckCircle className='w-4 h-4 mr-2' />
          )}
          {buttonState === 'idle' && (
            <>
              <ShoppingCart className='w-4 h-4 mr-2' />
              {isDisabled ? 'Agotado' : 'Añadir al carrito'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
