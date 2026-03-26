'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/collection', label: 'Productos' },
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contáctanos' }
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className='hidden md:block' aria-label='Navegación principal'>
      <ul className='flex items-center gap-1'>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href === '/' && pathname === '')

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full',
                  'hover:text-primary hover:bg-accent/50',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full' />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
