'use client'

import { UserButton } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import { GrUserAdmin } from 'react-icons/gr'
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
export function UserMenuItems({ showNavigationLinks = false }: UserMenuItemsProps) {
  const { isAdminOrEditor } = useUserRole()
  const { theme } = useTheme()

  const adminIcon = (
    <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
  )

  const ordersIcon = (
    <ClipboardList className='w-full pb-2 justify-center items-center' />
  )

  return (
    <UserButton
      appearance={{ theme: theme === 'dark' ? dark : undefined }}
      userProfileProps={{
        appearance: { theme: theme === 'dark' ? dark : undefined }
      }}
    >
      <UserButton.MenuItems>
        {showNavigationLinks && (
          <>
            <UserButton.Link
              label='Inicio'
              labelIcon={adminIcon}
              href='/'
            />
            <UserButton.Link
              label='Productos'
              labelIcon={adminIcon}
              href='/collection'
            />
            <UserButton.Link
              label='Nosotros'
              labelIcon={adminIcon}
              href='/about'
            />
            <UserButton.Link
              label='Contactanos'
              labelIcon={adminIcon}
              href='/contact'
            />
          </>
        )}

        {isAdminOrEditor ? (
          <UserButton.Link
            label='Admin Panel'
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
