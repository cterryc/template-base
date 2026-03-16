'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { optimizeCloudinaryUrl } from '@/lib/utils/image-optimizer'
import { useConfigData } from '@/hooks/useConfigData'

const HeroSection = () => {
  const { getImagenIzquierda, getImagenDerecha } = useConfigData()

  const imagenIzquierda = getImagenIzquierda()
  const imagenDerecha = getImagenDerecha()

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(500)

  // Medir contenedor para altura dinámica
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Obtener altura del viewport o contenedor
        const height = window.innerHeight * 0.7 // 70% del viewport
        setContainerHeight(Math.max(400, height)) // Mínimo 400px
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

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
