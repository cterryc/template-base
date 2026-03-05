'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import './ShoppingCartPanel.css'
import { useEffect, useState } from 'react'
// import { codigoCupon, mostrarCupon } from '../data/cupon'
import { LuLoaderCircle } from 'react-icons/lu'
import { FaTrashAlt } from 'react-icons/fa'

import FormToSend from './formToSend'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ShoppingCartPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ProsItemsProduct {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

export default function ShoppingCartPanel({
  isOpen,
  onClose
}: ShoppingCartPanelProps) {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const [itemsProducts, setItemsProducts] = useState<ProsItemsProduct[]>([])
  const [showCardClientName, setShowCardClientName] = useState(false)
  const [discount, setDiscount] = useState('')
  // const [location, setLocation] = useState<LatLng | null>(null)
  const [cuponCode, setCuponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codigoCupon, setCodigoCupon] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [cuponError, setCuponError] = useState('')
  const [subTotal, setSubTotal] = useState('')

  const getDiscount = (discount?: string, descuento?: number) => {
    if (discount && descuento) {
      // convertimos el total a entero sin decimal multiplicando por 10
      // luego sacamos el 15 y por ulimo dividimos entre 10 y 100 = 1000
      const calculateDiscount = (
        (getCartTotal() * 10 * descuento) /
        1000
      ).toFixed(2)
      const roundToClientFavor = Math.ceil(Number(calculateDiscount) * 10)
      const subtotal = (
        (getCartTotal() * 10 - roundToClientFavor) /
        10
      ).toFixed(2)
      return setSubTotal(subtotal)
    }
    setSubTotal(getCartTotal().toFixed(2))
  }

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
    getDiscount()
    return () => {
      setCuponError('')
      setDescuento(0)
      setCodigoCupon('')
      setDiscount('')
      setLoading(false)
    }
  }, [cartItems])

  if (!isOpen) return null

  const validateCupon = async () => {
    if (cuponCode) {
      setLoading(true)
      const response = await fetch(`/api/cupones/codigo/${cuponCode}`)
      if (!response.ok) {
        setCuponError('Codigo de cupon invalido')
        setDescuento(0)
        setCodigoCupon('')
        setDiscount('')
        setLoading(false)
      }
      const data = await response.json()
      setDiscount(data.codigoCupon)
      setDescuento(data.descuento)
      getDiscount(data.codigoCupon, data.descuento)
      setLoading(false)
    }
  }

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
              <ul className='space-y-4 mb-6'>
                {cartItems.map((item) => (
                  <li key={item.id} className={'shoppingCartItem'}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='imageCartPanel'
                    />
                    <div className='containerItemTitleCartPanel'>
                      <span className='font-medium text-foreground'>
                        {item.name}
                      </span>
                      <span className='text-muted-foreground text-sm'>
                        {item.size}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className='text-muted-foreground hover:text-destructive transition-colors duration-200 p-0 rounded-full hover:bg-accent'
                      >
                        <FaTrashAlt className='text-red-500' size={16} />
                      </button>
                    </div>
                    <div className='containerItemPriceCuantitiCartPanel'>
                      <span className='text-muted-foreground'>
                        Cantidad: {item.quantity}
                      </span>
                      <span className='font-medium text-foreground'>
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='border-t border-border pt-4 mb-6'>
                <>
                  <div className='flex items-center gap-2 mb-1'>
                    <Input
                      type='text'
                      placeholder='Cupón de descuento...'
                      className='flex-1 uppercase'
                      value={cuponCode}
                      onChange={(event) => {
                        setCuponCode(event.target.value.toUpperCase())
                        if (cuponError) {
                          setCuponError('')
                        }
                      }}
                    />
                    <Button
                      onClick={() => validateCupon()}
                      disabled={loading}
                      className='min-w-24 bg-primary text-primary-foreground hover:bg-primary/90'
                    >
                      {loading ? (
                        <LuLoaderCircle className='animate-spin mr-2' />
                      ) : null}
                      {loading ? 'Validando' : 'Validar'}
                    </Button>
                  </div>
                  {cuponError.length > 0 && (
                    <span className='text-destructive text-sm flex w-full justify-end'>
                      Cupon invalido
                    </span>
                  )}
                  <div
                    className={`flex justify-between text-sm mt-2 font-medium ${
                      cuponError.length > 0
                        ? 'text-destructive'
                        : descuento > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <span>Descuento:</span>
                    <span>{descuento ? descuento : 0}%</span>
                  </div>
                </>

                <div className='flex justify-between items-center mb-4 mt-3'>
                  <span className='text-muted-foreground'>Subtotal:</span>
                  <span className='text-2xl font-bold text-foreground tracking-tight'>
                    S/ {subTotal}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-sm ${
                    discount === codigoCupon
                      ? 'text-destructive'
                      : 'text-emerald-700 dark:text-emerald-400'
                  } bg-emerald-500/10 rounded-md py-3 px-4 mb-2 border border-emerald-500/20`}
                >
                  <span className='font-medium'>
                    Delivery gratuito solo para compras mayores a S/.150.00
                  </span>
                </div>
              </div>
              <div className='space-y-3'>
                <Button
                  onClick={clearCart}
                  variant='outline'
                  className='w-full'
                >
                  Limpiar Carrito
                </Button>
                <Button
                  className='w-full'
                  size='lg'
                  onClick={() => setShowCardClientName(true)}
                >
                  Continuar
                </Button>
              </div>
            </>
          )}
        </ScrollArea>

        {showCardClientName && (
          <FormToSend
            subTotal={subTotal}
            setShowCardClientName={setShowCardClientName}
            itemsProducts={itemsProducts}
            discountCode={discount}
            onClose={onClose}
            discountPercentage={descuento}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
