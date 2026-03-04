import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  const dbUser = await prisma.user.findUnique({ where: { clerkId } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'EDITOR'))
    return null
  return dbUser
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin()
  if (!admin)
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const { id } = await params
  const { aiApproved, aiModerated } = await req.json()

  try {
    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        aiApproved: aiApproved === undefined ? undefined : aiApproved,
        aiModerated: aiModerated === undefined ? undefined : aiModerated
      }
    })

    revalidatePath(`/collection/${review.productoId}`)
    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reseña' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin()
  if (!admin)
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const { id } = await params

  try {
    const review = await prisma.review.delete({
      where: { id: parseInt(id) }
    })

    revalidatePath(`/collection/${review.productoId}`)
    return NextResponse.json({ success: true, message: 'Reseña eliminada' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reseña' },
      { status: 500 }
    )
  }
}
