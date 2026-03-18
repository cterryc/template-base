'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CartItemsList } from './cart/CartItemsList'
import { CouponInput } from './cart/CouponInput'
import { CartSummary } from './cart/CartSummary'
import FormToSend from './formToSend'
import type { CartItem } from '@/types/products'

interface ShoppingCartPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShoppingCartPanel({
  isOpen,
  onClose
}: ShoppingCartPanelProps) {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const [itemsProducts, setItemsProducts] = useState<CartItem[]>([])
  const [showCardClientName, setShowCardClientName] = useState(false)
  const [subTotal, setSubTotal] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [discountCode, setDiscountCode] = useState('')

  // Actualizar items y subtotal cuando cambia el carrito
  useEffect(() => {
    setItemsProducts(
      cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        size: item.size
      }))
    )
    setSubTotal(getCartTotal().toFixed(2))
    
    // Limpiar estado al cerrar
    return () => {
      setDescuento(0)
      setDiscountCode('')
    }
  }, [cartItems, getCartTotal])

  // Calcular subtotal con descuento
  const calculateSubtotal = (discount?: number) => {
    if (discount && discount > 0) {
      const total = getCartTotal()
      const discountAmount = (total * 10 * discount) / 1000
      const rounded = Math.ceil(discountAmount * 10)
      const subtotal = ((total * 10 - rounded) / 10).toFixed(2)
      setSubTotal(subtotal)
    } else {
      setSubTotal(getCartTotal().toFixed(2))
    }
  }

  // Validar cupón
  const validateCoupon = async (code: string) => {
    const response = await fetch(`/api/cupones/codigo/${code}`)
    
    if (!response.ok) {
      return { valid: false }
    }
    
    const data = await response.json()
    setDiscountCode(data.codigoCupon)
    setDescuento(data.descuento)
    calculateSubtotal(data.descuento)
    
    return {
      valid: true,
      discount: data.descuento,
      code: data.codigoCupon
    }
  }

  const clearCoupon = () => {
    setDescuento(0)
    setDiscountCode('')
    calculateSubtotal()
  }

  if (!isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-md p-0 flex flex-col'>
        <SheetHeader className='px-6 py-4 border-b'>
          <SheetTitle className='text-xl font-semibold text-foreground'>
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className='flex-1 px-6 py-4'>
          {cartItems.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>
              Tu carrito está vacío
            </p>
          ) : (
            <>
              <CartItemsList onRemove={removeFromCart} />
              
              <CouponInput
                onValidate={validateCoupon}
                onClear={clearCoupon}
              />
              
              <CartSummary
                subtotal={subTotal}
                onClearCart={clearCart}
                onCheckout={() => setShowCardClientName(true)}
                hasDiscount={discountCode === discountCode && descuento > 0}
              />
            </>
          )}
        </ScrollArea>

        {showCardClientName && (
          <FormToSend
            subTotal={subTotal}
            setShowCardClientName={setShowCardClientName}
            itemsProducts={itemsProducts}
            discountCode={discountCode}
            onClose={onClose}
            discountPercentage={descuento}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
