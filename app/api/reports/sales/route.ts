import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@/app/generated/prisma/client'

/**
 * Reporte de ventas - Endpoint en desarrollo
 * TODO: Implementar lógica de reporte de ventas con filtros por fecha
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Filtro de fecha básico
    const where: Prisma.OrdersWhereInput = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Obtener órdenes completadas
    const orders = await prisma.orders.findMany({
      where: {
        ...where,
        status: { in: ['Pagado', 'Enviado', 'Entregado'] }
      },
      include: {
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })

    // Calcular totales
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    )
    const totalOrders = orders.length
    const totalItems = orders.reduce(
      (sum, order) => sum + order.orderItems.reduce((s, i) => s + i.quantity, 0),
      0
    )

    return NextResponse.json({
      message: 'Reporte de ventas',
      data: {
        totalRevenue,
        totalOrders,
        totalItems,
        orders
      },
      filters: {
        startDate: startDate || 'Todo el tiempo',
        endDate: endDate || 'Todo el tiempo'
      }
    })
  } catch (error) {
    console.error('Error en reporte de ventas:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener reporte de ventas' },
      { status: 500 }
    )
  }
}
