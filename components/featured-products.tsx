'use client'

import { useState, useEffect } from 'react'
import ProductCard from './product-card'
import { Sparkles, ArrowRight } from 'lucide-react'

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

// Array para skeletons
const skeletonItems = [1, 2, 3, 4]

export default function FeaturedProducts() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/productos-destacados')

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.data.destacados) {
          setData(result.data.destacados)
        } else {
          setData([])
        }

        setError(null)
      } catch (error) {
        console.error('❌ [CLIENT] Error cargando productos destacados:', error)
        setError('No se pudieron cargar los productos destacados')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Mostrar estado de carga CON SKELETONS
  if (loading) {
    return (
      <section className='py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900'>
        <div className='max-w-screen-2xl mx-auto'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6'>
              <Sparkles className='w-4 h-4' />
              <span>Colección Exclusiva</span>
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent'>
              Productos Destacados
            </h2>
            <p className='text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl mx-auto'>
              Descubre nuestra selección de productos más populares
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
            {skeletonItems.map((item) => (
              <ProductCard
                key={`skeleton-${item}`}
                product={{
                  id: item,
                  image: '/CargandoImagen.png',
                  name: 'Cargando...',
                  price: 0,
                  stock: 0
                }}
                from='featured'
                isLoading={true}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <section className='py-24 px-4 md:px-8 lg:px-12'>
        <div className='max-w-screen-2xl mx-auto text-center'>
          <div className='bg-red-50 dark:bg-red-950/20 rounded-2xl p-12 max-w-lg mx-auto'>
            <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:shadow-lg transition-all'
            >
              Reintentar
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay datos
  if (data.length === 0) {
    return null
  }

  return (
    <section className='py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900'>
      <div className='max-w-screen-2xl mx-auto'>
        {/* Header con estilo moderno */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <Sparkles className='w-4 h-4' />
            <span>Colección Exclusiva</span>
          </div>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
            Productos Destacados
          </h2>
          <p className='text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
            Descubre nuestra selección de productos más populares, elegidos por
            su calidad y diseño excepcional
          </p>
        </div>

        {/* Grid de productos */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {data.map((product, index) => (
            <div
              key={product.id}
              className='animate-in fade-in zoom-in duration-700'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} from='featured' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
