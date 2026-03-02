'use client'

import React from 'react'
import { MdCheckCircle, MdError, MdCloudUpload } from 'react-icons/md'

export interface UploadFileStatus {
  name: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  url?: string
}

interface UploadProgressProps {
  uploads: UploadFileStatus[]
  onClose?: () => void
}

const UploadProgress: React.FC<UploadProgressProps> = ({ uploads, onClose }) => {
  const total = uploads.length
  const completed = uploads.filter(u => u.status === 'success' || u.status === 'error').length
  const successful = uploads.filter(u => u.status === 'success').length
  const failed = uploads.filter(u => u.status === 'error').length
  const uploading = uploads.filter(u => u.status === 'uploading').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  // Si no hay uploads, no mostrar nada
  if (uploads.length === 0) return null

  return (
    <div className='fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-2'>
          <MdCloudUpload className={`text-xl ${
            failed > 0 ? 'text-yellow-500' : 'text-blue-500'
          }`} />
          <span className='font-semibold text-gray-900 dark:text-white text-sm'>
            {uploading > 0 ? 'Subiendo imágenes...' : 
             failed > 0 ? 'Upload completado con errores' : 
             'Upload completado'}
          </span>
        </div>
        {onClose && completed === total && (
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <MdCloudUpload className='rotate-45' size={18} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {uploading > 0 && (
        <div className='h-1 bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-full bg-blue-500 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Stats */}
      <div className='px-4 py-2 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between text-xs'>
          <span className='text-gray-600 dark:text-gray-400'>
            {completed} de {total} completados
          </span>
          <div className='flex items-center gap-3'>
            {successful > 0 && (
              <span className='text-green-600 dark:text-green-400 flex items-center gap-1'>
                <MdCheckCircle size={12} />
                {successful}
              </span>
            )}
            {failed > 0 && (
              <span className='text-red-600 dark:text-red-400 flex items-center gap-1'>
                <MdError size={12} />
                {failed}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className='max-h-48 overflow-y-auto p-2'>
        {uploads.map((upload, index) => (
          <div
            key={index}
            className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
          >
            {/* Status Icon */}
            <div className='flex-shrink-0'>
              {upload.status === 'uploading' && (
                <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
              )}
              {upload.status === 'success' && (
                <MdCheckCircle className='text-green-500 text-lg' />
              )}
              {upload.status === 'error' && (
                <MdError className='text-red-500 text-lg' />
              )}
              {upload.status === 'pending' && (
                <div className='w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700' />
              )}
            </div>

            {/* File Info */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                {upload.name}
              </p>
              {upload.status === 'uploading' && upload.progress !== undefined && (
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {upload.progress}%...
                </p>
              )}
              {upload.status === 'error' && upload.error && (
                <p className='text-xs text-red-500 dark:text-red-400 truncate'>
                  {upload.error}
                </p>
              )}
              {upload.status === 'success' && (
                <p className='text-xs text-green-600 dark:text-green-400'>
                  Subido exitosamente
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadProgress
