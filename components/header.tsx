'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useCart } from '@/contexts/CartContext'
import { ThemeToggle } from './ThemeToggle'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import Image from 'next/image'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import './header.css'
import { DesktopNav } from './header/DesktopNav'
import { MobileNavContent } from './header/MobileNav'
import { UserMenuItems } from './header/UserMenuItems'
import { MdOutlineShoppingCart } from 'react-icons/md'
const ShoppingCartPanel = dynamic(() => import('./cart/ShoppingCartPanel'), {
  ssr: false,
  loading: () => (
    <div className='fixed right-0 top-1/2 opacity-0 -translate-y-1/2 w-80 md:w-96 bg-background border-l p-4 z-50'>
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

  return (
    <header className='header' role='banner'>
      <div className='container py-4 flex items-center justify-between mx-auto'>
        {/* Logo */}
        <div className='flex items-center ml-3'>
          <Link href='/' className='text-2xl font-bold flex items-center gap-1'>
            <Image
              src='https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
              width={40}
              height={40}
              alt='Logo'
              className='rounded-full'
            />
            <Image
              src='/NombreMarca.jpg'
              width={100}
              height={30}
              alt='Logo'
              className='rounded-full'
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Right side actions */}
        <div className='flex items-center gap-2'>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Shopping Cart */}
          <button
            onClick={toggleCart}
            className='relative p-2'
            aria-label='Abrir carrito'
          >
            <MdOutlineShoppingCart className='text-2xl' />
            {cartItems.length > 0 && (
              <span className='absolute top-0 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* User Button - Desktop */}
          <div className='hidden md:block'>
            <SignedIn>
              <UserMenuItems showNavigationLinks={false} />
            </SignedIn>
            <SignedOut>
              <div className='flex space-x-2'>
                <Link href='/sign-in'>
                  <Button variant='ghost'>Login</Button>
                </Link>
                <Link href='/sign-up'>
                  <Button>Register</Button>
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='md:hidden ml-3'
                aria-label='Abrir menú'
              >
                <ClipboardList />
              </Button>
            </SheetTrigger>
            <MobileNavContent onClose={closeMobileMenu} />
          </Sheet>
        </div>
      </div>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel isOpen={isCartOpen} onClose={toggleCart} />
    </header>
  )
}
