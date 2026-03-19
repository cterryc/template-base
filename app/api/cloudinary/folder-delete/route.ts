import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

export async function DELETE(request: Request) {
  try {
    const { folder } = await request.json()

    if (!folder || typeof folder !== 'string') {
      return NextResponse.json(
        { error: 'Carpeta es requerida' },
        { status: 400 }
      )
    }

    // No permitir eliminar carpeta raíz
    if (!folder || folder === '') {
      return NextResponse.json(
        { error: 'No se puede eliminar la carpeta raíz' },
        { status: 400 }
      )
    }

    // Paso 1: Contar y eliminar todos los recursos en la carpeta
    let totalDeleted = 0
    let nextCursor: string | undefined = undefined
    let batchCount = 0
    const maxBatches = 50 // Límite de seguridad para evitar loops infinitos

    while (batchCount < maxBatches) {
      // Obtener recursos en la carpeta con prefix
      const resourcesResult = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        prefix: folder + '/',
        max_results: 1000,
        next_cursor: nextCursor
      })

      if (resourcesResult.resources.length === 0) {
        break // No más recursos
      }

      // Extraer public_ids para eliminar
      const publicIds = resourcesResult.resources.map(
        (resource: any) => resource.public_id
      )

      // Eliminar recursos en batch
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds)
        totalDeleted += publicIds.length
      }

      nextCursor = resourcesResult.next_cursor
      batchCount++

      // Si no hay más recursos, salir
      if (!nextCursor) {
        break
      }
    }

    if (batchCount >= maxBatches) {
      console.warn('Se alcanzó el límite de batches para eliminar recursos')
    }

    // Paso 2: Eliminar carpeta vacía
    await cloudinary.api.delete_folder(folder)

    return NextResponse.json({
      message: 'Carpeta eliminada exitosamente',
      deleted_count: totalDeleted,
      folder_path: folder
    })
  } catch (error: any) {
    console.error('Error deleting folder:', error)

    const errorMessage = error?.error?.message || error?.message || 'Error al eliminar carpeta'

    // Carpeta no encontrada
    if (errorMessage.includes('Not found') || errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'La carpeta no existe' },
        { status: 404 }
      )
    }

    // Carpeta no vacía (no debería pasar porque eliminamos recursos primero)
    if (errorMessage.includes('not empty') || errorMessage.includes('has resources')) {
      return NextResponse.json(
        { error: 'La carpeta aún contiene recursos. Intente nuevamente.' },
        { status: 400 }
      )
    }

    // Error de configuración
    if (errorMessage.includes('Cloud name') || errorMessage.includes('API Key')) {
      console.error('Cloudinary configuration error. Check environment variables.')
      return NextResponse.json(
        { error: 'Cloudinary configuration error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
