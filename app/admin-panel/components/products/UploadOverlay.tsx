'use client'

import React from 'react'
import { MdCloudUpload, MdFolder } from 'react-icons/md'

interface UploadOverlayProps {
  isDragOver: boolean
  currentPath: string
}

const UploadOverlay: React.FC<UploadOverlayProps> = ({ isDragOver, currentPath }) => {
  if (!isDragOver) return null

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm pointer-events-none'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-auto border-2 border-dashed border-blue-500 animate-in fade-in zoom-in duration-200'>
        <div className='flex flex-col items-center text-center gap-4'>
          <div className='w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center'>
            <MdCloudUpload className='text-5xl text-blue-600 dark:text-blue-400' />
          </div>
          
          <div>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>
              📁 Suelta las imágenes aquí
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Se subirán a la carpeta actual
            </p>
          </div>

          {currentPath ? (
            <div className='flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg'>
              <MdFolder className='text-gray-500 dark:text-gray-400' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {currentPath}
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg'>
              <MdFolder className='text-gray-500 dark:text-gray-400' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Root (carpeta raíz)
              </span>
            </div>
          )}

          <p className='text-xs text-gray-500 dark:text-gray-500'>
            Formatos soportados: JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadOverlay
