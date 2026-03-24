'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DeliverySchema,
  type DeliveryFormData
} from '@/lib/schemas/delivery.schema'
import {
  calculateOrderTotals,
  generateWhatsAppOrderMessage,
  FREE_DELIVERY_THRESHOLD
} from '@/lib/utils/order-calculations'
import { saveDeliveryData, loadDeliveryData } from '@/lib/utils/local-storage'
import { useConfigData } from '@/hooks/useConfigData'
import { useCouponValidator } from '@/hooks/useCouponValidator'
import type { CartItem } from '@/types/products'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '../ui/toast'
import InteractiveMap from '../maps/Maps'
import { RiLoader4Line } from 'react-icons/ri'
import { X } from 'lucide-react'
import { agencias } from '../../data/agencias'
import { codigoCupon } from '../../data/cupon'
import Link from 'next/link'

// --- Constantes ---
const COUNTRY_CODE = '51'

interface IProps {
  subTotal: string
  setShowCardClientName: (value: boolean) => void
  itemsProducts: CartItem[]
  discountCode: string
  onClose: () => void
  discountPercentage: number
}

// --- Componente Principal ---
const FormToSend = ({
  subTotal,
  setShowCardClientName,
  itemsProducts,
  discountCode,
  onClose,
  discountPercentage
}: IProps) => {
  const { clearCart, getCartTotal } = useCart()
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const { getMinimoDelivery, getMaximoDelivery, getTelefono, isLoading } =
    useConfigData()
  const {
    couponCode,
    discount: cuponDiscount
  } = useCouponValidator()

  const [hasFullNameOverride, setHasFullNameOverride] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [markedLocation, setMarkedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const minimoDelivery = getMinimoDelivery()
  const maximoDelivery = getMaximoDelivery()
  const telefono = getTelefono()

  // React Hook Form setup
  const form: UseFormReturn<DeliveryFormData> = useForm<DeliveryFormData>({
    resolver: zodResolver(DeliverySchema),
    defaultValues: {
      clientName: '',
      address: '',
      locationToSend: 'lima_metropolitana',
      deliveryCost: 0,
      agencia: '',
      dni: '',
      clientPhone: '',
      getlocation: { lat: 0, lng: 0 },
      email: ''
    }
  })

  const {
    watch,
    setValue,
    formState: { errors },
    register,
    getValues
  } = form

  const watchedLocationToSend = watch('locationToSend')
  const watchedClientName = watch('clientName')
  const watchedAddress = watch('address')
  const watchedAgencia = watch('agencia')
  const watchedDni = watch('dni')
  const watchedPhone = watch('clientPhone')
  const watchedGetlocation = watch('getlocation')
  const watchedDeliveryCost = watch('deliveryCost')

  // --- Cargar datos guardados ---
  useEffect(() => {
    const savedData = loadDeliveryData()
    if (savedData) {
      if (savedData.clientName) setValue('clientName', savedData.clientName)
      if (savedData.address) setValue('address', savedData.address)
      if (savedData.locationToSend)
        setValue('locationToSend', savedData.locationToSend)
      if (savedData.agencia) setValue('agencia', savedData.agencia)
      if (savedData.dni) setValue('dni', savedData.dni)
      if (savedData.clientPhone) setValue('clientPhone', savedData.clientPhone)
      if (savedData.getlocation) {
        setValue('getlocation', savedData.getlocation)
        setMarkedLocation(savedData.getlocation)
      }
    }
  }, [setValue])

  // --- Guardar datos automáticamente ---
  useEffect(() => {
    const subscription = watch((value) => {
      saveDeliveryData({
        clientName: value.clientName,
        address: value.address,
        locationToSend: value.locationToSend,
        agencia: value.agencia,
        dni: value.dni,
        clientPhone: value.clientPhone,
        getlocation:
          value.getlocation?.lat && value.getlocation?.lng
            ? { lat: value.getlocation.lat, lng: value.getlocation.lng }
            : undefined
      })
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // --- Auto-completar nombre con datos de Clerk ---
  useEffect(() => {
    const userName = user?.fullName
    if (userName && !hasFullNameOverride && !watchedClientName) {
      setValue('clientName', userName)
    }
  }, [user, hasFullNameOverride, watchedClientName, setValue])

  // --- Cálculos ---
  const calculations = useMemo(() => {
    return calculateOrderTotals({
      subtotal: getCartTotal(),
      deliveryCost: watchedDeliveryCost,
      discountPercentage:
        cuponDiscount > 0 ? cuponDiscount : discountPercentage,
      locationToSend: watchedLocationToSend,
      minimoDelivery,
      maximoDelivery
    })
  }, [
    watchedDeliveryCost,
    cuponDiscount,
    discountPercentage,
    watchedLocationToSend,
    minimoDelivery,
    maximoDelivery,
    getCartTotal
  ])

  const { total, displayDelivery, subtotal: subtotalCalculado } = calculations

  // --- Validación ---
  const formValidation = useMemo(() => {
    const hasErrors = Object.keys(errors).length > 0

    if (itemsProducts.length === 0) {
      return { isValid: false, message: 'El carrito está vacío' }
    }

    if (watchedLocationToSend === 'lima_metropolitana') {
      if (!watchedClientName || watchedClientName.trim() === '') {
        return { isValid: false, message: 'Ingresa tu nombre' }
      }
      if (!watchedAddress || watchedAddress.trim() === '') {
        return { isValid: false, message: 'Ingresa tu dirección' }
      }
      if (
        !markedLocation ||
        (markedLocation.lat === 0 && markedLocation.lng === 0)
      ) {
        return { isValid: false, message: 'Marca tu ubicación en el mapa' }
      }
    } else if (watchedLocationToSend === 'provincia') {
      if (!watchedClientName || watchedClientName.trim() === '') {
        return { isValid: false, message: 'Ingresa tu nombre' }
      }
      if (!watchedAddress || watchedAddress.trim() === '') {
        return { isValid: false, message: 'Ingresa departamento/provincia' }
      }
      if (!watchedAgencia || watchedAgencia.trim() === '') {
        return { isValid: false, message: 'Selecciona una agencia' }
      }
      if (!watchedDni || watchedDni.length < 8) {
        return { isValid: false, message: 'Ingresa un DNI válido (8 dígitos)' }
      }
      if (!watchedPhone || watchedPhone.length < 7) {
        return { isValid: false, message: 'Ingresa un teléfono válido' }
      }
    }

    return {
      isValid: !hasErrors,
      message: hasErrors ? (Object.values(errors)[0]?.message as string) : ''
    }
  }, [
    errors,
    itemsProducts.length,
    watchedLocationToSend,
    watchedClientName,
    watchedAddress,
    watchedAgencia,
    watchedDni,
    watchedPhone,
    markedLocation
  ])

  // --- Guardar orden ---
  const saveOrderToBackend = useCallback(async () => {
    if (!user?.emailAddresses[0]?.emailAddress) return

    setIsSavingOrder(true)
    try {
      const formDataValues = getValues()
      const orderData = {
        ...formDataValues,
        email: user.emailAddresses[0].emailAddress,
        products: itemsProducts.map((item) => ({
          productoId: item.id,
          quantity: item.quantity,
          totalPrice: Number(item.price) * item.quantity,
          unitPrice: item.price
        })),
        totalPrice: Number(getCartTotal()),
        totalProducts: itemsProducts.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        discount: cuponDiscount > 0 ? cuponDiscount : discountPercentage,
        deliveryCost:
          getCartTotal() >= FREE_DELIVERY_THRESHOLD
            ? 0
            : formDataValues.deliveryCost
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Error saving order')
    } catch (error) {
      console.error('Error guardando orden:', error)
    } finally {
      setIsSavingOrder(false)
    }
  }, [
    getValues,
    user,
    itemsProducts,
    getCartTotal,
    cuponDiscount,
    discountPercentage
  ])

  // --- Generar mensaje WhatsApp ---
  const generateWhatsAppContent = useCallback(() => {
    const formDataValues = getValues()
    return generateWhatsAppOrderMessage({
      ...formDataValues,
      items: itemsProducts,
      subtotal: subtotalCalculado,
      deliveryDisplay: displayDelivery,
      discountPercentage:
        cuponDiscount > 0 ? cuponDiscount : discountPercentage,
      discountCode: couponCode || discountCode,
      codigoCupon,
      total,
      getlocation: formDataValues.getlocation
    })
  }, [
    getValues,
    itemsProducts,
    subtotalCalculado,
    displayDelivery,
    cuponDiscount,
    discountPercentage,
    couponCode,
    discountCode,
    total
  ])

  // --- Manejadores ---
  const selectDelivery = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLocation = event.target.value as
        | 'lima_metropolitana'
        | 'provincia'
      setValue('locationToSend', newLocation)

      if (newLocation === 'provincia') {
        setValue('address', '')
        setValue('deliveryCost', 0)
        setValue('getlocation', { lat: 0, lng: 0 })
        setMarkedLocation(null)
      } else {
        setValue('agencia', '')
        setValue('dni', '')
        setValue('clientPhone', '')
      }
    },
    [setValue]
  )

  const handleOrderSubmit = useCallback(async () => {
    await saveOrderToBackend()
    setShowCardClientName(false)
    onClose()
    clearCart()

    toast({
      title: 'Pedido enviado con éxito',
      description: 'Revisa tu pedido aquí',
      action: (
        <ToastAction
          altText='Ver detalles'
          onClick={() => router.push('/orders')}
        >
          Ver detalles
        </ToastAction>
      ),
      duration: 10000
    })
  }, [
    saveOrderToBackend,
    onClose,
    clearCart,
    toast,
    router,
    setShowCardClientName
  ])

  const whatsappHref = `https://wa.me/+${COUNTRY_CODE}${telefono}?text=${encodeURIComponent(generateWhatsAppContent())}`
  const isUserSignedIn = !!user?.id
  const buttonBackgroundColor = formValidation.isValid ? '#00d95f' : 'gray'
  const buttonPointerEvents =
    !isLoading && !isSavingOrder && formValidation.isValid ? 'auto' : 'none'

  return (
    <main
      className='cardFormCaontainer'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setShowCardClientName(false)
        }
      }}
    >
      <form className='formContainer' onClick={(e) => e.stopPropagation()}>
        {/* Nombre del Cliente */}
        <div>
          <label htmlFor='inputName' className='labelClientName'>
            Nombre*
          </label>
          <input
            className='inputinputClientName'
            id='inputName'
            placeholder='Ingrese su nombre y apellido'
            {...register('clientName', {
              onChange: () => setHasFullNameOverride(true)
            })}
          />
          {errors.clientName && (
            <span className='text-orange-600 text-sm'>
              {errors.clientName.message}
            </span>
          )}
        </div>

        {/* Tipo de Envío */}
        <div className='flex flex-col gap-2 justify-center text-sm'>
          <label className='labelClientName'>
            ¿Dónde deseas recibir tu pedido?*
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='delivery'
              value='lima_metropolitana'
              checked={watchedLocationToSend === 'lima_metropolitana'}
              onChange={selectDelivery}
              className='mr-1'
            />{' '}
            Lima Metropolitana (delivery motorizado)
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='delivery'
              value='provincia'
              checked={watchedLocationToSend === 'provincia'}
              onChange={selectDelivery}
              className='mr-1'
            />{' '}
            Fuera de Lima (envío por agencia)
          </label>
        </div>

        {/* Formulario según tipo de envío */}
        {watchedLocationToSend === 'lima_metropolitana' && (
          <>
            <div className='w-full h-full pb-4'>
              <label className='labelClientName'>Marca tu ubicación 📍*</label>
              {isLoading ? (
                <div className='flex items-center justify-center h-64 border rounded-md'>
                  <RiLoader4Line className='animate-spin h-8 w-8 text-green-500' />
                </div>
              ) : (
                <InteractiveMap
                  setDeliveryCost={(cost: number) => {
                    const adjustedCost =
                      cost > maximoDelivery
                        ? maximoDelivery
                        : cost < minimoDelivery
                          ? minimoDelivery
                          : cost
                    setValue('deliveryCost', adjustedCost)
                  }}
                  setGetlocation={(loc: { lat: number; lng: number }) => {
                    setValue('getlocation', loc)
                    setMarkedLocation(loc)
                  }}
                  locationToSend={watchedGetlocation}
                />
              )}
              {errors.getlocation && (
                <span className='text-orange-600 text-sm'>
                  {errors.getlocation.message}
                </span>
              )}
            </div>
            <div>
              <label htmlFor='inputAddress' className='labelClientName'>
                Dirección exacta*
              </label>
              <input
                className='inputinputClientName'
                id='inputAddress'
                placeholder='Calle / N° de Casa / N° de Departamento'
                {...register('address')}
              />
              {errors.address && (
                <span className='text-orange-600 text-sm'>
                  {errors.address.message}
                </span>
              )}
            </div>
          </>
        )}

        {watchedLocationToSend === 'provincia' && (
          <>
            <div className='flex flex-col'>
              <label className='labelClientName'>Seleccionar Agencia*</label>
              <select
                name='agencia'
                id='agencia'
                value={watchedAgencia}
                onChange={(e) => setValue('agencia', e.target.value)}
                className={`rounded-md border focus:border-green-500 outline-none mt-1 ${
                  !watchedAgencia ? 'text-gray-400' : 'text-zinc-900'
                } h-11 p-2 ${!watchedAgencia ? 'border-orange-400' : 'bg-white'}`}
              >
                <option value='' disabled>
                  Seleccionar agencia
                </option>
                {agencias.map((agencia) => (
                  <option key={agencia} value={agencia} className='text-black'>
                    {agencia}
                  </option>
                ))}
              </select>
              {errors.agencia && (
                <span className='text-orange-600 text-sm'>
                  {errors.agencia.message}
                </span>
              )}

              <div>
                <label className='labelClientName'>DNI*</label>
                <input
                  className='inputinputClientName'
                  placeholder='Ingrese su DNI'
                  {...register('dni')}
                  maxLength={8}
                />
                {errors.dni && (
                  <span className='text-orange-600 text-sm'>
                    {errors.dni.message}
                  </span>
                )}
              </div>

              <div>
                <label className='labelClientName'>Teléfono*</label>
                <input
                  className='inputinputClientName'
                  placeholder='Ingrese su teléfono'
                  {...register('clientPhone')}
                />
                {errors.clientPhone && (
                  <span className='text-orange-600 text-sm'>
                    {errors.clientPhone.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor='inputDeptProv' className='labelClientName'>
                📍Departamento/Provincia*
              </label>
              <input
                className='inputinputClientName'
                id='inputDeptProv'
                placeholder='Escribe el Departamento y Provincia'
                {...register('address')}
              />
              {errors.address && (
                <span className='text-orange-600 text-sm'>
                  {errors.address.message}
                </span>
              )}
            </div>
          </>
        )}

        {/* Resumen de Costos */}
        <div
          className={`border ${!formValidation.isValid ? 'border-orange-600' : 'border-green-500'} px-2 py-1 rounded-sm`}
        >
          <div
            className={
              getCartTotal() >= FREE_DELIVERY_THRESHOLD
                ? 'text-green-500'
                : !formValidation.isValid
                  ? 'text-orange-500'
                  : 'text-green-500'
            }
          >
            {watchedLocationToSend === 'provincia' ? (
              <span>Recargo de agencia: (S/ 10.00 - S/ 15.00)</span>
            ) : (
              <>
                <span>Delivery: </span>
                <span>
                  S/{' '}
                  {typeof displayDelivery === 'number'
                    ? displayDelivery.toFixed(2)
                    : displayDelivery}
                </span>
              </>
            )}
          </div>
          <div>
            <span>Subtotal: </span>
            <span>S/ {subTotal}</span>
          </div>
          <div className='font-bold text-lg'>
            <span>Total: </span>
            <span>S/ {total}</span>
          </div>
        </div>

        {/* Mensaje de Validación */}
        {!formValidation.isValid && (
          <div className='text-orange-600 text-sm text-center'>
            {formValidation.message}
          </div>
        )}

        {/* Botón de Realizar Pedido */}
        <button
          style={{ pointerEvents: buttonPointerEvents }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          title={
            formValidation.isValid ? 'Realizar pedido' : formValidation.message
          }
          type='button'
        >
          {isUserSignedIn ? (
            isLoading || isSavingOrder ? (
              <span
                className='linkWhatsapp'
                style={{ backgroundColor: buttonBackgroundColor }}
              >
                <RiLoader4Line className='animate-spin h-full max-w-9 w-full' />
              </span>
            ) : (
              <a
                href={whatsappHref}
                style={{ backgroundColor: buttonBackgroundColor }}
                className='linkWhatsapp'
                onClick={(e) => {
                  e.stopPropagation()
                  handleOrderSubmit()
                }}
                target='_blank'
                rel='noopener noreferrer'
              >
                Realizar pedido{' '}
                <img
                  src='/BlackWhatsApp.svg'
                  alt='whatsapp icon'
                  className='h-8 [filter:brightness(0)_invert(1)]'
                />
              </a>
            )
          ) : (
            <Link
              href='/sign-in'
              className='linkWhatsapp'
              onClick={() => {
                setShowCardClientName(false)
                onClose()
              }}
            >
              👉 Inicia sesión para realizar tu pedido 👈
            </Link>
          )}
        </button>

        {/* Botón de Cerrar */}
        <button
          className='buttonCloseCardClientName'
          onClick={() => setShowCardClientName(false)}
          type='button'
        >
          <X color='gray' />
        </button>
      </form>
    </main>
  )
}

export default FormToSend
