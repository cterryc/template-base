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
    const { folder, parentPath } = await request.json()

    if (!folder || typeof folder !== 'string') {
      return NextResponse.json(
        { error: 'Nombre de carpeta es requerido' },
        { status: 400 }
      )
    }

    // Validar nombre de carpeta (solo caracteres alfanuméricos, guiones y guiones bajos)
    const folderNameRegex = /^[a-zA-Z0-9_-]+$/
    if (!folderNameRegex.test(folder)) {
      return NextResponse.json(
        { error: 'Nombre inválido. Solo letras, números, guiones y guiones bajos' },
        { status: 400 }
      )
    }

    // Construir path completo
    const fullPath = parentPath
      ? `${parentPath}/${folder}`
      : folder

    // Crear carpeta usando Admin API
    const result = await cloudinary.api.create_folder(fullPath)

    return NextResponse.json({
      message: 'Carpeta creada exitosamente',
      path: result.path,
      name: result.name,
      created_at: result.created_at
    })
  } catch (error: any) {
    console.error('Error creating folder:', error)

    const errorMessage = error?.error?.message || error?.message || 'Error al crear carpeta'

    // Carpeta ya existe
    if (errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: 'Ya existe una carpeta con ese nombre' },
        { status: 409 }
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
