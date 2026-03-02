'use client'

import React, { useState, useEffect } from 'react'
import { MdClose, MdFolder, MdWarning, MdDelete } from 'react-icons/md'
import { toast } from 'sonner'

interface DeleteFolderConfirmProps {
  onClose: () => void
  onSuccess: () => void
  folderPath: string
  folderName: string
}

const DeleteFolderConfirm: React.FC<DeleteFolderConfirmProps> = ({
  onClose,
  onSuccess,
  folderPath,
  folderName
}) => {
  const [assetCount, setAssetCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // Obtener cantidad de assets antes de mostrar el modal
  useEffect(() => {
    const fetchAssetCount = async () => {
      try {
        const response = await fetch(
          `/api/cloudinary-folder-assets-count?folder=${encodeURIComponent(folderPath)}`
        )
        const result = await response.json()
        setAssetCount(result.count || 0)
      } catch (error) {
        console.error('Error fetching asset count:', error)
        setAssetCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchAssetCount()
  }, [folderPath])

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch('/api/cloudinary-folder-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: folderPath })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar carpeta')
      }

      toast.success(
        `Carpeta eliminada (${result.deleted_count || 0} imágenes eliminadas)`
      )
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error deleting folder:', error)
      toast.error(error.message || 'Error al eliminar carpeta')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center'>
              <MdDelete className='text-red-600 dark:text-red-400 text-xl' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                Eliminar Carpeta
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Acción irreversible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Advertencia */}
          <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
            <div className='flex items-start gap-3'>
              <MdWarning className='text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-semibold text-red-900 dark:text-red-300 mb-1'>
                  ¡Atención!
                </p>
                <p className='text-sm text-red-700 dark:text-red-400'>
                  Esta acción eliminará permanentemente la carpeta y todo su contenido.
                </p>
              </div>
            </div>
          </div>

          {/* Información de la carpeta */}
          <div className='mb-6 space-y-3'>
            <div className='p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                Carpeta a eliminar:
              </p>
              <div className='flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white'>
                <MdFolder className='text-gray-400' />
                <span className='truncate'>{folderName}</span>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Path: <code className='bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded'>{folderPath}</code>
              </p>
            </div>

            {/* Cantidad de assets */}
            {loading ? (
              <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
                Contando imágenes...
              </div>
            ) : assetCount !== null && assetCount >= 0 ? (
              <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                <p className='text-sm text-yellow-900 dark:text-yellow-300'>
                  📊 Esta carpeta contiene{' '}
                  <span className='font-bold'>{assetCount}</span>{' '}
                  {assetCount === 1 ? 'imagen' : 'imágenes'}
                </p>
              </div>
            ) : null}
          </div>

          {/* Confirmación checkbox */}
          <label className='flex items-start gap-3 mb-6 cursor-pointer'>
            <input
              type='checkbox'
              id='confirm-delete'
              className='mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500'
            />
            <span className='text-sm text-gray-600 dark:text-gray-400 select-none'>
              Entiendo que esta acción es irreversible y eliminará permanentemente todos los archivos.
            </span>
          </label>

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              disabled={deleting}
              className='flex-1 px-4 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={deleting}
              className='flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {deleting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Eliminando...
                </>
              ) : (
                <>
                  <MdDelete />
                  Eliminar Todo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteFolderConfirm
