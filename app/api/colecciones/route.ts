import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/app/generated/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Construir filtros
    const where: Prisma.ColeccionWhereInput = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    // Ordenamiento
    const orderBy: Prisma.ProductosOrderByWithRelationInput = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder as Prisma.SortOrder
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder as Prisma.SortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder as Prisma.SortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder as Prisma.SortOrder
    } else {
      orderBy.createdAt = 'desc' as Prisma.SortOrder
    }

    // Paginación
    const skip = (page - 1) * limit
    const take = limit

    // Obtener colecciones
    const [colecciones, total] = await Promise.all([
      prisma.coleccion.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.coleccion.count({ where })
    ])

    // Calcular estadísticas
    const stats = {
      totalColecciones: total,
      averagePrice:
        colecciones.length > 0
          ? colecciones.reduce((sum, c) => sum + c.price, 0) /
            colecciones.length
          : 0,
      minPrice:
        colecciones.length > 0
          ? Math.min(...colecciones.map((c) => c.price))
          : 0,
      maxPrice:
        colecciones.length > 0
          ? Math.max(...colecciones.map((c) => c.price))
          : 0
    }

    return NextResponse.json({
      message: 'Colecciones obtenidas exitosamente',
      data: {
        colecciones: colecciones.map((c) => ({
          ...c,
          price: Number(c.price)
        })),
        stats
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error obteniendo colecciones:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener colecciones' },
      { status: 500 }
    )
  }
}
