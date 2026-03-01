/**
 * Transforma URL de Cloudinary para aplicar optimizaciones
 *
 * @param url - URL original de Cloudinary
 * @param width - Ancho deseado (default: 400)
 * @param quality - Calidad deseada (default: 80)
 * @returns URL optimizada con q_auto,w_{width}
 */
export function optimizeCloudinaryUrl(
  url: string,
  width: number = 400,
  quality: number = 80
): string {
  // Si no es URL de Cloudinary, retornar original
  if (!url.includes('cloudinary.com')) {
    return url
  }

  // Si ya tiene parámetros de optimización, retornar original
  if (url.includes('/q_auto') || url.includes('/w_')) {
    return url
  }

  // Insertar optimizaciones después de "/upload/"
  const newUrl = url.replace(
    '/image/upload/',
    `/image/upload/q_${quality},w_${width}/`
  )
  console.log(newUrl)
  if (newUrl.includes('.jpg')) {
    return newUrl.replace('.jpg', '.webp')
  } else if (newUrl.includes('.png')) {
    return newUrl.replace('.png', '.webp')
  } else if (newUrl.includes('.jpeg')) {
    return newUrl.replace('.jpeg', '.webp')
  } else if (newUrl.includes('.gif')) {
    return newUrl.replace('.gif', '.webp')
  } else if (newUrl.includes('.bmp')) {
    return newUrl.replace('.bmp', '.webp')
  } else if (newUrl.includes('.svg')) {
    return newUrl.replace('.svg', '.webp')
  }
  return newUrl
}
