import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

export async function POST(request: Request) {
  try {
    const { publicId }: { publicId?: string } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { message: 'Se requiere publicId' },
        { status: 400 }
      )
    }

    // Eliminar imagen de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    console.log('Cloudinary destroy result:', result)

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        message: 'Imagen borrada correctamente',
        publicId: publicId,
        result
      })
    }

    return NextResponse.json(
      {
        message: 'Cloudinary no pudo borrar la imagen',
        detail: result
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error en Cloudinary Delete:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
