'use client'

import Image from 'next/image'
import { useConfigData } from '@/hooks/useConfigData'
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const HeroFooterSection = () => {
  const { getImagenIzquierda } = useConfigData()
  const imagenIzquierda = getImagenIzquierda()
  const router = useRouter()

  const handleVerColecciones = (path: string) => {
    router.push(path)
  }

  return (
    <section className='py-14 md:py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-t from-background to-muted/20'>
      <div className='max-w-6xl mx-auto'>
        <div className='relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group'>
          {/* Contenedor de imagen */}
          <div className='relative h-[500px] md:h-[600px] lg:h-[700px] w-full'>
            <Image
              src={imagenIzquierda || '/placeholder.svg'}
              alt='Imagen promocional'
              fill
              className='object-cover transition-transform duration-1000 group-hover:scale-110'
              sizes='100vw'
              priority
            />

            {/* Overlay gradiente mejorado */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20' />

            {/* Contenido */}
            <div className='absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8 backdrop-blur-sm bg-white/10 dark:bg-zinc-900/30 m-6 md:m-24 rounded-2xl'>
              {/* Badde decorativo */}
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                <Sparkles className='w-4 h-4' />
                <span>Oferta Exclusiva</span>
              </div>

              {/* Título principal */}
              <h2 className='text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white mb-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
                Únete al Círculo
                <span className='block bg-gradient-to-r from-white to-amber-500 bg-clip-text text-transparent mt-2'>
                  Curated Circle
                </span>
              </h2>

              {/* Descripción */}
              <p className='text-white/80 text-base md:text-lg mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
                Descubre beneficios exclusivos, acceso anticipado a colecciones
                y experiencias únicas diseñadas para ti
              </p>

              {/* Beneficios rápidos */}
              {/* <div className='flex flex-wrap justify-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'>
                {[
                  'Envío Gratis',
                  '10% de Descuento',
                  'Acceso Anticipado',
                  'Eventos Exclusivos'
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-1.5 text-white/80 text-sm'
                  >
                    <ChevronRight className='w-3 h-3 text-primary' />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div> */}

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400'>
                <Button
                  className='group relative bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
                  onClick={() => handleVerColecciones('/sign-up')}
                >
                  <span>Registrate Ahora</span>
                  <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </Button>
                <Button
                  variant='outline'
                  className='bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm hidden md:flex'
                  onClick={() => handleVerColecciones('/collection')}
                >
                  Ver Colecciones
                </Button>
              </div>

              {/* Texto adicional */}
              <p className='text-white/50 text-xs mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 hidden md:block'>
                Sin compromiso. Puedes cancelar en cualquier momento.
              </p>
            </div>
          </div>

          {/* Elementos decorativos flotantes */}
          <div className='absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse' />
          <div className='absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse' />
        </div>
      </div>
    </section>
  )
}

export default HeroFooterSection
