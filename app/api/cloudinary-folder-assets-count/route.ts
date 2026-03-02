import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''

    if (!folder) {
      return NextResponse.json(
        { error: 'folder parameter is required' },
        { status: 400 }
      )
    }

    // Contar recursos en la carpeta usando prefix
    // Solo obtenemos 1 resultado para verificar si existe, y usamos total_count
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: folder + '/',
      max_results: 1,
      next_cursor: undefined
    })

    return NextResponse.json({
      count: result.total_count || result.resources.length,
      has_resources: result.resources.length > 0,
      folder_path: folder
    })
  } catch (error: any) {
    console.error('Error counting assets:', error)

    const errorMessage = error?.error?.message || error?.message || 'Error al contar recursos'

    // Si la carpeta no existe o está vacía
    if (
      errorMessage.includes('Not found') ||
      errorMessage.includes('No resources found') ||
      errorMessage.includes('does not exist')
    ) {
      return NextResponse.json({
        count: 0,
        has_resources: false,
        folder_path: folder
      })
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
