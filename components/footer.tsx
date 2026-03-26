'use client'

import Link from 'next/link'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import { useConfigData } from '@/hooks/useConfigData'
import { ecommerceName } from '@/lib/constants'
import { Mail, MapPin, Phone, ArrowUp, Heart } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const { getInstagram, getFacebook, getTiktok, getTelefono, getCorreo } =
    useConfigData()
  const [showScrollTop, setShowScrollTop] = useState(false)

  const instagram = getInstagram()
  const facebook = getFacebook()
  const tiktok = getTiktok()
  const email = getCorreo()
  const telefono = getTelefono()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Detectar scroll para mostrar botón
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 500)
    })
  }

  const socialLinks = [
    {
      icon: FaFacebook,
      href: facebook,
      label: 'Facebook',
      color: 'hover:text-[#1877f2]'
    },
    {
      icon: FaInstagram,
      href: instagram,
      label: 'Instagram',
      color: 'hover:text-[#e4405f]'
    },
    {
      icon: FaTiktok,
      href: tiktok,
      label: 'TikTok',
      color: 'hover:text-[#000000] dark:hover:text-white'
    }
  ].filter((link) => link.href)

  const quickLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/collection', label: 'Productos' },
    { href: '/about', label: 'Nosotros' },
    { href: '/contact', label: 'Contáctanos' }
  ]

  const contactInfo = [
    { icon: Mail, text: email, href: `mailto:${email}` },
    { icon: Phone, text: telefono, href: `tel:${telefono}` },
    { icon: MapPin, text: 'Lima, Perú', href: '#' }
  ]

  return (
    <footer className='relative bg-gradient-to-b from-background to-muted/50 border-t border-border'>
      {/* Botón de scroll to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label='Volver arriba'
      >
        <ArrowUp className='w-5 h-5' />
      </button>

      <div className='container mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16'>
        {/* Grid principal */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
          {/* Columna 1 - Información de la marca */}
          <div className='space-y-4'>
            <h3 className='text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              {ecommerceName}
            </h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Descubre la elegancia moderna con nuestra colección exclusiva de
              productos seleccionados para quienes buscan lo mejor en estilo y
              sofisticación.
            </p>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Heart className='w-4 h-4 text-primary' />
              <span>Hecho con pasión para ti</span>
            </div>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div>
            <h3 className='font-bold text-foreground mb-4 relative inline-block'>
              Enlaces Rápidos
              <span className='absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full' />
            </h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-muted-foreground hover:text-primary transition-colors duration-200 text-sm flex items-center gap-2 group'
                  >
                    <span className='w-1 h-1 bg-primary/50 rounded-full group-hover:bg-primary transition-colors' />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - Información de contacto */}
          <div>
            <h3 className='font-bold text-foreground mb-4 relative inline-block'>
              Contacto
              <span className='absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full' />
            </h3>
            <ul className='space-y-3'>
              {contactInfo.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className='flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-200 text-sm group'
                  >
                    <item.icon className='w-4 h-4 group-hover:scale-110 transition-transform' />
                    <span>{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 - Redes sociales */}
          <div>
            <h3 className='font-bold text-foreground mb-4 relative inline-block'>
              Síguenos
              <span className='absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full' />
            </h3>
            <div className='flex flex-col space-y-3'>
              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className={`flex items-center gap-3 text-muted-foreground ${social.color} transition-all duration-200 text-sm group`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <social.icon className='h-5 w-5 group-hover:scale-110 transition-transform' />
                    <span>{social.label}</span>
                  </Link>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Próximamente en redes sociales
                </p>
              )}
            </div>

            {/* Newsletter simplificado */}
            {/* <div className='mt-6 pt-6 border-t border-border'>
              <p className='text-xs text-muted-foreground mb-2'>
                Suscríbete para novedades
              </p>
              <div className='flex gap-2'>
                <input
                  type='email'
                  placeholder='Tu email'
                  className='flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
                />
                <button className='px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
                  Enviar
                </button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Barra inferior */}
        <div className='mt-12 pt-8 border-t border-border'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4 text-center'>
            <p className='text-xs text-muted-foreground'>
              © 2025 {ecommerceName}. Todos los derechos reservados.
            </p>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <Link
                href='/privacy'
                className='hover:text-primary transition-colors'
              >
                Política de Privacidad
              </Link>
              <span className='w-1 h-1 bg-border rounded-full' />
              <Link
                href='/terms'
                className='hover:text-primary transition-colors'
              >
                Términos y Condiciones
              </Link>
            </div>
            <p className='text-xs text-muted-foreground'>
              Desarrollado por{' '}
              <Link
                href='https://marteldev.com/'
                target='_blank'
                className='text-primary hover:text-primary/80 transition-colors font-medium'
              >
                Terry
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
