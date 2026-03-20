import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

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

// Esquema de validación
const updateColeccionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional()
})

// PUT - Actualizar colección (Solo Admin/Editor)
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
        { message: 'ID de colección inválido' },
        { status: 400 }
      )
    }

    // Verificar si la colección existe
    const existingColeccion = await prisma.coleccion.findUnique({
      where: { id }
    })

    if (!existingColeccion) {
      return NextResponse.json(
        { message: 'Colección no encontrada' },
        { status: 404 }
      )
    }

    // Obtener y validar datos
    const body = await req.json()
    const validatedData = updateColeccionSchema.parse(body)

    // Verificar duplicado de nombre (si se está actualizando el nombre)
    if (validatedData.name && validatedData.name !== existingColeccion.name) {
      const duplicate = await prisma.coleccion.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { message: 'Ya existe otra colección con ese nombre' },
          { status: 409 }
        )
      }
    }

    // Actualizar colección
    const updatedColeccion = await prisma.coleccion.update({
      where: { id },
      data: {
        name: validatedData.name,
        price: validatedData.price,
        image: validatedData.image,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Colección actualizada exitosamente',
      data: updatedColeccion
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando colección:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar colección' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar colección (Solo Admin/Editor)
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
        { message: 'ID de colección inválido' },
        { status: 400 }
      )
    }

    // Verificar si la colección existe
    const existingColeccion = await prisma.coleccion.findUnique({
      where: { id }
    })

    if (!existingColeccion) {
      return NextResponse.json(
        { message: 'Colección no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar colección
    await prisma.coleccion.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Colección eliminada exitosamente',
      deletedId: id,
      deletedName: existingColeccion.name
    })
  } catch (error) {
    console.error('Error eliminando colección:', error)
    return NextResponse.json(
      { message: 'Error interno al eliminar colección' },
      { status: 500 }
    )
  }
}
