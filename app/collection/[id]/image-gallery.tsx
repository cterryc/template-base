'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (images.length === 0) return null

  return (
    <div className='space-y-4'>
      {/* Imagen principal */}
      <div className='aspect-square relative overflow-hidden bg-secondary'>
        <Image
          src={images[selectedImage]}
          alt={`${productName} - vista ${selectedImage + 1}`}
          fill
          className='object-cover transition-transform duration-300 hover:scale-105'
          priority
          sizes='(max-width: 1024px) 100vw, 50vw'
        />
      </div>

      {/* Miniaturas - solo si hay más de 1 imagen */}
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-3'>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative overflow-hidden bg-secondary border-2 transition-all ${
                selectedImage === index
                  ? 'border-foreground'
                  : 'border-transparent hover:border-foreground/50'
              }`}
              aria-label={`Ver imagen ${index + 1} de ${productName}`}
              type='button'
            >
              <Image
                src={image}
                alt={`${productName} - miniatura ${index + 1}`}
                fill
                className='object-cover'
                sizes='(max-width: 1024px) 25vw, 12vw'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
