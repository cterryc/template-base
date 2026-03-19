'use client'

import { useCart } from '@/contexts/CartContext'
import { FaTrashAlt } from 'react-icons/fa'
import './ShoppingCartPanel.css'

interface CartItemsListProps {
  onRemove: (id: number) => void
}

export function CartItemsList({ onRemove }: CartItemsListProps) {
  const { cartItems } = useCart()

  if (cartItems.length === 0) {
    return null
  }

  return (
    <ul className='space-y-4 mb-6'>
      {cartItems.map((item) => (
        <li key={item.id} className='shoppingCartItem'>
          <img src={item.image} alt={item.name} className='imageCartPanel' />
          <div className='containerItemTitleCartPanel'>
            <span className='font-medium text-foreground'>{item.name}</span>

            <button
              onClick={() => onRemove(item.id)}
              className='text-muted-foreground hover:text-destructive transition-colors duration-200 p-0 rounded-full hover:bg-accent'
              aria-label={`Eliminar ${item.name}`}
            >
              <FaTrashAlt className='text-red-500' size={16} />
            </button>
          </div>
          <div className='containerItemPriceCuantitiCartPanel'>
            <span className='text-muted-foreground'>
              Cantidad: {item.quantity}
            </span>
            {item.size && (
              <span className='text-muted-foreground text-sm'>
                Talla: {item.size}
              </span>
            )}
            <span className='font-medium text-foreground'>
              S/ {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
