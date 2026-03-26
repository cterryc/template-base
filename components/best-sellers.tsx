'use client'

import { useState, useEffect } from 'react'
import ProductCard from './product-card'
import { Sparkles, TrendingUp } from 'lucide-react'

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

export default function BestSellers() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/colecciones')

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const collectionData = await response.json()

        setData(collectionData.data.colecciones)
      } catch (error) {
        console.error('❌ [CLIENT] Error cargando Colecciones:', error)
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
      <section className='py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-muted/30 to-background'>
        <div className='max-w-screen-2xl mx-auto'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6'>
              <TrendingUp className='w-4 h-4' />
              <span>Más Vendidos</span>
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              Colecciones Populares
            </h2>
            <p className='text-muted-foreground mt-4 max-w-2xl mx-auto'>
              Descubre las colecciones más solicitadas por nuestros clientes
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
                from='bestSellers'
                isLoading={true}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Si no hay datos después de cargar
  if (data.length === 0) {
    return (
      <section className='py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-muted/30 to-background'>
        <div className='max-w-screen-2xl mx-auto text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6'>
            <TrendingUp className='w-4 h-4' />
            <span>Próximamente</span>
          </div>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4'>
            Nuevas Colecciones
          </h2>
          <p className='text-muted-foreground text-lg'>
            Estamos preparando colecciones exclusivas para ti. <br />
            ¡Pronto estarán disponibles!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-muted/30 to-background'>
      <div className='max-w-screen-2xl mx-auto'>
        {/* Header con estilo moderno */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <TrendingUp className='w-4 h-4' />
            <span>Más Vendidos</span>
          </div>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
            Colecciones Populares
          </h2>
          <p className='text-muted-foreground mt-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
            Explora nuestras colecciones más exclusivas, seleccionadas por su
            estilo único y calidad excepcional
          </p>
        </div>

        {/* Grid de colecciones */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 p-2 md:p-8 bg-zinc-900 dark:bg-zinc-100 rounded-2xl'>
          {data.map((product, index) => (
            <div
              key={product.id}
              className='animate-in fade-in zoom-in duration-700'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} from='bestSellers' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
