'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Menu } from 'lucide-react'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { GrUserAdmin } from 'react-icons/gr'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useCart } from '@/contexts/CartContext'
import { ThemeToggle } from './ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import './header.css'
import { dark } from '@clerk/themes'
import { useUserRole } from '@/hooks/useUserRole'
import { useTheme } from 'next-themes'

// Lazy load ShoppingCartPanel - no se necesita SSR
const ShoppingCartPanel = dynamic(() => import('./ShoppingCartPanel'), {
  ssr: false,
  loading: () => (
    <div className='fixed right-0 top-1/2 opacity-0 -translate-y-1/2 w-80 md:w-96 bg-background border-l p-4 z-50'>
      <p className='text-muted-foreground text-center'>Cargando carrito...</p>
    </div>
  )
})

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems } = useCart()
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useUser()
  const { theme } = useTheme()
  const { isAdminOrEditor } = useUserRole()

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  return (
    <header className='header' role='banner'>
      <div className='container py-4 flex items-center justify-between mx-auto'>
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
        <nav className='hidden md:block' aria-label='Navegación principal'>
          <ul className='flex space-x-4'>
            <li>
              <Link
                href='/'
                className={`hover:text-slate-400 ${
                  pathname === '/' || pathname === '' ? 'text-slate-500' : ''
                }`}
                aria-current={
                  pathname === '/' || pathname === '' ? 'page' : undefined
                }
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href='/collection'
                className={`hover:text-slate-400 ${
                  pathname === '/collection' ? 'text-slate-500' : ''
                }`}
                aria-current={pathname === '/collection' ? 'page' : undefined}
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className={`hover:text-slate-400 ${
                  pathname === '/about' ? 'text-slate-500' : ''
                }`}
                aria-current={pathname === '/about' ? 'page' : undefined}
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className={`hover:text-slate-400 ${
                  pathname === '/contact' ? 'text-slate-500' : ''
                }`}
                aria-current={pathname === '/contact' ? 'page' : undefined}
              >
                Contactanos
              </Link>
            </li>
          </ul>
        </nav>

        <div className='flex items-center max-md:pr-5'>
          <div className='flex items-center w-8'>
            <ThemeToggle />
          </div>
          <button
            onClick={toggleCart}
            className='relative h-8 w-8 p-0 ml-2 md:ml-3'
            aria-label='Abrir carrito'
          >
            <MdOutlineShoppingCart className='h-6 w-6' />
            {cartItems.length > 0 && (
              <>
                <span className='sr-only'>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}{' '}
                  productos en el carrito
                </span>
                <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </>
            )}
          </button>

          {/* Login Clerk */}
          {!isLoaded ? (
            <span className='loader'></span>
          ) : isSignedIn ? (
            <div className='min-w-7 flex justify-center items-center pl-3'>
              <div className='sm:hidden flex justify-center items-center'>
                <SignedIn>
                  <UserButton
                    appearance={{
                      theme: theme === 'dark' ? dark : 'simple'
                    }}
                    userProfileProps={{
                      appearance: {
                        theme: theme === 'dark' ? dark : 'simple'
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      {/* "Admin Panel" - Solo ADMIN/EDITOR */}

                      <UserButton.Link
                        label='Inicio'
                        labelIcon={
                          <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                        }
                        href='/'
                      />
                      <UserButton.Link
                        label='Productos'
                        labelIcon={
                          <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                        }
                        href='/collection'
                      />
                      <UserButton.Link
                        label='Nosotros'
                        labelIcon={
                          <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                        }
                        href='/about'
                      />
                      <UserButton.Link
                        label='Contactanos'
                        labelIcon={
                          <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                        }
                        href='/contact'
                      />
                      {isAdminOrEditor ? (
                        <UserButton.Link
                          label='Admin Panel'
                          labelIcon={
                            <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                          }
                          href='/admin-panel'
                        />
                      ) : (
                        <UserButton.Link
                          label='Mis pedidos'
                          labelIcon={
                            <ClipboardList className='w-full pb-2 justify-center items-center' />
                          }
                          href='/orders'
                        />
                      )}
                      <UserButton.Action label='manageAccount' />
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
              </div>
              <div className='max-sm:hidden flex justify-center items-center'>
                <SignedIn>
                  <UserButton
                    appearance={{
                      theme: theme === 'dark' ? dark : 'simple'
                    }}
                    userProfileProps={{
                      appearance: {
                        theme: theme === 'dark' ? dark : 'simple'
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      {/* "Admin Panel" - Solo ADMIN/EDITOR */}
                      {isAdminOrEditor ? (
                        <UserButton.Link
                          label='Admin Panel'
                          labelIcon={
                            <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                          }
                          href='/admin-panel'
                        />
                      ) : (
                        <UserButton.Link
                          label='Mis pedidos'
                          labelIcon={
                            <ClipboardList className='w-full pb-2 justify-center items-center' />
                          }
                          href='/orders'
                        />
                      )}
                      <UserButton.Action label='manageAccount' />
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
              </div>
            </div>
          ) : (
            <div className='hidden md:flex space-x-2'>
              <Link href='/sign-in'>
                <Button variant='ghost'>Login</Button>
              </Link>
              <Link href='/sign-up'>
                <Button>Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div
            className={`${isSignedIn || !isLoaded ? 'max-sm:hidden' : 'max-sm:flex'}`}
          >
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  // variant='ghost'
                  size='icon'
                  className='md:hidden ml-3'
                  aria-label='Abrir menú'
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[250px] sm:w-[300px]'>
                <SheetHeader>
                  <SheetTitle className='sr-only'>
                    Menú de navegación
                  </SheetTitle>
                </SheetHeader>
                <div className='flex flex-col h-full'>
                  <div className='py-6'>
                    <nav className='flex flex-col space-y-4'>
                      <Link
                        href='/'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href='/collection'
                        className='text-lg hover:text-primary'
                        onClick={(e) => {
                          e.preventDefault()
                          setIsOpen(false)
                          setTimeout(() => {
                            window.location.href = '/collection'
                          }, 100)
                        }}
                      >
                        Productos
                      </Link>
                      <Link
                        href='/about'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Nosotros
                      </Link>
                      <Link
                        href='/contact'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Contactanos
                      </Link>
                      {/* "Mis pedidos" - Solo usuarios logueados */}
                      {isSignedIn && (
                        <Link
                          href='/orders'
                          className='text-lg hover:text-primary'
                          onClick={() => setIsOpen(false)}
                        >
                          Mis pedidos
                        </Link>
                      )}
                      {/* "Admin Panel" - Solo ADMIN/EDITOR */}
                      {/* {isAdminOrEditor && (
                        <Link
                          href='/admin-panel'
                          className='text-lg hover:text-primary'
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )} */}
                    </nav>
                  </div>

                  {!isSignedIn && (
                    <div className='mt-auto pb-6 flex flex-col space-y-2'>
                      <Link href='/sign-in'>
                        <Button
                          variant='outline'
                          className='w-full'
                          onClick={() => setIsOpen(false)}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href='/sign-up'>
                        <Button
                          className='w-full'
                          onClick={() => setIsOpen(false)}
                        >
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <ShoppingCartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  )
}
