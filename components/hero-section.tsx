'use client'

import React from 'react'
import Image from 'next/image'
import { optimizeCloudinaryUrl } from '@/lib/utils/image-optimizer'
import { useConfigData } from '@/hooks/useConfigData'

const HeroSection = () => {
  const { getImagenIzquierda, getImagenDerecha } = useConfigData()

  const imagenIzquierda = getImagenIzquierda()
  const imagenDerecha = getImagenDerecha()

  // Versión final CORREGIDA
  return (
    <section className='heroSection' style={{ height: '90vh' }}>
      <div className='w-full h-full relative'>
        <Image
          src={
            imagenIzquierda
              ? optimizeCloudinaryUrl(imagenIzquierda, 1200)
              : '/placeholder.svg'
          }
          alt='Imagen izquierda'
          fill
          className='object-cover'
          sizes='50vw'
          priority
        />
      </div>
      <div className='w-full h-full relative'>
        <Image
          src={
            imagenDerecha
              ? optimizeCloudinaryUrl(imagenDerecha, 1200)
              : '/placeholder.svg'
          }
          alt='Imagen derecha'
          fill
          className='object-cover'
          sizes='50vw'
          priority
        />
      </div>
    </section>
  )
}

export default HeroSection
