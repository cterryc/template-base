'use client'

import Image from 'next/image'
import { optimizeCloudinaryUrl } from '@/lib/utils/image-optimizer'
import { useConfigData } from '@/hooks/useConfigData'
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldCheck
} from 'lucide-react'

const HeroSection = () => {
  const { getImagenIzquierda, getImagenDerecha } = useConfigData()

  const imagenIzquierda = getImagenIzquierda()
  const imagenDerecha = getImagenDerecha()

  return (
    <section className='relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950'>
      {/* Fondo decorativo con patrones sutiles */}
      <div className='absolute inset-0 opacity-30'>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent' />
        <div className='absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl' />
      </div>

      <div className='relative container mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Columna izquierda - Contenido textual */}
          <div className='space-y-8 text-center lg:text-left order-2 lg:order-1'>
            {/* Badge de oferta */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mx-auto lg:mx-0'>
              <Sparkles className='w-4 h-4' />
              <span>Nueva Colección 2024</span>
            </div>

            {/* Título principal */}
            <h1 className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight'>
              <span className='bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent'>
                Descubre la
              </span>
              <br />
              <span className='bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent'>
                Elegancia Moderna
              </span>
            </h1>

            {/* Descripción */}
            <p className='text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed'>
              Explora nuestra colección exclusiva donde la calidad y el diseño
              se encuentran. Productos seleccionados para quienes buscan lo
              mejor en estilo y sofisticación.
            </p>

            {/* Beneficios rápidos */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 py-4'>
              {[
                { icon: Clock, text: 'Envío Express' },
                { icon: ShieldCheck, text: 'Garantía Total' },
                { icon: ShoppingBag, text: 'Pago Seguro' }
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'
                >
                  <benefit.icon className='w-4 h-4 text-primary' />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Botones CTA */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
              <button className='group relative inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95'>
                <span>Comprar Ahora</span>
                <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </button>
              <button className='inline-flex items-center justify-center px-8 py-4 border-2 border-primary/20 rounded-full font-medium text-primary hover:bg-primary/5 transition-all duration-300 hover:border-primary/40'>
                Ver Colección
              </button>
            </div>
          </div>

          {/* Columna derecha - Imágenes con efecto moderno */}
          <div className='relative order-1 lg:order-2'>
            <div className='relative grid grid-cols-2 gap-4 md:gap-6'>
              {/* Imagen izquierda */}
              <div className='relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 group'>
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <Image
                  src={
                    imagenIzquierda
                      ? optimizeCloudinaryUrl(imagenIzquierda, 800)
                      : '/placeholder.svg'
                  }
                  alt='Producto destacado 1'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 50vw, 33vw'
                  priority
                />
                {/* Etiqueta decorativa */}
                <div className='absolute top-4 left-4 z-20 bg-primary backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg dark:text-black'>
                  Nuevo
                </div>
              </div>

              {/* Imagen derecha con desplazamiento y badge */}
              <div className='relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 group mt-8 md:mt-12'>
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <Image
                  src={
                    imagenDerecha
                      ? optimizeCloudinaryUrl(imagenDerecha, 800)
                      : '/placeholder.svg'
                  }
                  alt='Producto destacado 2'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 50vw, 33vw'
                  priority
                />
                {/* Badge de oferta */}
                <div className='absolute bottom-4 right-4 z-20 bg-primary text-white dark:text-black px-3 py-1 rounded-full text-xs font-semibold shadow-lg'>
                  -20%
                </div>
              </div>
            </div>

            {/* Elemento decorativo flotante */}
            <div className='absolute -top-6 -right-6 w-24 h-24 bg-amber-500 rounded-full blur-2xl opacity-20 animate-pulse' />
            <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-full blur-2xl opacity-20 animate-pulse' />
          </div>
        </div>
      </div>

      {/* Ola decorativa en la parte inferior */}
      <div className='absolute bottom-0 left-0 w-full overflow-hidden leading-[0]'>
        <svg
          className='relative block w-full h-12 md:h-16'
          data-name='Layer 1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          <path
            d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'
            className='fill-neutral-200 dark:fill-neutral-800'
            opacity='.5'
          />
          <path
            d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'
            className='fill-neutral-100 dark:fill-neutral-900'
          />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
