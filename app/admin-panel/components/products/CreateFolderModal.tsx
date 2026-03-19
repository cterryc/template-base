'use client'

import React, { useState } from 'react'
import { MdClose, MdFolder, MdWarning } from 'react-icons/md'
import { toast } from 'sonner'

interface CreateFolderModalProps {
  onClose: () => void
  onSuccess: (folderName: string) => void
  parentPath: string
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  onClose,
  onSuccess,
  parentPath
}) => {
  const [folderName, setFolderName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!folderName.trim()) {
      setError('El nombre de la carpeta es requerido')
      return
    }

    // Validar caracteres
    const folderNameRegex = /^[a-zA-Z0-9_-]+$/
    if (!folderNameRegex.test(folderName.trim())) {
      setError('Sin espacios, solo letras, números, guiones y guiones bajos')
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/cloudinary/folder-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: folderName.trim(),
          parentPath: parentPath || undefined
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear carpeta')
      }

      toast.success('Carpeta creada exitosamente')
      onSuccess(result.name)
      onClose()
    } catch (error: any) {
      console.error('Error creating folder:', error)
      setError(error.message || 'Error al crear carpeta')
      toast.error(error.message || 'Error al crear carpeta')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center'>
              <MdFolder className='text-blue-600 dark:text-blue-400 text-xl' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                Nueva Carpeta
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Crea una subcarpeta
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

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          {/* Ubicación actual */}
          <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
            <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
              Se creará en:
            </p>
            <div className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              <MdFolder className='text-gray-400' />
              <span className='truncate'>
                {parentPath || 'Root (carpeta raíz)'}
              </span>
            </div>
          </div>

          {/* Input nombre */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Nombre de la carpeta
            </label>
            <input
              type='text'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='ej: zapatos, accesorios, verano'
              className='w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
              autoFocus
              disabled={creating}
            />
            {error && (
              <div className='mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm'>
                <MdWarning size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className='mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
            <p className='text-xs text-blue-700 dark:text-blue-400'>
              💡 La carpeta se creará automáticamente cuando subas tu primera
              imagen
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              disabled={creating}
              className='flex-1 px-4 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={creating || !folderName.trim()}
              className='flex-1 px-4 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {creating ? 'Creando...' : 'Crear Carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFolderModal
