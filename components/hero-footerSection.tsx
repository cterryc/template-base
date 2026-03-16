'use client'

import Image from 'next/image'
import { useConfigData } from '@/hooks/useConfigData'

const HeroFooterSection = () => {
  const { getImagenIzquierda } = useConfigData()
  const imagenIzquierda = getImagenIzquierda()

  return (
    <section className='heroFooterSection'>
      <div className='w-full h-full relative'>
        <Image
          src={imagenIzquierda || '/CargandoImagen.png'}
          alt='Imagen footer'
          fill
          className='object-cover'
          sizes='100vw'
        />
      </div>
    </section>
  )
}

export default HeroFooterSection
