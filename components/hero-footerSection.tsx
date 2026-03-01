'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
// import { imagenIzquierda } from '../data/fotosPortada'

const HeroFooterSection = () => {
  const [settings, setSettings] = useState({ imagenIzquierda: '' })
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/config')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setSettings(data.data.settings || {})
      } catch (error) {
        console.error('Error cargando settings:', error)
        setSettings({ imagenIzquierda: '' })
      }
    }

    fetchSettings()
  }, [])
  return (
    <section className='heroFooterSection'>
      <div className='w-full h-full relative'>
        <Image
          src={settings.imagenIzquierda || '/CargandoImagen.png'}
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
