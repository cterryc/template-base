'use client'

import React, { useState } from 'react'
import { MdImage, MdPhotoLibrary, MdClose, MdCheckCircle } from 'react-icons/md'
import CloudinaryGallery from './CloudinaryGallery'

interface ImageManagerProps {
  mainImage: string
  secondaryImage?: string
  image3?: string
  image4?: string
  onMainImageChange: (url: string) => void
  onSecondaryImageChange?: (url: string) => void
  onImage3Change?: (url: string) => void
  onImage4Change?: (url: string) => void
  imageFrom?: string
  editImage?: boolean
  maxImages?: number // Controla cuántas imágenes se pueden seleccionar (default: 4)
}

const ImageManager: React.FC<ImageManagerProps> = ({
  mainImage,
  secondaryImage,
  image3,
  image4,
  onMainImageChange,
  onSecondaryImageChange,
  onImage3Change,
  onImage4Change,
  imageFrom,
  editImage,
  maxImages = 4 // Por defecto permite hasta 4 imágenes
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showCloudinaryGallery, setShowCloudinaryGallery] = useState(false)

  // Seleccionar imagen de la galería
  const handleSelectFromGallery = (images: string[]) => {
    if (images[0]) onMainImageChange(images[0])
    if (images[1] && onSecondaryImageChange) onSecondaryImageChange(images[1])
    if (images[2] && onImage3Change) onImage3Change(images[2])
    if (images[3] && onImage4Change) onImage4Change(images[3])
  }

  // Eliminar imagen subida
  const removeUploadedImage = (url: string) => {
    if (mainImage === url) onMainImageChange('')
    if (secondaryImage === url && onSecondaryImageChange)
      onSecondaryImageChange('')
    if (image3 === url && onImage3Change) onImage3Change('')
    if (image4 === url && onImage4Change) onImage4Change('')
    setUploadedImages((prev) => prev.filter((img) => img !== url))
  }

  const uploadAndGalery = (
    <div
      className={`${
        imageFrom === 'systemImages' || imageFrom === 'colection'
          ? 'flex-col'
          : ''
      } flex gap-3 mb-4`}
    >
      <button
        onClick={() => setShowCloudinaryGallery(true)}
        className='flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'
      >
        <MdPhotoLibrary />
        Galería
      </button>
    </div>
  )

  return (
    <>
      <div
        className={`${
          imageFrom === 'systemImages' || imageFrom === 'colection'
            ? 'grid grid-cols-2 gap-1'
            : ''
        }`}
      >
        {!imageFrom && (
          <>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              {maxImages === 1 ? 'Imagen' : 'Imágenes del Producto'}
            </label>
            <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
              {maxImages === 1
                ? 'Selecciona una imagen'
                : `Sube hasta ${maxImages} imágenes (primera imagen es obligatoria)`}
            </p>
          </>
        )}

        {/* Botones para subir imágenes */}
        {editImage === undefined
          ? uploadAndGalery
          : editImage === true
            ? uploadAndGalery
            : null}

        {/* Vista previa de imágenes */}
        <div
          className={`${
            imageFrom === 'systemImages'
              ? 'w-32 pb-2 grid row-start-1'
              : 'grid grid-cols-2 gap-4'
          }`}
        >
          {/* Imagen principal */}
          <ImagePreview
            imageUrl={mainImage}
            label={maxImages === 1 ? 'Imagen' : 'Imagen Principal'}
            onRemove={() => onMainImageChange('')}
            showIconRemove={editImage}
            onSecondaryImageChange={onSecondaryImageChange === undefined}
          />

          {/* Imagen secundaria */}
          {maxImages >= 2 && onSecondaryImageChange && (
            <ImagePreview
              imageUrl={secondaryImage || ''}
              label='Imagen 2 (Opcional)'
              onRemove={() => onSecondaryImageChange('')}
              showIconRemove={editImage}
            />
          )}

          {/* Imagen 3 */}
          {maxImages >= 3 && onImage3Change && (
            <ImagePreview
              imageUrl={image3 || ''}
              label='Imagen 3 (Opcional)'
              onRemove={() => onImage3Change('')}
              showIconRemove={editImage}
            />
          )}

          {/* Imagen 4 */}
          {maxImages >= 4 && onImage4Change && (
            <ImagePreview
              imageUrl={image4 || ''}
              label='Imagen 4 (Opcional)'
              onRemove={() => onImage4Change('')}
              showIconRemove={editImage}
            />
          )}
        </div>

        {/* Imágenes recién subidas */}
        {uploadedImages.length > 0 && !imageFrom && (
          <div className='mt-4'>
            <p className='mb-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Imágenes subidas recientemente:
            </p>
            <div className='flex flex-wrap gap-2'>
              {uploadedImages.map((url, index) => (
                <div key={index} className='relative'>
                  <img
                    src={url}
                    alt={`Subida ${index + 1}`}
                    className='h-16 w-16 rounded-lg object-cover border'
                  />
                  <button
                    onClick={() => removeUploadedImage(url)}
                    className='absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600'
                  >
                    <MdClose size={12} />
                  </button>
                  {(mainImage === url || secondaryImage === url) && (
                    <div className='absolute bottom-1 left-1'>
                      <MdCheckCircle className='text-green-500 text-sm' />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Galería Cloudinary */}
      {showCloudinaryGallery && (
        <CloudinaryGallery
          onClose={() => setShowCloudinaryGallery(false)}
          onSelectImages={handleSelectFromGallery}
          maxSeleted={maxImages}
        />
      )}
    </>
  )
}

// Componente interno para vista previa de imagen
interface ImagePreviewProps {
  imageUrl: string
  label: string
  onRemove: () => void
  showIconRemove?: boolean
  onSecondaryImageChange?: boolean
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  label,
  onRemove,
  showIconRemove,
  onSecondaryImageChange
}) => (
  <div className='relative'>
    <div className='aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700/50'>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt='Preview'
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='flex h-full items-center justify-center'>
          <MdImage className='text-gray-400 dark:text-gray-500 text-4xl' />
        </div>
      )}
    </div>
    {!onSecondaryImageChange && (
      <div className='mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400'>
        {label}
      </div>
    )}
    {showIconRemove === undefined ? (
      imageUrl && (
        <button
          onClick={onRemove}
          className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
        >
          <MdClose size={14} />
        </button>
      )
    ) : showIconRemove && imageUrl ? (
      <button
        onClick={onRemove}
        className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
      >
        <MdClose size={14} />
      </button>
    ) : null}
  </div>
)

export default ImageManager
