import { orderRepository } from '@/lib/repositories/order.repository'
import { productService } from './product.service'

/**
 * Order Service
 * Lógica de negocio para Órdenes
 * Sigue el patrón de Clean Architecture - Use Case
 */

export interface CreateOrderDTO {
  userId: number
  address: string
  clientName: string
  clientPhone?: string
  deliveryCost: number
  dni?: string
  agencia?: string
  getlocation: {
    lat: number
    lng: number
  }
  locationToSend: string
  products: Array<{
    productoId: number
    quantity: number
    unitPrice: number
  }>
  discount?: number
}

export class OrderService {
  constructor(private repository = orderRepository) {}

  /**
   * Obtener orden por ID
   */
  async getById(id: number) {
    const order = await this.repository.findById(id)

    if (!order) {
      throw new Error('Orden no encontrada')
    }

    return order
  }

  /**
   * Obtener órdenes con paginación y filtros
   */
  async getAll(params: {
    page?: number
    limit?: number
    status?: string
    userId?: number
    startDate?: Date
    endDate?: Date
  }) {
    return this.repository.findAll(params)
  }

  /**
   * Obtener órdenes de un usuario
   */
  async getByUser(userId: number) {
    return this.repository.findByUser(userId)
  }

  /**
   * Crear orden
   */
  async create(data: CreateOrderDTO) {
    // Validar productos
    if (data.products.length === 0) {
      throw new Error('La orden debe tener al menos un producto')
    }

    // Validar stock de productos
    for (const product of data.products) {
      const productData = await productService.getById(product.productoId)
      
      if (productData.stock < product.quantity) {
        throw new Error(
          `Stock insuficiente para ${productData.name}`
        )
      }

      if (productData.estado === 'NO DISPONIBLE') {
        throw new Error(
          `${productData.name} no está disponible`
        )
      }
    }

    // Calcular total
    const totalPrice = data.products.reduce(
      (sum, p) => sum + p.unitPrice * p.quantity,
      0
    )

    const totalProducts = data.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    )

    // Aplicar descuento
    const finalTotal = data.discount
      ? totalPrice - (totalPrice * data.discount / 100)
      : totalPrice

    // Crear orden con items
    const order = await this.repository.create({
      userId: data.userId,
      address: data.address,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      deliveryCost: data.deliveryCost,
      dni: data.dni,
      agencia: data.agencia,
      getlocation: data.getlocation,
      locationToSend: data.locationToSend,
      totalPrice: finalTotal,
      totalProducts,
      discount: data.discount || 0,
      orderItems: {
        create: data.products.map((p) => ({
          productoId: p.productoId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.unitPrice * p.quantity
        }))
      }
    })

    // Actualizar stock de productos
    for (const product of data.products) {
      await productService.update(product.productoId, {
        stock: {
          decrement: product.quantity
        }
      })
    }

    return order
  }

  /**
   * Actualizar estado de orden
   */
  async updateStatus(id: number, status: string) {
    const validStatuses = [
      'Pendiente',
      'Confirmado',
      'En preparación',
      'Enviado',
      'Entregado',
      'Cancelado'
    ]

    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido')
    }

    return this.repository.updateStatus(id, status)
  }

  /**
   * Cancelar orden
   */
  async cancel(id: number) {
    const order = await this.repository.findById(id)

    if (!order) {
      throw new Error('Orden no encontrada')
    }

    if (order.status === 'Entregado') {
      throw new Error('No se puede cancelar una orden entregada')
    }

    // Revertir stock si estaba confirmado
    if (['Confirmado', 'En preparación', 'Enviado'].includes(order.status)) {
      for (const item of order.orderItems) {
        await productService.update(item.productoId, {
          stock: {
            increment: item.quantity
          }
        })
      }
    }

    return this.repository.updateStatus(id, 'Cancelado')
  }

  /**
   * Obtener estadísticas
   */
  async getStats(startDate?: Date, endDate?: Date) {
    return this.repository.getStats(startDate, endDate)
  }
}

// Instancia singleton
export const orderService = new OrderService()
