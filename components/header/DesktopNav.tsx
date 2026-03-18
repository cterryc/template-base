'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/collection', label: 'Productos' },
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contactanos' }
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className='hidden md:block' aria-label='Navegación principal'>
      <ul className='flex space-x-4'>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '')
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`hover:text-slate-400 ${
                  isActive ? 'text-slate-500' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
