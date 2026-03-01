import { unstable_cache } from 'next/cache'
import prisma from '../prisma'
import type { Prisma } from '@/app/generated/prisma/client'

/**
 * Obtener productos con caché usando unstable_cache
 * Se invalida automáticamente cuando se llama revalidatePath('/api/products')
 */
export async function getProducts({
  page = 1,
  filter = '',
  sort = 'name'
}: {
  page?: number
  filter?: string
  sort?: string
}) {
  const cachedFn = unstable_cache(
    async () => {
      console.log('🔍 CONSULTANDO BASE DE DATOS - getProducts')

      const pageSize = 16
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

      const whereConditions = filter
        ? {
            OR: [
              { name: { contains: filter, mode: 'insensitive' as const } },
              { category: { contains: filter, mode: 'insensitive' as const } }
            ]
          }
        : {}

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

      const transformedProducts = products.map((product) => ({
        ...product,
        destacado: product.destacados.length > 0
      }))

      return {
        data: transformedProducts,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount
        }
      }
    },
    ['products', page.toString(), filter, sort],
    {
      tags: ['products']
      // revalidate: 3600 // 1 hora
    }
  )

  return cachedFn()
}

/**
 * Obtener categorías con caché
 */
export async function getCategories() {
  const cachedFn = unstable_cache(
    async () => {
      console.log('🔍 CONSULTANDO BASE DE DATOS - getCategories')
      return prisma.categories.findMany({
        orderBy: { name: 'asc' }
      })
    },
    ['categories'],
    {
      tags: ['categories']
    }
  )

  return cachedFn()
}

/**
 * Obtener producto destacado por ID con caché
 */
export async function getFeaturedProducts() {
  const cachedFn = unstable_cache(
    async () => {
      console.log('🔍 CONSULTANDO BASE DE DATOS - getFeaturedProducts')
      const destacados = await prisma.productosDestacados.findMany({
        include: {
          producto: true
        }
      })

      return destacados.map((d) => ({
        ...d.producto,
        destacado: true
      }))
    },
    ['featured-products'],
    {
      tags: ['featured-products']
    }
  )

  return cachedFn()
}

/**
 * Obtener estadísticas de productos con caché
 */
export async function getProductStats() {
  const cachedFn = unstable_cache(
    async () => {
      console.log('🔍 CONSULTANDO BASE DE DATOS - getProductStats')

      const [totalProducts, notAvailable, totalStock] = await Promise.all([
        prisma.productos.count(),
        prisma.productos.count({ where: { estado: 'NO DISPONIBLE' } }),
        prisma.productos.aggregate({
          where: { estado: 'DISPONIBLE' },
          _sum: { stock: true }
        })
      ])

      const allProducts = await prisma.productos.findMany({
        select: {
          price: true,
          estado: true,
          stock: true
        }
      })

      const totalInventoryAmount = allProducts.reduce((sum, product) => {
        if (product.estado === 'DISPONIBLE') {
          return sum + Number(product.price) * (product.stock || 0)
        }
        return sum
      }, 0)

      return {
        totalInventoryAmount,
        notAvailable,
        totalStock: totalStock._sum.stock || 0,
        totalProducts
      }
    },
    ['products-stats'],
    {
      tags: ['products-stats']
    }
  )

  return cachedFn()
}
