'use client'

import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, Package, ShoppingBag, Settings } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

interface UserMenuItemsProps {
  showNavigationLinks?: boolean
}

/**
 * Componente para los MenuItem del UserButton de Clerk
 *
 * @param showNavigationLinks - Si es true, muestra los enlaces de navegación (Home, Productos, etc.)
 *                              Solo para mobile
 */
export function UserMenuItems({
  showNavigationLinks = false
}: UserMenuItemsProps) {
  const { isAdminOrEditor } = useUserRole()
  const { theme } = useTheme()

  const adminIcon = <LayoutDashboard className='w-4 h-4' />
  const ordersIcon = <ShoppingBag className='w-4 h-4' />

  return (
    <UserButton
      appearance={{
        theme: theme === 'dark' ? dark : undefined,
        elements: {
          userButtonAvatarBox:
            'w-9 h-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all',
          userButtonTrigger: 'focus:shadow-none'
        }
      }}
      userProfileProps={{
        appearance: { theme: theme === 'dark' ? dark : undefined }
      }}
    >
      <UserButton.MenuItems>
        {showNavigationLinks && (
          <>
            <UserButton.Link label='Inicio' labelIcon={ordersIcon} href='/' />
            <UserButton.Link
              label='Productos'
              labelIcon={ordersIcon}
              href='/collection'
            />
            <UserButton.Link
              label='Nosotros'
              labelIcon={ordersIcon}
              href='/about'
            />
            <UserButton.Link
              label='Contáctanos'
              labelIcon={ordersIcon}
              href='/contact'
            />
          </>
        )}

        {isAdminOrEditor ? (
          <UserButton.Link
            label='Panel de Administración'
            labelIcon={adminIcon}
            href='/admin-panel'
          />
        ) : (
          <UserButton.Link
            label='Mis pedidos'
            labelIcon={ordersIcon}
            href='/orders'
          />
        )}

        <UserButton.Action label='manageAccount' />
      </UserButton.MenuItems>
    </UserButton>
  )
}
