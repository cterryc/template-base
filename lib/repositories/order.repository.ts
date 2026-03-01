import prisma from '@/lib/prisma'
import type { Orders, Prisma } from '@/app/generated/prisma/client'

/**
 * Order Repository
 * Abstracción de acceso a datos para Órdenes
 * Sigue el patrón Repository de Domain-Driven Design
 */

export interface FindOrdersParams {
  page?: number
  limit?: number
  status?: string
  userId?: number
  startDate?: Date
  endDate?: Date
}

export interface OrderRepository {
  findById(id: number): Promise<Orders | null>
  findAll(params: FindOrdersParams): Promise<{
    orders: Orders[]
    total: number
  }>
  findByUser(userId: number): Promise<Orders[]>
  create(
    data: Prisma.OrdersCreateWithoutUserInput & { userId: number }
  ): Promise<Orders>
  updateStatus(id: number, status: string): Promise<Orders>
  getStats(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }>
}

export class PrismaOrderRepository implements OrderRepository {
  async findById(id: number): Promise<Orders | null> {
    return prisma.orders.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })
  }

  async findAll(params: FindOrdersParams): Promise<{
    orders: Orders[]
    total: number
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      startDate,
      endDate
    } = params

    const where: Prisma.OrdersWhereInput = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          orderItems: {
            include: {
              producto: true
            }
          }
        }
      }),
      prisma.orders.count({ where })
    ])

    return { orders, total }
  }

  async findByUser(userId: number): Promise<Orders[]> {
    return prisma.orders.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })
  }

  async create(
    data: Prisma.OrdersCreateWithoutUserInput & { userId: number }
  ): Promise<Orders> {
    const { userId, ...orderData } = data

    return prisma.orders.create({
      data: {
        ...orderData,
        user: {
          connect: { id: userId }
        }
      },
      include: {
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })
  }

  async updateStatus(id: number, status: string): Promise<Orders> {
    return prisma.orders.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })
  }

  async getStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }> {
    const where: Prisma.OrdersWhereInput = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [totalOrders, totalRevenue, pendingOrders, completedOrders] =
      await Promise.all([
        prisma.orders.count({ where }),
        prisma.orders.aggregate({
          where,
          _sum: { totalPrice: true }
        }),
        prisma.orders.count({
          where: { ...where, status: 'Pendiente' }
        }),
        prisma.orders.count({
          where: {
            ...where,
            status: { in: ['Completado', 'Entregado', 'Pagado'] }
          }
        })
      ])

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      pendingOrders,
      completedOrders
    }
  }
}

// Instancia singleton para usar en toda la app
export const orderRepository = new PrismaOrderRepository()
