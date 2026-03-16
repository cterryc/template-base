'use client'

import Link from 'next/link'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import { useConfigData } from '@/hooks/useConfigData'
import { ecommerceName } from '@/lib/constants'

export default function Footer() {
  const { getInstagram, getFacebook, getTiktok } = useConfigData()

  const instagram = getInstagram()
  const facebook = getFacebook()
  const tiktok = getTiktok()

  return (
    <footer className='bg-secondary text-foreground'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='font-bold mb-2'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>
                <Link href='/collection' className='hover:text-primary'>
                  Productos
                </Link>
              </li>
              <li>
                <Link href='/about' className='hover:text-primary'>
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href='/contact' className='hover:text-primary'>
                  Contactanos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-bold mb-2'>Follow Us</h3>
            <div className='flex flex-col'>
              {facebook && (
                <Link
                  href={facebook}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaFacebook className='h-8 w-7' /> Facebook
                </Link>
              )}
              {instagram && (
                <Link
                  href={instagram}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaInstagram className='h-8 w-7' /> Instagram
                </Link>
              )}
              {tiktok && (
                <Link
                  href={tiktok}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaTiktok className='h-8 w-7' /> Tiktok
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className='mt-8 text-center text-sm text-gray-500'>
          © 2025 {ecommerceName}. Todos los derechos reservados. By{' '}
          <Link
            href='https://marteldev.com/'
            target='_blank'
            className='text-foreground'
          >
            Terry
          </Link>
        </div>
      </div>
    </footer>
  )
}
