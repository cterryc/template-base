import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Esquema de validación para producto
const createProductSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    category: z.string().min(1, 'La categoría es requerida'),
    estado: z.string().default('Disponible'),
    size: z.string().optional(),
    price: z.number().positive('El precio debe ser mayor a 0'),
    image: z.string().url('La imagen debe ser una URL válida'),
    image2: z
      .string()
      .url('La segunda imagen debe ser una URL válida')
      .optional()
      .nullable(),
    image3: z
      .string()
      .url('La tercera imagen debe ser una URL válida')
      .optional()
      .nullable(),
    image4: z
      .string()
      .url('La cuarta imagen debe ser una URL válida')
      .optional()
      .nullable(),
    stock: z.number().int().min(0, 'El stock no puede ser negativo').default(1),
    destacado: z.boolean().default(false),
    newCategory: z.string().optional()
  })
  .strip()

// POST - Crear producto (Solo Admin/Editor)
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar rol de admin o editor
    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Rol no autorizado. Se requiere ADMIN o EDITOR' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createProductSchema.parse(body)

    const findCategory = await prisma.categories.findFirst({
      where: { name: validatedData.category }
    })

    if (!findCategory) {
      await prisma.categories.create({
        data: { name: validatedData.category.toUpperCase() }
      })
    }

    // Crear producto
    const product = await prisma.productos.create({
      data: {
        name: validatedData.name,
        category: validatedData.category,
        estado: validatedData.estado,
        size: validatedData.size,
        price: validatedData.price,
        image: validatedData.image,
        image2: validatedData.image2,
        image3: validatedData.image3,
        image4: validatedData.image4,
        stock: validatedData.stock
      }
    })

    // Si el producto debe ser destacado, crear relación
    if (validatedData.destacado) {
      await prisma.productosDestacados.create({
        data: {
          productoId: product.id
        }
      })
    }

    // Invalidar caché de productos
    revalidatePath('/api/products')
    revalidatePath('/collection')

    return NextResponse.json(
      {
        message: 'Producto creado exitosamente',
        data: product
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando producto:', error)
    return NextResponse.json(
      { message: 'Error interno al crear producto' },
      { status: 500 }
    )
  }
}
