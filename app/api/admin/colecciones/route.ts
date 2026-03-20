import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

// Esquema de validación
const createColeccionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Nombre muy largo'),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  image: z.string().url('La imagen debe ser una URL válida')
})

// POST - Crear colección (Solo Admin/Editor)
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
    const validatedData = createColeccionSchema.parse(body)

    const coleccionQuantity = await prisma.coleccion.findMany()

    if (coleccionQuantity.length === 4) {
      return NextResponse.json(
        { message: 'Ya no se admiten mas colecciones' },
        { status: 403 }
      )
    }

    // Verificar si ya existe una colección con ese nombre
    const existingColeccion = await prisma.coleccion.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingColeccion) {
      return NextResponse.json(
        { message: 'Ya existe una colección con ese nombre' },
        { status: 409 }
      )
    }

    // Crear colección
    const coleccion = await prisma.coleccion.create({
      data: {
        name: validatedData.name,
        ...(validatedData.price
          ? { price: validatedData.price }
          : { price: 0 }),
        image: validatedData.image
      }
    })

    return NextResponse.json(
      {
        message: 'Colección creada exitosamente',
        data: coleccion
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

    console.error('Error creando colección:', error)
    return NextResponse.json(
      { message: 'Error interno al crear colección' },
      { status: 500 }
    )
  }
}
