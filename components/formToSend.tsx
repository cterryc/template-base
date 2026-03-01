'use client'

import Link from 'next/link'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import InteractiveMap from './Maps/Maps'
import { X } from 'lucide-react'
import './ShoppingCartPanel.css'
import { agencias } from '../data/agencias'
import { codigoCupon } from '../data/cupon'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/CartContext'
import { ToastAction } from './ui/toast'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { RiLoader4Line } from 'react-icons/ri'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DeliverySchema,
  type DeliveryFormData
} from '@/lib/schemas/delivery.schema'

// --- Constantes ---
const COUNTRY_CODE = '51'
const PHONE_NUMBER = '907679229'
const LOCAL_STORAGE_KEY = 'dataDeliverySend'
const FREE_DELIVERY_THRESHOLD = 150
const MIN_DNI_LENGTH = 8
const MIN_PHONE_LENGTH = 7
const MIN_ADDRESS_LENGTH = 3

// --- Interfaces ---
interface ProsItemsProduct {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

interface IProps {
  subTotal: string
  setShowCardClientName: (value: boolean) => void
  itemsProducts: ProsItemsProduct[]
  discountCode: string
  onClose: () => void
  discountPercentage: number
}

interface DeliveryData extends DeliveryFormData {
  deliveryCost: number
  agencia: string
  dni: string
  clientPhone: string
}

// --- Componente FormToSend ---
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

  const [hasFullNameOverride, setHasFullNameOverride] = useState(false)
  const [minimoDelivery, setMinimoDelivery] = useState(10)
  const [maximoDelivery, setMaximoDelivery] = useState(15)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [telefono, setTelefono] = useState(958284730)
  const [markedLocation, setMarkedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const subTotalNumber = useMemo(() => Number(subTotal), [subTotal])

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
    formState: { errors }
  } = form
  const watchedLocationToSend = watch('locationToSend')
  const watchedClientName = watch('clientName')
  const watchedDni = watch('dni')
  const watchedPhone = watch('clientPhone')
  const watchedAgencia = watch('agencia')
  const watchedAddress = watch('address')
  const watchedGetlocation = watch('getlocation')
  const watchedDeliveryCost = watch('deliveryCost')

  // --- Funciones de localStorage ---
  const loadLocalStorage = useCallback(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (data) {
        const parsedData = JSON.parse(data)
        // Cargar datos en el formulario
        if (parsedData.clientName) setValue('clientName', parsedData.clientName)
        if (parsedData.address) setValue('address', parsedData.address)
        if (parsedData.locationToSend)
          setValue('locationToSend', parsedData.locationToSend)
        if (parsedData.agencia) setValue('agencia', parsedData.agencia)
        if (parsedData.dni) setValue('dni', parsedData.dni)
        if (parsedData.clientPhone)
          setValue('clientPhone', parsedData.clientPhone)
        if (parsedData.getlocation) {
          setValue('getlocation', parsedData.getlocation)
          setMarkedLocation(parsedData.getlocation)
        }
        // deliveryCost se maneja por separado según el mapa
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }
  }, [setValue])

  const saveToLocalStorage = useCallback(() => {
    try {
      const data = {
        clientName: watchedClientName,
        address: watchedAddress,
        locationToSend: watchedLocationToSend,
        agencia: watchedAgencia,
        dni: watchedDni,
        clientPhone: watchedPhone,
        getlocation: watchedGetlocation
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [
    watchedClientName,
    watchedAddress,
    watchedLocationToSend,
    watchedAgencia,
    watchedDni,
    watchedPhone,
    watchedGetlocation
  ])

  // --- Fetch Settings ---
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/config')
      if (!response.ok) throw new Error(`Error ${response.status}`)

      const data = await response.json()
      setMinimoDelivery(data?.data.settings.minimoDelivery || 10)
      setMaximoDelivery(data?.data.settings.maximoDelivery || 15)
      setTelefono(data?.data.settings.telefono)
    } catch (error) {
      console.error('Error cargando settings:', error)
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  // --- Guardar Orden en Backend ---
  const saveOrderToBackend = useCallback(async () => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      console.error('No email address available')
      return
    }

    setIsSavingOrder(true)
    try {
      const formDataValues = form.getValues()
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
        discount: discountPercentage,
        deliveryCost:
          subTotalNumber >= FREE_DELIVERY_THRESHOLD
            ? 0
            : formDataValues.deliveryCost
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Error saving order to backend')
      }
    } catch (error) {
      console.error('Error guardando orden:', error)
    } finally {
      setIsSavingOrder(false)
    }
  }, [
    form,
    user,
    itemsProducts,
    getCartTotal,
    discountPercentage,
    subTotalNumber
  ])

  // --- Cálculo del Total ---
  const calculateTotal = useMemo((): string => {
    // Validar que subTotalNumber sea un número válido
    if (isNaN(subTotalNumber)) {
      return '0.00'
    }

    // Envío gratis si el subtotal es >= 150
    if (subTotalNumber >= FREE_DELIVERY_THRESHOLD) {
      return subTotalNumber.toFixed(2)
    }

    // Para Provincia: el recargo no se suma al total (se paga al recibir)
    if (watchedLocationToSend === 'provincia') {
      return subTotalNumber.toFixed(2)
    }

    // Para Lima Metropolitana: aplicar costo de delivery
    const safeCost = Number(watchedDeliveryCost) || 0

    if (safeCost === 0) {
      return subTotalNumber.toFixed(2)
    }

    // Aplicar límites de delivery
    let finalDeliveryCost = safeCost
    if (safeCost > 0 && safeCost < minimoDelivery) {
      finalDeliveryCost = minimoDelivery
    }
    if (safeCost > maximoDelivery) {
      finalDeliveryCost = maximoDelivery
    }

    const total = Number(subTotalNumber) + Number(finalDeliveryCost)
    return total.toFixed(2)
  }, [
    subTotalNumber,
    watchedLocationToSend,
    watchedDeliveryCost,
    minimoDelivery,
    maximoDelivery
  ])

  // --- Cálculo del Delivery a Mostrar ---
  const deliveryDisplay = useMemo((): string | number => {
    if (watchedLocationToSend === 'provincia') {
      return 'Recargo según agencia (S/ 10.00 - S/ 15.00)'
    }

    if (subTotalNumber >= FREE_DELIVERY_THRESHOLD) {
      return 0
    }

    const safeCost = Number(watchedDeliveryCost) || 0

    if (safeCost === 0) {
      return 0
    }

    if (safeCost > 0 && safeCost < minimoDelivery) {
      return minimoDelivery
    }

    if (safeCost > maximoDelivery) {
      return maximoDelivery
    }

    return safeCost
  }, [
    subTotalNumber,
    watchedLocationToSend,
    watchedDeliveryCost,
    minimoDelivery,
    maximoDelivery
  ])

  // --- Validación del Formulario ---
  const formValidation = useMemo(() => {
    // Usar isValid de react-hook-form que ya valida con Zod
    const hasErrors = Object.keys(errors).length > 0

    // Validaciones adicionales no cubiertas por Zod
    if (itemsProducts.length === 0) {
      return { isValid: false, message: 'El carrito está vacío' }
    }

    // Para Lima Metropolitana con subtotal >= 150, no se requiere mapa
    if (
      watchedLocationToSend === 'lima_metropolitana' &&
      subTotalNumber >= FREE_DELIVERY_THRESHOLD
    ) {
      return {
        isValid: !hasErrors,
        message: hasErrors ? (Object.values(errors)[0]?.message as string) : ''
      }
    }

    // Para Lima Metropolitana con subtotal < 150, se requiere mapa marcado
    if (watchedLocationToSend === 'lima_metropolitana') {
      if (
        !markedLocation ||
        (markedLocation.lat === 0 && markedLocation.lng === 0)
      ) {
        return { isValid: false, message: 'Marca tu ubicación en el mapa' }
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
    subTotalNumber,
    markedLocation
  ])

  // --- Generación de contenido WhatsApp ---
  const generateWhatsAppContent = useCallback(() => {
    const formDataValues = form.getValues()
    const {
      clientName,
      locationToSend,
      address,
      dni,
      clientPhone,
      agencia,
      getlocation
    } = formDataValues

    const clientInfo = `🙍🏻Cliente: ${clientName}.
${
  locationToSend === 'provincia'
    ? `🪪DNI: ${dni}.
📞Teléfono: ${clientPhone}.
📍Departamento/Provincia: ${address}.
🚌Agencia: ${agencia}.`
    : `📍Dirección: ${address}.`
}`

    const productList = itemsProducts
      .map((item) => {
        const sizeInfo = item.size ? `\n↕️Talla: ${item.size}.` : ''
        return `📌Producto: ${item.name}.
#️⃣Cantidad: ${item.quantity}.${sizeInfo}
💲Precio: S/ ${Number(item.price).toFixed(2)}.
\n`
      })
      .join('')

    const shippingType = locationToSend === 'provincia' ? '🏍️' : '🚚'
    const deliveryLabel =
      locationToSend === 'provincia' ? 'Recargo de agencia' : 'Delivery'
    const deliveryPrice =
      typeof deliveryDisplay === 'number'
        ? `S/ ${deliveryDisplay.toFixed(2)}`
        : deliveryDisplay

    const discountInfo =
      discountCode === codigoCupon
        ? `🏷️Descuento: ${discountPercentage}%
💰Subtotal: S/ ${subTotal}.`
        : `💰Subtotal: S/ ${subTotal}`

    const totalInfo = `✅TOTAL: S/ ${calculateTotal}`

    const locationLink =
      getlocation.lat && locationToSend === 'lima_metropolitana'
        ? `\n📍Ubicación: http://maps.google.com/?q=${getlocation.lat},${getlocation.lng}&z=17&hl=es`
        : ''

    return `${clientInfo}
${productList}
${shippingType}${deliveryLabel}: ${deliveryPrice}
${discountInfo}
${totalInfo}${locationLink}
`
  }, [
    form,
    itemsProducts,
    discountCode,
    discountPercentage,
    subTotal,
    calculateTotal,
    deliveryDisplay
  ])

  // --- Manejadores ---
  // const handleInputChange = useCallback(
  //   <K extends keyof DeliveryFormData>(key: K, value: DeliveryFormData[K]) => {
  //     setValue(key, value)
  //     saveToLocalStorage()
  //   },
  //   [setValue, saveToLocalStorage]
  // )

  const selectDelivery = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLocation = event.target.value as
        | 'lima_metropolitana'
        | 'provincia'
      setValue('locationToSend', newLocation)
      // Resetear campos según el tipo de envío
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
      saveToLocalStorage()
    },
    [setValue, saveToLocalStorage]
  )

  const handleOrderSubmit = useCallback(
    async (e?: React.MouseEvent) => {
      // Prevenir ejecución duplicada
      if (e) {
        e.stopPropagation()
      }

      // Guardar orden en backend
      await saveOrderToBackend()

      // Cerrar modal y limpiar carrito
      setShowCardClientName(false)
      onClose()
      clearCart()

      // Mostrar toast
      const { dismiss } = toast({
        title: 'Pedido enviado con éxito',
        description: 'Revisa tu pedido aquí',
        action: (
          <ToastAction
            altText='Ver detalles'
            onClick={() => {
              dismiss()
              router.push('/orders')
            }}
          >
            Ver detalles
          </ToastAction>
        ),
        duration: 10000
      })
    },
    [saveOrderToBackend, onClose, clearCart, toast, router]
  )

  // --- Effects ---
  useEffect(() => {
    loadLocalStorage()
    fetchSettings()
  }, [loadLocalStorage, fetchSettings])

  useEffect(() => {
    const userName = user?.fullName
    if (userName && !hasFullNameOverride && !watchedClientName) {
      setValue('clientName', userName)
    }
  }, [user, hasFullNameOverride, watchedClientName, setValue])

  // --- Render helpers ---
  const whatsappHref = `https://wa.me/+${COUNTRY_CODE}${telefono}?text=${encodeURIComponent(
    generateWhatsAppContent()
  )}`

  const { register } = form
  const isUserSignedIn = !!user?.id
  const buttonBackgroundColor = formValidation.isValid ? '#00d95f' : 'gray'
  const buttonPointerEvents =
    !loadingSettings && !isSavingOrder && formValidation.isValid
      ? 'auto'
      : 'none'

  console.log('esto es telefono', telefono)

  return (
    <main
      className='cardFormCaontainer'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setShowCardClientName(false)
        }
      }}
    >
      <form
        className='formContainer'
        onClick={(e) => e.stopPropagation()}
        // onMouseUp={(e) => e.stopPropagation()}
      >
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
              onChange: (e) => {
                if (!hasFullNameOverride) {
                  setHasFullNameOverride(true)
                }
              }
            })}
          />
          {errors.clientName && (
            <span className='text-orange-600 text-sm'>
              {errors.clientName.message}
            </span>
          )}
        </div>

        {/* Selección de Tipo de Envío */}
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

        {/* Formulario Dinámico según Tipo de Envío */}
        {watchedLocationToSend === 'lima_metropolitana' && (
          <>
            <div className='w-full h-full pb-4'>
              <label className='labelClientName'>Marca tu ubicación 📍*</label>
              {loadingSettings ? (
                <div className='flex items-center justify-center h-64 border rounded-md'>
                  <RiLoader4Line className='animate-spin h-8 w-8 text-green-500' />
                </div>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  // onMouseDown={(e) => e.stopPropagation()}
                  // onMouseUp={(e) => e.stopPropagation()}
                  className='h-full'
                >
                  <InteractiveMap
                    setDeliveryCost={(cost: number) => {
                      const adjustedCost =
                        cost > maximoDelivery
                          ? maximoDelivery
                          : cost < minimoDelivery
                            ? minimoDelivery
                            : cost
                      setValue('deliveryCost', adjustedCost)
                      saveToLocalStorage()
                    }}
                    setGetlocation={(loc: { lat: number; lng: number }) => {
                      setValue('getlocation', loc)
                      setMarkedLocation(loc)
                      saveToLocalStorage()
                    }}
                    locationToSend={watchedGetlocation}
                  />
                </div>
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
                onChange={(event) => {
                  setValue('agencia', event.target.value)
                  saveToLocalStorage()
                }}
                className={`rounded-md border focus:border-green-500 outline-none mt-1 ${
                  !watchedAgencia ? 'text-gray-400' : 'text-zinc-900'
                } h-11 p-2 ${
                  !watchedAgencia ? 'border-orange-400' : 'bg-white'
                }`}
              >
                <option value='' disabled>
                  Seleccionar agencia
                </option>
                {agencias.map((eleAgencia) => (
                  <option
                    key={eleAgencia}
                    value={eleAgencia}
                    className='text-black'
                  >
                    {eleAgencia}
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
          className={`border ${
            !formValidation.isValid ? 'border-orange-600' : 'border-green-500'
          } px-2 py-1 rounded-sm`}
        >
          <div
            className={
              subTotalNumber >= FREE_DELIVERY_THRESHOLD
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
                  {typeof deliveryDisplay === 'number'
                    ? deliveryDisplay.toFixed(2)
                    : deliveryDisplay}
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
            <span>S/ {calculateTotal}</span>
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
          }}
          title={
            formValidation.isValid ? 'Realizar pedido' : formValidation.message
          }
          type='button'
        >
          {isUserSignedIn ? (
            loadingSettings || isSavingOrder ? (
              <span
                className='linkWhatsapp'
                style={{ backgroundColor: buttonBackgroundColor }}
              >
                <RiLoader4Line className='animate-spin h-full max-w-9 w-full' />
              </span>
            ) : (
              <Link
                href={whatsappHref}
                style={{ backgroundColor: buttonBackgroundColor }}
                className='linkWhatsapp'
                onClick={handleOrderSubmit}
                target='_blank'
              >
                Realizar pedido{' '}
                <img
                  src='/BlackWhatsApp.svg'
                  alt='whatsapp icon'
                  className='h-8 [filter:brightness(0)_invert(1)]'
                />
              </Link>
            )
          ) : (
            <Link
              href={'/sign-in'}
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
