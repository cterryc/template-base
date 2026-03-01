'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { optimizeCloudinaryUrl } from '@/lib/utils/image-optimizer'

interface Settings {
  imagenIzquierda?: string
  imagenDerecha?: string
  [key: string]: string | undefined
}

const HeroSection = () => {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/config')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        console.log('hero section', data)
        setSettings(data.data.settings || {})
        setError(null)
      } catch (error) {
        console.error('Error cargando config:', error)
        setError('No se pudieron cargar las imágenes')
        setSettings({})
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Skeleton con altura DINÁMICA
  if (loading) {
    return (
      <section className='heroSection' style={{ height: containerHeight }}>
        <div className='w-full h-full relative'>
          <Image
            src='/CargandoImagen.png'
            alt='Imagen izquierda'
            fill
            className='object-cover'
            sizes='50vw'
          />
        </div>
        <div className='w-full h-full relative'>
          <Image
            src='/CargandoImagen.png'
            alt='Imagen derecha'
            fill
            className='object-cover'
            sizes='50vw'
          />
        </div>
      </section>
    )
  }

  // Versión final CORREGIDA
  return (
    <section className='heroSection' style={{ height: '90vh' }}>
      <div className='w-full h-full relative'>
        <Image
          src={
            settings.imagenIzquierda
              ? optimizeCloudinaryUrl(settings.imagenIzquierda, 1200)
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
            settings.imagenDerecha
              ? optimizeCloudinaryUrl(settings.imagenDerecha, 1200)
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
