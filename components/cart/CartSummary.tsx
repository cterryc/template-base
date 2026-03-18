'use client'

import { Button } from '@/components/ui/button'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils/order-calculations'

interface CartSummaryProps {
  subtotal: string
  onClearCart: () => void
  onCheckout: () => void
  hasDiscount: boolean
}

export function CartSummary({
  subtotal,
  onClearCart,
  onCheckout,
  hasDiscount
}: CartSummaryProps) {
  return (
    <div className='border-t border-border pt-4 mb-6'>
      <div className='flex justify-between items-center mb-4 mt-3'>
        <span className='text-muted-foreground'>Subtotal:</span>
        <span className='text-2xl font-bold text-foreground tracking-tight'>
          S/ {subtotal}
        </span>
      </div>
      
      <div
        className={`flex justify-between text-sm ${
          hasDiscount
            ? 'text-destructive'
            : 'text-emerald-700 dark:text-emerald-400'
        } bg-emerald-500/10 rounded-md py-3 px-4 mb-2 border border-emerald-500/20`}
      >
        <span className='font-medium'>
          Delivery gratuito solo para compras mayores a S/.{FREE_DELIVERY_THRESHOLD}
        </span>
      </div>
      
      <div className='space-y-3'>
        <Button
          onClick={onClearCart}
          variant='outline'
          className='w-full'
        >
          Limpiar Carrito
        </Button>
        <Button
          className='w-full'
          size='lg'
          onClick={onCheckout}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
