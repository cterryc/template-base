import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener un producto por ID (Público)
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const product = await prisma.productos.findUnique({
      where: { id },
      include: {
        destacados: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Producto encontrado',
      data: product
    })
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener producto' },
      { status: 500 }
    )
  }
}
