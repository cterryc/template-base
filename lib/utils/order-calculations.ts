// Constantes compartidas para cálculos de órdenes
export const FREE_DELIVERY_THRESHOLD = 150

// Interfaces
export interface OrderCalculationParams {
  subtotal: number
  deliveryCost?: number
  discountPercentage?: number
  locationToSend?: 'lima_metropolitana' | 'provincia'
  minimoDelivery?: number
  maximoDelivery?: number
}

export interface OrderCalculationResult {
  subtotal: number
  delivery: number
  discountAmount: number
  total: number
  displayDelivery: string | number
}

/**
 * Calcula todos los valores de una orden
 * Centraliza toda la lógica de cálculos de precios
 */
export function calculateOrderTotals(
  params: OrderCalculationParams
): OrderCalculationResult {
  const {
    subtotal,
    deliveryCost = 0,
    discountPercentage = 0,
    locationToSend = 'lima_metropolitana',
    minimoDelivery = 10,
    maximoDelivery = 15
  } = params

  // Asegurar que todos los valores sean números
  const subtotalNum = typeof subtotal === 'number' ? subtotal : parseFloat(subtotal) || 0
  const deliveryCostNum = typeof deliveryCost === 'number' ? deliveryCost : parseFloat(deliveryCost) || 0
  const discountPercentageNum = typeof discountPercentage === 'number' ? discountPercentage : parseFloat(discountPercentage) || 0
  const minimoDeliveryNum = typeof minimoDelivery === 'number' ? minimoDelivery : parseFloat(minimoDelivery) || 0
  const maximoDeliveryNum = typeof maximoDelivery === 'number' ? maximoDelivery : parseFloat(maximoDelivery) || 0

  // 1. Calcular delivery aplicable
  let finalDeliveryCost = 0
  
  if (locationToSend === 'provincia') {
    // Provincia: no se suma al total (se paga al recibir)
    finalDeliveryCost = 0
  } else if (subtotalNum >= FREE_DELIVERY_THRESHOLD) {
    // Envío gratis por compra >= 150
    finalDeliveryCost = 0
  } else {
    // Lima: aplicar límites de delivery
    finalDeliveryCost = deliveryCostNum
    if (deliveryCostNum > 0 && deliveryCostNum < minimoDeliveryNum) {
      finalDeliveryCost = minimoDeliveryNum
    }
    if (deliveryCostNum > maximoDeliveryNum) {
      finalDeliveryCost = maximoDeliveryNum
    }
  }

  // 2. Calcular monto de descuento (sobre subtotal)
  const discountAmount = discountPercentageNum
    ? Math.ceil((subtotalNum * discountPercentageNum * 10) / 100) / 10
    : 0

  // 3. Calcular total
  // Fórmula: subtotal - descuento + delivery
  const total = subtotalNum - discountAmount + finalDeliveryCost

  // 4. Valor para mostrar (UI)
  let displayDelivery: string | number
  if (locationToSend === 'provincia') {
    displayDelivery = 'Recargo según agencia (S/ 10.00 - S/ 15.00)'
  } else if (subtotalNum >= FREE_DELIVERY_THRESHOLD) {
    displayDelivery = 0
  } else {
    displayDelivery = finalDeliveryCost
  }

  return {
    subtotal: Number(subtotalNum.toFixed(2)),
    delivery: Number(finalDeliveryCost.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    displayDelivery
  }
}

/**
 * Función simplificada para solo el total (compatibilidad)
 */
export function calculateTotalWithDiscount(
  subtotal: number,
  deliveryCost?: number,
  discountPercentage?: number
): string {
  const { total } = calculateOrderTotals({ subtotal, deliveryCost, discountPercentage })
  return total.toFixed(2)
}

// Interfaces para WhatsApp
interface WhatsAppItem {
  name: string
  quantity: number
  price: number | string
  size?: string | null
}

interface WhatsAppParams {
  clientName: string
  locationToSend: string
  address: string
  dni?: string | null
  clientPhone?: string | null
  agencia?: string | null
  items: WhatsAppItem[]
  subtotal: number
  deliveryDisplay: string | number
  discountPercentage?: number | string
  discountCode?: string
  codigoCupon?: string
  total: number
  getlocation?: { lat: number; lng: number } | null
}

/**
 * Genera mensaje de WhatsApp con todos los detalles
 */
export function generateWhatsAppOrderMessage(params: WhatsAppParams): string {
  const {
    clientName,
    locationToSend,
    address,
    dni,
    clientPhone,
    agencia,
    items,
    subtotal,
    deliveryDisplay,
    discountPercentage = 0,
    discountCode = '',
    codigoCupon = '',
    total,
    getlocation
  } = params

  const clientInfo = `🙍🏻Cliente: ${clientName}.
${
  locationToSend === 'provincia'
    ? `🪪DNI: ${dni}.
📞Teléfono: ${clientPhone}.
📍Departamento/Provincia: ${address}.
🚌Agencia: ${agencia}.`
    : `📍Dirección: ${address}.`
}`

  const productList = items
    .map((item) => {
      const sizeInfo = item.size ? `\n↕️Talla: ${item.size}.` : ''
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price)
      return `📌Producto: ${item.name}.
#️⃣Cantidad: ${item.quantity}.${sizeInfo}
💲Precio: S/ ${price.toFixed(2)}.
\n`
    })
    .join('')

  const shippingType = locationToSend === 'provincia' ? '🏍️' : '🚚'
  const deliveryLabel =
    locationToSend === 'provincia' ? 'Recargo de agencia' : 'Delivery'

  const discountInfo =
    discountCode === codigoCupon
      ? `🏷️Descuento: ${typeof discountPercentage === 'number' ? discountPercentage : parseFloat(discountPercentage) || 0}%
💰Subtotal: S/ ${subtotal.toFixed(2)}.`
      : `💰Subtotal: S/ ${subtotal.toFixed(2)}`

  const totalInfo = `✅TOTAL: S/ ${total.toFixed(2)}`

  const locationLink =
    getlocation && getlocation.lat && locationToSend === 'lima_metropolitana'
      ? `\n📍Ubicación: http://maps.google.com/?q=${getlocation.lat},${getlocation.lng}&z=17&hl=es`
      : ''

  return `${clientInfo}
${productList}
${shippingType}${deliveryLabel}: ${typeof deliveryDisplay === 'number' ? `S/ ${deliveryDisplay.toFixed(2)}` : deliveryDisplay}
${discountInfo}
${totalInfo}${locationLink}
`
}
