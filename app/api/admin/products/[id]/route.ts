import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Verificar autenticación y rol
async function checkAuth() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return { authorized: false, error: 'No autorizado' }
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return { authorized: false, error: 'Rol no autorizado. Se requiere ADMIN o EDITOR' }
  }

  return { authorized: true }
}

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  estado: z.string().optional(),
  size: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  image: z.string().url().optional(),
  image2: z.string().url().optional().nullable(),
  image3: z.string().url().optional().nullable(),
  image4: z.string().url().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  destacado: z.boolean().optional(),
  newCategory: z.string().optional()
})

// PUT - Actualizar producto (Solo Admin/Editor)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAuth()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.productos.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = updateProductSchema.parse(body)

    const findCategory = await prisma.categories.findFirst({
      where: { name: validatedData.category }
    })

    if (!findCategory && validatedData.category) {
      await prisma.categories.create({
        data: { name: validatedData.category.toUpperCase() }
      })
    }

    const updatedProduct = await prisma.productos.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.size !== undefined && { size: validatedData.size }),
        ...(validatedData.price && { price: validatedData.price }),
        ...(validatedData.image && { image: validatedData.image }),
        ...(validatedData.image2 !== undefined && {
          image2: validatedData.image2
        }),
        ...(validatedData.image3 !== undefined && {
          image3: validatedData.image3
        }),
        ...(validatedData.image4 !== undefined && {
          image4: validatedData.image4
        }),
        ...(validatedData.stock !== undefined && {
          stock: validatedData.stock
        }),
        updatedAt: new Date()
      }
    })

    // Manejar producto destacado
    if (validatedData.destacado !== undefined) {
      const existingDestacado = await prisma.productosDestacados.findUnique({
        where: { productoId: id }
      })

      if (validatedData.destacado && !existingDestacado) {
        await prisma.productosDestacados.create({
          data: { productoId: id }
        })
      } else if (!validatedData.destacado && existingDestacado) {
        await prisma.productosDestacados.delete({
          where: { productoId: id }
        })
      }
    }

    // Invalidar caché de productos
    revalidatePath('/api/products')
    revalidatePath(`/collection/${id}`)

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando producto:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto (Solo Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAuth()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.productos.findUnique({
      where: { id },
      include: {
        orderItems: { take: 1 },
        destacados: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          message:
            'No se puede eliminar el producto porque tiene órdenes asociadas',
          suggestion: 'Puedes marcarlo como "No disponible" cambiando el estado'
        },
        { status: 400 }
      )
    }

    // Eliminar de destacados si existe
    if (existingProduct.destacados.length > 0) {
      await prisma.productosDestacados.delete({
        where: { productoId: id }
      })
    }

    await prisma.productos.delete({
      where: { id }
    })

    // Invalidar caché de productos
    revalidatePath('/api/products')
    revalidatePath(`/collection/${id}`)

    return NextResponse.json({
      message: 'Producto eliminado exitosamente',
      deletedId: id
    })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json(
      { message: 'Error interno al eliminar producto' },
      { status: 500 }
    )
  }
}
