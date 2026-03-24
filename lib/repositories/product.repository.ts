import prisma from '@/lib/prisma'
import type { Productos, Prisma } from '@/app/generated/prisma/client'

/**
 * Product Repository
 * Abstracción de acceso a datos para Productos
 * Sigue el patrón Repository de Domain-Driven Design
 */

export interface FindProductsParams {
  page?: number
  pageSize?: number
  filter?: string
  sort?: 'name' | 'price-asc' | 'price-desc' | 'created-asc' | 'created-desc'
}

export interface ProductRepository {
  findById(id: number): Promise<Productos & { destacados: Prisma.ProductosDestacadosGetPayload<{}>[]; orderItems: Prisma.OrderItemGetPayload<{}>[] } | null>
  findAll(params: FindProductsParams): Promise<{
    products: (Productos & { destacados: Prisma.ProductosDestacadosGetPayload<{}>[] })[]
    totalCount: number
  }>
  create(data: Prisma.ProductosCreateInput): Promise<Productos>
  update(id: number, data: Prisma.ProductosUpdateInput): Promise<Productos>
  delete(id: number): Promise<void>
  findFeatured(): Promise<Productos[]>
  count(): Promise<number>
}

export class PrismaProductRepository implements ProductRepository {
  async findById(id: number): Promise<Productos & { destacados: Prisma.ProductosDestacadosGetPayload<{}>[]; orderItems: Prisma.OrderItemGetPayload<{}>[] } | null> {
    return prisma.productos.findUnique({
      where: { id },
      include: {
        destacados: true,
        orderItems: true
      }
    })
  }

  async findAll(params: FindProductsParams): Promise<{
    products: (Productos & { destacados: Prisma.ProductosDestacadosGetPayload<{}>[] })[]
    totalCount: number
  }> {
    const {
      page = 1,
      pageSize = 16,
      filter = '',
      sort = 'name'
    } = params

    // Ordenamiento
    const orderBy: Prisma.ProductosOrderByWithRelationInput =
      sort === 'price-asc'
        ? { price: 'asc' }
        : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'created-asc'
        ? { createdAt: 'asc' }
        : sort === 'created-desc'
        ? { createdAt: 'desc' }
        : { name: 'asc' }

    // Filtro WHERE
    const whereConditions: Prisma.ProductosWhereInput = filter
      ? {
          OR: [
            { name: { contains: filter, mode: 'insensitive' } },
            { category: { contains: filter, mode: 'insensitive' } }
          ]
        }
      : {}

    // Ejecutar consultas en paralelo
    const [products, totalCount] = await Promise.all([
      prisma.productos.findMany({
        where: whereConditions,
        include: {
          destacados: true
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.productos.count({ where: whereConditions })
    ])

    return { products, totalCount }
  }

  async create(data: Prisma.ProductosCreateInput): Promise<Productos> {
    return prisma.productos.create({
      data,
      include: {
        destacados: true
      }
    })
  }

  async update(
    id: number,
    data: Prisma.ProductosUpdateInput
  ): Promise<Productos> {
    return prisma.productos.update({
      where: { id },
      data,
      include: {
        destacados: true
      }
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.productos.delete({
      where: { id }
    })
  }

  async findFeatured(): Promise<Productos[]> {
    const destacados = await prisma.productosDestacados.findMany({
      include: {
        producto: true
      }
    })

    return destacados.map((d) => ({
      ...d.producto,
      destacado: true
    }))
  }

  async count(): Promise<number> {
    return prisma.productos.count()
  }
}

// Instancia singleton para usar en toda la app
export const productRepository = new PrismaProductRepository()
