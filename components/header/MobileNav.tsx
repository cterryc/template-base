'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { UserMenuItems } from './UserMenuItems'

interface MobileNavContentProps {
  onClose: () => void
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/collection', label: 'Productos' },
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contactanos' }
]

export function MobileNavContent({ onClose }: MobileNavContentProps) {
  const pathname = usePathname()

  return (
    <SheetContent side='right' className='w-[250px] sm:w-[300px]'>
      <SheetHeader>
        <SheetTitle className='sr-only'>
          Menú de navegación
        </SheetTitle>
      </SheetHeader>
      <div className='flex flex-col h-full'>
        <div className='py-6'>
          <nav className='flex flex-col space-y-4'>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/' && pathname === '')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`text-lg font-medium ${
                    isActive ? 'text-slate-500' : 'text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            <SignedIn>
              <div className='pt-4 border-t'>
                <UserMenuItems showNavigationLinks={false} />
              </div>
            </SignedIn>

            <SignedOut>
              <div className='pt-4 border-t flex flex-col gap-2'>
                <Link href='/sign-in' onClick={onClose}>
                  <Button variant='ghost' className='w-full'>
                    Login
                  </Button>
                </Link>
                <Link href='/sign-up' onClick={onClose}>
                  <Button className='w-full'>
                    Register
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </nav>
        </div>
      </div>
    </SheetContent>
  )
}
