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
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Convertir File a Buffer para Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'ecommerce-products',
          transformation: [
            { fetch_format: 'auto', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      folder: result.folder,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format
    })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    
    const errorMessage = error?.message || 'Error al subir imagen'
    
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
