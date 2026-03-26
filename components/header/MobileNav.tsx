'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { UserMenuItems } from './UserMenuItems'
import { X, Home, Package, Users, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavContentProps {
  onClose: () => void
}

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/collection', label: 'Productos', icon: Package },
  { href: '/about', label: 'Nosotros', icon: Users },
  { href: '/contact', label: 'Contáctanos', icon: Mail }
]

export function MobileNavContent({ onClose }: MobileNavContentProps) {
  const pathname = usePathname()

  return (
    <SheetContent
      side='right'
      className='w-[280px] sm:w-[320px] p-0 bg-background border-l'
    >
      <SheetHeader className='p-4 border-b'>
        <div className='flex items-center justify-between'>
          <SheetTitle className='text-lg font-semibold'>Menú</SheetTitle>
          <SheetClose asChild>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full'
              onClick={onClose}
            >
              <X className='w-4 h-4' />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto py-6 px-4'>
          <nav className='flex flex-col space-y-2'>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href === '/' && pathname === '')
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'hover:bg-accent group',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className='ml-auto w-1.5 h-1.5 rounded-full bg-primary' />
                  )}
                </Link>
              )
            })}
          </nav>

          <SignedIn>
            <div className='mt-6 pt-6 border-t'>
              <div className='px-2 mb-3'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Mi cuenta
                </p>
              </div>
              <UserMenuItems showNavigationLinks={false} />
            </div>
          </SignedIn>

          <SignedOut>
            <div className='mt-6 pt-6 border-t flex flex-col gap-3'>
              <Link href='/sign-in' onClick={onClose}>
                <Button variant='outline' className='w-full rounded-full'>
                  Iniciar sesión
                </Button>
              </Link>
              <Link href='/sign-up' onClick={onClose}>
                <Button className='w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90'>
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </SignedOut>
        </div>
      </div>
    </SheetContent>
  )
}
