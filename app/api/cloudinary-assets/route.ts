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
    const assetFolder = searchParams.get('asset_folder') || ''
    const maxResults = searchParams.get('max_results') || '30'
    const nextCursor = searchParams.get('next_cursor')

    let result
    
    if (assetFolder) {
      // Listar recursos por carpeta (dynamic folder mode)
      // Usar resources con prefix para mejor compatibilidad
      result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        prefix: assetFolder + '/',
        max_results: parseInt(maxResults),
        next_cursor: nextCursor || undefined
      })
    } else {
      // Si no hay carpeta, listar todas las imágenes
      result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        max_results: parseInt(maxResults),
        next_cursor: nextCursor || undefined
      })
    }

    // Transformar URLs para optimización (f_auto, q_auto)
    // Filtrar solo imágenes directas de la carpeta (no subcarpetas)
    let resources = result.resources
    
    if (assetFolder) {
      // Filtrar para excluir imágenes de subcarpetas
      // Ejemplo: Si assetFolder es 'product', excluir 'product/shoe/image.jpg'
      resources = resources.filter((resource: any) => {
        const relativePath = resource.public_id.replace(assetFolder + '/', '')
        // Si no contiene más '/', es imagen directa de esta carpeta
        return !relativePath.includes('/')
      })
    }
    
    const transformedResources = resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url.replace(
        '/upload/',
        '/upload/f_auto,q_auto/'
      ),
      created_at: resource.created_at,
      bytes: resource.bytes,
      format: resource.format,
      width: resource.width,
      height: resource.height
    }))

    return NextResponse.json({
      resources: transformedResources,
      next_cursor: result.next_cursor,
      total_count: transformedResources.length,
      has_more: !!result.next_cursor
    })
  } catch (error: any) {
    const errorMessage = error?.error?.message || error?.message || 'Unknown error'
    console.error('Error listing assets:', errorMessage)
    
    // Si la carpeta no existe o está vacía, retornar array vacío
    if (
      errorMessage.includes('Not found') ||
      errorMessage.includes('No resources found') ||
      errorMessage.includes('Unauthorized')
    ) {
      return NextResponse.json({
        resources: [],
        next_cursor: null,
        total_count: 0,
        has_more: false
      })
    }
    
    // Error de configuración
    if (errorMessage.includes('Cloud name') || errorMessage.includes('API Key')) {
      console.error('Cloudinary configuration error. Check environment variables.')
      return NextResponse.json(
        { error: 'Cloudinary configuration error', resources: [] },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to list assets', resources: [] },
      { status: 500 }
    )
  }
}
