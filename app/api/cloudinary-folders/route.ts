import { v2 as cloudinary, type AdminApiOptions } from 'cloudinary'
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
    const path = searchParams.get('path') || ''
    const maxResults = searchParams.get('max_results') || '100'

    let result
    const options: AdminApiOptions = {
      max_results: parseInt(maxResults)
    }
    
    // Usar el endpoint correcto para listar subcarpetas
    if (path) {
      // Listar subcarpetas de una carpeta específica
      // Casteamos la función para forzar la firma basada en Promesas
      const subFolders = cloudinary.api.sub_folders as (
        path: string,
        options?: AdminApiOptions
      ) => Promise<{ folders: any[]; next_cursor?: string }>
      
      result = await subFolders(path, options)
    } else {
      // Listar carpetas raíz
      const rootFolders = cloudinary.api.root_folders as (
        options?: AdminApiOptions
      ) => Promise<{ folders: any[]; next_cursor?: string }>
      
      result = await rootFolders(options)
    }

    return NextResponse.json({
      folders: result.folders || [],
      has_more: !!result.next_cursor
    })
  } catch (error: any) {
    // Manejar diferentes tipos de errores
    const errorMessage = error?.error?.message || error?.message || 'Unknown error'
    
    console.error('Error listing folders:', errorMessage)
    
    // Si la carpeta no existe, está vacía, o no hay permisos de API, retornar array vacío
    if (
      errorMessage.includes('Not found') ||
      errorMessage.includes('No resources found') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('empty folder')
    ) {
      return NextResponse.json({
        folders: [],
        has_more: false
      })
    }
    
    // Error de configuración de Cloudinary
    if (errorMessage.includes('Cloud name') || errorMessage.includes('API Key')) {
      console.error('Cloudinary configuration error. Check environment variables.')
      return NextResponse.json(
        { error: 'Cloudinary configuration error', folders: [] },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to list folders', folders: [] },
      { status: 500 }
    )
  }
}
