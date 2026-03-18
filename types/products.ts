/**
 * Tipos compartidos para productos y carrito
 */

/**
 * Item del carrito de compras
 * Usado en CartContext, ShoppingCartPanel, y formToSend
 */
export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

/**
 * Item de producto para formularios de pedido
 * Extiende CartItem con información adicional de precio unitario y total
 */
export interface OrderItem extends CartItem {
  productoId: number
  unitPrice: number
  totalPrice: number
}

/**
 * Datos de entrega para checkout
 * Se alinea con DeliverySchema de lib/schemas/delivery.schema.ts
 */
export interface DeliveryFormData {
  clientName: string
  address: string
  locationToSend: string
  deliveryCost: number
  agencia: string
  dni: string
  clientPhone: string
  getlocation: {
    lat: number
    lng: number
  }
  email?: string
}

/**
 * Datos completos de orden (para enviar a API)
 */
export interface OrderData extends DeliveryFormData {
  items: OrderItem[]
  totalPrice: number
  totalProducts: number
  discount?: number
  discountCode?: string
}
