import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { products } from './products' // 👈 tu archivo con productos iniciales
import { Prisma } from '@/app/generated/prisma/client'

// Nota: Con cacheComponents: true, el caché se maneja vía lib/cache/products.ts
// usando 'use cache' + cacheLife('hours'). Esta ruta es dinámica por defecto.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = 16
    const filter = searchParams.get('filter') || ''
    const sort = searchParams.get('sort') || ''

    // Definir ordenamiento
    const orderBy: Prisma.ProductosOrderByWithRelationInput =
      sort === 'price-asc'
        ? { price: 'asc' as Prisma.SortOrder }
        : sort === 'price-desc'
        ? { price: 'desc' as Prisma.SortOrder }
        : sort === 'created-asc'
        ? { createdAt: 'asc' as Prisma.SortOrder }
        : sort === 'created-desc'
        ? { createdAt: 'desc' as Prisma.SortOrder }
        : { name: 'asc' as Prisma.SortOrder }

    const existingCount = await prisma.productos.count()

    if (existingCount === 0) {
      await prisma.productos.createMany({
        data: products
      })

      const initialProducts = await prisma.productos.findMany({
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })

      // Calcular estadísticas para productos iniciales
      const initialProductsDetails = {
        totalInventoryAmount: products.reduce((sum, product) => {
          return sum + (Number(product.price) || 0) * (product.stock || 0)
        }, 0),
        notAvailable: products.filter((p) => p.estado === 'NO DISPONIBLE')
          .length,
        totalStock: products.reduce(
          (sum, product) =>
            sum +
            (product.estado.toUpperCase() === 'DISPONIBLE'
              ? product.stock || 0
              : 0),
          0
        ),
        totalProducts: products.length
      }

      return NextResponse.json(
        {
          message: 'Initial products created',
          data: initialProducts,
          pagination: {
            page,
            pageSize,
            totalPages: Math.ceil(products.length / pageSize),
            totalCount: products.length
          },
          productsDetails: initialProductsDetails
        },
        { status: 201 }
      )
    }

    // Definir condiciones WHERE comunes
    const whereConditions: Prisma.ProductosWhereInput = {
      OR: [
        { name: { contains: filter, mode: 'insensitive' as Prisma.QueryMode } },
        {
          category: {
            contains: filter,
            mode: 'insensitive' as Prisma.QueryMode
          }
        }
      ]
    }

    // Ejecutar consultas en paralelo
    const [
      filteredProducts,
      allProducts,
      totalCount,
      destacadosCount,
      categories
    ] = await Promise.all([
      // 1. Productos paginados con relaciones
      prisma.productos.findMany({
        where: whereConditions,
        include: {
          destacados: true
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      // 2. Todos los productos para estadísticas
      prisma.productos.findMany({
        where: whereConditions
      }),
      // 3. Contador para paginación
      prisma.productos.count({
        where: whereConditions
      }),
      // 4. Contar productos destacados
      prisma.productosDestacados.count(),
      // 5. Obtener categorías
      prisma.categories.findMany({
        orderBy: {
          name: 'asc'
        }
      })
    ])

    const transformedProducts = filteredProducts.map((product) => ({
      ...product,
      destacado: product.destacados.length > 0
    }))

    // Calcular las estadísticas
    const productsDetails = {
      totalInventoryAmount: allProducts.reduce((sum, product) => {
        if (product.estado === 'DISPONIBLE') {
          return sum + (Number(product.price) || 0) * (product.stock || 0)
        }
        return sum
      }, 0),
      notAvailable: allProducts.filter((p) => p.estado === 'NO DISPONIBLE')
        .length,
      totalStock: allProducts.reduce(
        (sum, product) =>
          sum + (product.estado === 'DISPONIBLE' ? product.stock || 0 : 0),
        0
      ),
      totalProducts: allProducts.length,
      destacados: destacadosCount,
      categories
    }

    return NextResponse.json(
      {
        message: 'Products retrieved successfully',
        data: transformedProducts,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount
        },
        productsDetails
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    )
  }
}
