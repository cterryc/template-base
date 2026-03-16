'use client'

import React, { useState, useEffect } from 'react'
import OdersManagement from './components/Orders'
import {
  MdInventory2,
  MdShoppingBag,
  MdGroups2,
  MdSettings,
  MdMenu,
  MdClose
} from 'react-icons/md'
import { BiSolidCoupon } from 'react-icons/bi'
import { IoGridSharp } from 'react-icons/io5'
import { Toaster } from 'sonner'
import UserManagement from './components/UserManagement'
import ProductsManagement from './components/products/ProductsManagement'
import SettingsManagement from './components/SettingsManagement'
import CuponesCRUD from './components/CuponesCRUD'
import ReviewsManagement from './components/ReviewsManagement'
import { MdRateReview } from 'react-icons/md'
import { Button } from '@/components/ui/button'

const paths = [
  { name: 'Órdenes', path: 'orders', icon: MdShoppingBag },
  { name: 'Productos', path: 'products', icon: MdInventory2 },
  { name: 'Usuarios', path: 'users', icon: MdGroups2 },
  { name: 'Reseñas', path: 'reviews', icon: MdRateReview },
  { name: 'Cupones', path: 'coupon', icon: BiSolidCoupon },
  { name: 'Configuracion', path: 'settings', icon: MdSettings }
]

const AdminPanel = () => {
  // Estado inicial basado en localStorage o por defecto 'orders'
  const [panel, setPanel] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Efecto para cargar el panel guardado al montar
  useEffect(() => {
    const savedPanel = sessionStorage.getItem('admin-panel')
    if (savedPanel && paths.some((p) => p.path === savedPanel)) {
      setPanel(savedPanel)
    } else {
      setPanel('orders')
    }
    return () => sessionStorage.setItem('admin-panel', '')
  }, [])

  // Función para cambiar panel y guardar en localStorage
  const handleSetPanel = (newPanel: string) => {
    setPanel(newPanel)
    sessionStorage.setItem('admin-panel', newPanel)
    setIsSidebarOpen(false) // Cerrar sidebar mobile al seleccionar
  }

  return (
    <>
      <div className='relative flex w-full bg-gray-50 font-sans antialiased text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
        {/* Notificaciones Toast */}
        <Toaster position='top-right' richColors />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className='lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors'
          aria-label='Abrir menú'
        >
          <MdMenu size={24} className='text-gray-700 dark:text-gray-300' />
        </button>

        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Desktop y Mobile */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-0
            w-64 flex-col border-r border-gray-200 bg-white 
            lg:flex dark:bg-gray-800 dark:border-gray-700
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        ></div>
        <aside
          className={`
            fixed lg:top-20 inset-y-0 left-0 z-50 lg:max-h-[500px]
            w-64 flex-col border-r border-gray-200 bg-white 
            lg:flex dark:bg-gray-800 dark:border-gray-700
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className='flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700'>
            <div className='flex items-center gap-2'>
              <IoGridSharp className='text-blue-600 text-2xl dark:text-blue-400' />
              <h1 className='text-lg font-bold tracking-tight text-gray-900 dark:text-white'>
                Admin Panel
              </h1>
            </div>
            {/* Botón cerrar solo mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className='lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              aria-label='Cerrar menú'
            >
              <MdClose size={20} className='text-gray-500 dark:text-gray-400' />
            </button>
          </div>
          <div className='flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6 pb-12'>
            <nav className='flex flex-col gap-1'>
              {paths.map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    item.path === panel
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleSetPanel(item.path)}
                >
                  <item.icon size={20} />
                  <span className='text-sm font-medium'>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
        {panel === 'users' ? (
          <UserManagement />
        ) : panel === 'products' ? (
          <ProductsManagement />
        ) : panel === 'settings' ? (
          <SettingsManagement />
        ) : panel === 'coupon' ? (
          <CuponesCRUD />
        ) : panel === 'reviews' ? (
          <ReviewsManagement />
        ) : (
          <OdersManagement />
        )}
      </div>
    </>
  )
}

export default AdminPanel
