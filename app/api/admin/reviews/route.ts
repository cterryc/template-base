import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@/app/generated/prisma/client'

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar si es admin (asumiendo que hay un campo role o similar)
  const dbUser = await prisma.user.findUnique({ where: { clerkId } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const skip = (page - 1) * limit

  try {
    const andConditions: Prisma.ReviewWhereInput[] = [
      {
        OR: [
          { comment: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { producto: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }
    ]

    // Filtro de estado
    if (status === 'approved') {
      andConditions.push({ aiApproved: true })
    } else if (status === 'rejected') {
      andConditions.push({ aiApproved: false })
    } else if (status === 'pending') {
      andConditions.push({ aiApproved: null })
    }

    const where: Prisma.ReviewWhereInput = { AND: andConditions }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          producto: { select: { name: true, image: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}
