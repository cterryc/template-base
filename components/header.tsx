'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { useCart } from '@/contexts/CartContext'
import { ThemeToggle } from './ThemeToggle'
import Image from 'next/image'
import { DesktopNav } from './header/DesktopNav'
import { MobileNavContent } from './header/MobileNav'
import { UserMenuItems } from './header/UserMenuItems'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'

const ShoppingCartPanel = dynamic(() => import('./cart/ShoppingCartPanel'), {
  ssr: false,
  loading: () => (
    <div className='fixed right-0 top-1/2 opacity-0 -translate-y-1/2 w-80 md:w-96 bg-background border-l shadow-xl p-4 z-50 rounded-l-2xl'>
      <p className='text-muted-foreground text-center'>Cargando carrito...</p>
    </div>
  )
})

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { cartItems } = useCart()

  const toggleCart = () => setIsCartOpen(!isCartOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <header
      className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50'
      role='banner'
    >
      <div className='container mx-auto px-4 md:px-8 lg:px-12'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 group'
            aria-label='Ir al inicio'
          >
            <div className='relative w-10 h-10 rounded-full overflow-hidden shadow-lg transition-transform group-hover:scale-105'>
              <Image
                src='https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
                fill
                alt='Logo'
                className='object-cover'
              />
            </div>
            <div className='relative w-[100px] h-[30px]'>
              <Image
                src='/NombreMarca.jpg'
                fill
                alt='Nombre de la marca'
                className='object-contain'
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side actions */}
          <div className='flex items-center gap-1 md:gap-2'>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Shopping Cart */}
            <button
              onClick={toggleCart}
              className='relative p-2 rounded-full hover:bg-accent transition-colors'
              aria-label='Abrir carrito'
            >
              <ShoppingBag className='w-5 h-5 dark:text-white' />
              {totalItems > 0 && (
                <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg'>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Button - Desktop */}
            <div className='hidden md:block ml-2'>
              <SignedIn>
                <UserMenuItems showNavigationLinks={false} />
              </SignedIn>
              <SignedOut>
                <div className='flex items-center gap-2'>
                  <Link href='/sign-in'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='rounded-full dark:text-white'
                    >
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href='/sign-up'>
                    <Button
                      size='sm'
                      className='rounded-full bg-primary text-primary-foreground hover:bg-primary/90'
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  // variant='ghost'
                  size='icon'
                  className='md:hidden rounded-full h-8 w-8 ml-2'
                  aria-label='Abrir menú'
                >
                  <Menu className='w-5 h-5' />
                </Button>
              </SheetTrigger>
              <MobileNavContent onClose={closeMobileMenu} />
            </Sheet>
          </div>
        </div>
      </div>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel isOpen={isCartOpen} onClose={toggleCart} />
    </header>
  )
}
