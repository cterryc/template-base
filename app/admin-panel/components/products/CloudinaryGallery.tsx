'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  MdClose,
  MdDelete,
  MdCheckCircle,
  MdExpandMore,
  MdFolder,
  MdArrowBack,
  MdHome,
  MdCloudUpload
} from 'react-icons/md'
import { FaFolderPlus } from 'react-icons/fa'
import { toast } from 'sonner'
import {
  CloudinaryImageExtended,
  CloudinaryFolder,
  CloudinaryAssetsResponse,
  CloudinaryFoldersResponse,
  UploadFileStatus
} from '../types'
import UploadOverlay from './UploadOverlay'
import UploadProgress from './UploadProgress'
import CreateFolderModal from './CreateFolderModal'
import DeleteFolderConfirm from './DeleteFolderConfirm'

interface CloudinaryGalleryProps {
  onClose: () => void
  onSelectImages: (images: string[]) => void
  maxSeleted: number
}

const CloudinaryGallery: React.FC<CloudinaryGalleryProps> = ({
  onClose,
  onSelectImages,
  maxSeleted
}) => {
  // Navegación por carpetas
  const [currentPath, setCurrentPath] = useState<string>('')
  const [subfolders, setSubfolders] = useState<CloudinaryFolder[]>([])

  // Imágenes de la carpeta actual
  const [assets, setAssets] = useState<CloudinaryImageExtended[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  // Estados de carga
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMoreAssets, setHasMoreAssets] = useState(false)

  // Drag & Drop
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  // Upload Progress
  const [uploads, setUploads] = useState<UploadFileStatus[]>([])
  const [showUploadProgress, setShowUploadProgress] = useState(false)

  // Create/Delete Folder
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<{
    path: string
    name: string
  } | null>(null)
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)

  // Obtener subcarpetas de la carpeta actual
  const fetchFolders = useCallback(async (path: string = '') => {
    setLoadingFolders(true)
    try {
      const url = path
        ? `/api/cloudinary/folders?path=${encodeURIComponent(path)}`
        : '/api/cloudinary/folders'

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status !== 500) {
          console.warn('Folders API returned non-critical error:', errorData)
        }
        setSubfolders([])
        return
      }

      const result: CloudinaryFoldersResponse = await response.json()
      setSubfolders(result.folders || [])
    } catch (error) {
      console.warn('Error fetching folders (this is optional):', error)
      setSubfolders([])
    } finally {
      setLoadingFolders(false)
    }
  }, [])

  // Obtener imágenes de la carpeta actual
  const fetchAssets = useCallback(
    async (path: string = '', cursor: string | null = null) => {
      if (cursor) {
        setLoadingMore(true)
      } else {
        setLoadingAssets(true)
      }

      try {
        const url = `/api/cloudinary/assets?asset_folder=${encodeURIComponent(path)}&max_results=30${cursor ? `&next_cursor=${cursor}` : ''}`

        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn('Assets API error:', errorData)

          if (!cursor) {
            setAssets([])
          }
          return
        }

        const result: CloudinaryAssetsResponse = await response.json()

        if (cursor) {
          setAssets((prev) => [...prev, ...result.resources])
        } else {
          setAssets(result.resources)
        }

        setNextCursor(result.next_cursor)
        setHasMoreAssets(result.has_more)
      } catch (error) {
        console.warn('Error fetching assets:', error)
        if (!cursor) {
          setAssets([])
        }
      } finally {
        if (cursor) {
          setLoadingMore(false)
        } else {
          setLoadingAssets(false)
        }
      }
    },
    []
  )

  // Cargar carpetas e imágenes al cambiar de ruta
  useEffect(() => {
    fetchFolders(currentPath)
    fetchAssets(currentPath)
  }, [currentPath, fetchFolders, fetchAssets])

  // Navegar a una carpeta
  const navigateTo = useCallback(
    (path: string) => {
      setCurrentPath(path)
      setSelectedImages([])
      setAssets([])
      setNextCursor(null)
    },
    [currentPath]
  )

  // Navegar hacia atrás (subir un nivel en la jerarquía)
  const navigateUp = useCallback(() => {
    if (!currentPath) return // Ya estamos en Root
    // Calcular padre: remover último segmento del path
    const parentPath = currentPath.split('/').slice(0, -1).join('/')
    setCurrentPath(parentPath)
  }, [currentPath])

  // Ir a la raíz
  const navigateToRoot = useCallback(() => {
    setCurrentPath('')
    setAssets([])
    setNextCursor(null)
  }, [])

  // Cargar más imágenes con scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget
      const scrollThreshold = 100

      if (
        container.scrollHeight - container.scrollTop <=
          container.clientHeight + scrollThreshold &&
        !loadingMore &&
        hasMoreAssets &&
        nextCursor
      ) {
        fetchAssets(currentPath, nextCursor)
      }
    },
    [loadingMore, hasMoreAssets, nextCursor, currentPath, fetchAssets]
  )

  // ========== DRAG & DROP HANDLERS ==========

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++

    // Solo activar si son archivos
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--

    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  // Subir archivo individual
  const uploadFile = async (file: File): Promise<UploadFileStatus> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', currentPath || 'ecommerce-products')

    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Error al subir' }))
      throw new Error(error.error || 'Error al subir imagen')
    }

    const result = await response.json()
    return {
      name: file.name,
      status: 'success',
      url: result.secure_url,
      progress: 100
    }
  }

  // Manejar drop de archivos
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      dragCounter.current = 0

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      )

      if (files.length === 0) {
        toast.warning('Solo se permiten archivos de imagen')
        return
      }

      // Inicializar estado de uploads
      const initialUploads: UploadFileStatus[] = files.map((file) => ({
        name: file.name,
        status: 'pending',
        progress: 0
      }))

      setUploads(initialUploads)
      setShowUploadProgress(true)

      // Subir archivos secuencialmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Actualizar estado a "uploading"
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: 'uploading', progress: 50 } : u
          )
        )

        try {
          const result = await uploadFile(file)

          // Actualizar estado a "success"
          setUploads((prev) => prev.map((u, idx) => (idx === i ? result : u)))

          // Agregar imagen a la galería localmente
          setAssets((prev) => [
            {
              public_id: result.url?.split('/').pop()?.split('.')[0] || '',
              secure_url: result.url!,
              created_at: new Date().toISOString(),
              bytes: file.size,
              format: file.type.split('/')[1]
            },
            ...prev
          ])
        } catch (error: any) {
          // Actualizar estado a "error"
          setUploads((prev) =>
            prev.map((u, idx) =>
              idx === i ? { ...u, status: 'error', error: error.message } : u
            )
          )
        }
      }

      // Notificar completado
      const successCount =
        uploads.filter((u) => u.status === 'success').length + 1
      const errorCount = uploads.filter((u) => u.status === 'error').length

      if (errorCount === 0) {
        toast.success(`${files.length} imagen(es) subida(s) exitosamente`)
      } else {
        toast.warning(`${successCount} subidas, ${errorCount} fallidas`)
      }

      // Auto-ocultar progress después de 3 segundos si todo fue exitoso
      if (errorCount === 0) {
        setTimeout(() => setShowUploadProgress(false), 3000)
      }
    },
    [currentPath]
  )

  // ========== FIN DRAG & DROP HANDLERS ==========

  // ========== CREATE/DELETE FOLDER HANDLERS ==========

  // Crear carpeta
  const handleCreateFolder = useCallback(
    (folderName: string) => {
      // Refrescar carpetas después de crear
      fetchFolders(currentPath)
      toast.success(`Carpeta "${folderName}" creada`)
    },
    [currentPath, fetchFolders]
  )

  // Confirmar eliminación de carpeta
  const confirmDeleteFolder = useCallback(
    (folderPath: string, folderName: string) => {
      setFolderToDelete({ path: folderPath, name: folderName })
      setShowDeleteConfirm(true)
    },
    []
  )

  // Eliminar carpeta (después de confirmación)
  const handleDeleteFolderSuccess = useCallback(() => {
    setShowDeleteConfirm(false)
    setFolderToDelete(null)

    if (folderToDelete) {
      const parentPath = folderToDelete.path.split('/').slice(0, -1).join('/')

      // Si estamos en la carpeta que se eliminó, navegar al padre
      if (folderToDelete.path === currentPath) {
        navigateTo(parentPath)
        // navigateTo ya dispara el useEffect que carga carpetas e imágenes
        // No necesitamos fetch adicional
      } else {
        // Si no estamos en la carpeta eliminada, solo refrescar la lista de carpetas
        fetchFolders(currentPath)
      }
    }
  }, [currentPath, folderToDelete, fetchFolders, navigateTo])

  // ========== FIN CREATE/DELETE FOLDER HANDLERS ==========

  // Seleccionar/deseleccionar imagen
  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages((prev) => prev.filter((url) => url !== imageUrl))
    } else if (selectedImages.length < maxSeleted) {
      setSelectedImages((prev) => [...prev, imageUrl])
    } else {
      toast.warning(`Solo puedes seleccionar hasta ${maxSeleted} imágenes`)
    }
  }

  // Eliminar imagen de Cloudinary
  const deleteImage = async (imageUrl: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen permanentemente?'))
      return

    try {
      // Extraer public_id de la URL para enviarlo directamente
      // La URL es como: https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto/folder/image.jpg
      const urlParts = imageUrl.split('/upload/')
      let publicId = ''

      if (urlParts.length > 1) {
        // Obtener parte después de /upload/ y eliminar transformaciones
        const afterUpload = urlParts[1]
        const parts = afterUpload.split('/')

        // Filtrar transformaciones (contienen comas o empiezan con letras + guion bajo)
        const pathParts: string[] = []
        for (const part of parts) {
          if (part.includes(',') || /^[a-z]_/.test(part) || /^v\d/.test(part)) {
            continue
          }
          pathParts.push(part)
        }

        // Eliminar extensión
        const lastPart = pathParts.pop() || ''
        const publicIdWithoutExt = lastPart.split('.')[0]

        publicId =
          pathParts.length > 0
            ? `${pathParts.join('/')}/${publicIdWithoutExt}`
            : publicIdWithoutExt
      }

      console.log('Deleting image:', { imageUrl, publicId })

      const response = await fetch('/api/cloudinary/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, publicId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar imagen')
      }

      setAssets((prev) => prev.filter((img) => img.secure_url !== imageUrl))
      setSelectedImages((prev) => prev.filter((url) => url !== imageUrl))
      toast.success('Imagen eliminada exitosamente')
    } catch (error: any) {
      console.error('Error deleting image:', error)
      toast.error(error.message || 'Error al eliminar la imagen')
    }
  }

  // Usar imágenes seleccionadas
  const handleUseSelectedImages = () => {
    if (selectedImages.length === 0) {
      toast.warning('Selecciona al menos una imagen')
      return
    }
    onSelectImages(selectedImages)
    onClose()
    toast.success('Imágenes seleccionadas')
  }

  // Obtener nombre de la carpeta actual
  const getCurrentFolderName = () => {
    if (!currentPath) return 'Root'
    const parts = currentPath.split('/')
    return parts[parts.length - 1]
  }

  // Construir breadcrumb path
  const getBreadcrumbPaths = () => {
    const paths: { name: string; path: string }[] = [
      { name: '🏠 Root', path: '' }
    ]

    if (currentPath) {
      const parts = currentPath.split('/')
      let accumulatedPath = ''

      parts.forEach((part) => {
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part

        paths.push({
          name: part,
          path: accumulatedPath
        })
      })
    }

    return paths
  }

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm'
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Overlay de Drag & Drop */}
      <UploadOverlay isDragOver={isDragOver} currentPath={currentPath} />

      {/* Progress de Upload */}
      {showUploadProgress && (
        <UploadProgress
          uploads={uploads}
          onClose={() => setShowUploadProgress(false)}
        />
      )}

      <div className='w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 dark:bg-gray-800 relative'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
          <div>
            <h3 className='text-xl font-bold dark:text-white'>
              Galería de Imágenes
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {currentPath || 'Carpeta raíz'} • {assets.length} imágenes
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {selectedImages.length}/{maxSeleted} seleccionadas
            </span>
            <button
              onClick={onClose}
              className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className='flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 overflow-x-auto'>
          <button
            onClick={navigateToRoot}
            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border dark:border-gray-600 whitespace-nowrap'
            disabled={!currentPath}
          >
            <MdHome size={16} />
            Root
          </button>

          {currentPath && (
            <button
              onClick={navigateUp}
              className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border dark:border-gray-600'
            >
              <MdArrowBack size={16} />
              Atrás
            </button>
          )}

          <div className='flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
            {getBreadcrumbPaths().map((item, index) => (
              <React.Fragment key={item.path || 'root'}>
                {index > 0 && <span className='text-gray-400'>/</span>}
                {item.path === currentPath ? (
                  <span className='font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded'>
                    {item.name}
                  </span>
                ) : (
                  <button
                    onClick={() => navigateTo(item.path)}
                    className='hover:text-blue-600 dark:hover:text-blue-400 hover:underline px-1'
                  >
                    {item.name}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className='overflow-y-auto p-6 flex-1' onScroll={handleScroll}>
          {/* Loading state */}
          {(loadingFolders || loadingAssets) && !loadingMore ? (
            <div className='flex justify-center py-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
            </div>
          ) : (
            <>
              {/* Subcarpetas */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                    Carpetas
                  </h4>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors'
                  >
                    <FaFolderPlus size={16} />
                    Nueva Carpeta
                  </button>
                </div>

                {subfolders.length > 0 ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                    {subfolders.map((folder) => (
                      <div
                        key={folder.path}
                        className='relative group'
                        onMouseEnter={() => setHoveredFolder(folder.path)}
                        onMouseLeave={() => setHoveredFolder(null)}
                      >
                        <button
                          onClick={() => navigateTo(folder.path)}
                          className='w-full flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all'
                        >
                          <MdFolder className='text-4xl text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400' />
                          <span className='text-sm font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full'>
                            {folder.name}
                          </span>
                        </button>

                        {/* Botón eliminar (visible en hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDeleteFolder(folder.path, folder.name)
                          }}
                          className={`absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all ${
                            hoveredFolder === folder.path
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                          title='Eliminar carpeta'
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400 text-sm'>
                    No hay carpetas. Crea una nueva carpeta para organizar tus
                    imágenes.
                  </div>
                )}
              </div>

              {/* Imágenes */}
              {assets.length > 0 && (
                <div>
                  {subfolders.length > 0 && (
                    <h4 className='text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-6 uppercase tracking-wide'>
                      Imágenes en {getCurrentFolderName()}
                    </h4>
                  )}
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {assets.map((image) => (
                      <ImageCard
                        key={image.public_id}
                        image={image}
                        isSelected={selectedImages.includes(image.secure_url)}
                        onSelect={() => toggleImageSelection(image.secure_url)}
                        onDelete={() => deleteImage(image.secure_url)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sin contenido */}
              {subfolders.length === 0 &&
                assets.length === 0 &&
                !loadingAssets && (
                  <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                    <MdFolder className='text-6xl mx-auto mb-4 opacity-50' />
                    <p>Esta carpeta está vacía</p>
                    <div className='mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg'>
                      <MdCloudUpload className='text-3xl mx-auto mb-2 text-gray-400' />
                      <p className='text-sm'>
                        Arrastra imágenes aquí para subir
                      </p>
                    </div>
                    {currentPath && (
                      <button
                        onClick={navigateUp}
                        className='mt-2 text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        Volver atrás
                      </button>
                    )}
                  </div>
                )}

              {/* Loading más imágenes */}
              {loadingMore && (
                <div className='flex justify-center py-6'>
                  <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                </div>
              )}

              {/* Botón cargar más */}
              {!loadingMore && hasMoreAssets && nextCursor && (
                <div className='flex justify-center py-4'>
                  <button
                    onClick={() => fetchAssets(currentPath, nextCursor)}
                    className='flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'
                  >
                    <MdExpandMore />
                    Cargar más imágenes
                  </button>
                </div>
              )}

              {/* Fin de imágenes */}
              {!hasMoreAssets && assets.length > 0 && (
                <div className='text-center py-4 text-sm text-gray-500 dark:text-gray-400'>
                  No hay más imágenes
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex justify-between items-center'>
          <div className='flex gap-3'>
            <button
              onClick={() => {
                fetchFolders(currentPath)
                fetchAssets(currentPath)
              }}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loadingFolders || loadingAssets}
            >
              {loadingFolders || loadingAssets
                ? 'Actualizando...'
                : 'Actualizar'}
            </button>
            {hasMoreAssets && (
              <span className='text-xs text-gray-500 dark:text-gray-400 self-center'>
                Scroll para cargar más
              </span>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={handleUseSelectedImages}
              disabled={selectedImages.length === 0}
              className='px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Usar Imágenes Seleccionadas
            </button>
          </div>
        </div>

        {/* Hint de Drag & Drop */}
        {!isDragOver && (
          <div className='absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900/80 dark:bg-gray-700/80 text-white text-sm rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none'>
            📁 Arrastra imágenes para subir a esta carpeta
          </div>
        )}

        {/* Modal Crear Carpeta */}
        {showCreateModal && (
          <CreateFolderModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateFolder}
            parentPath={currentPath}
          />
        )}

        {/* Modal Confirmar Eliminar Carpeta */}
        {showDeleteConfirm && folderToDelete && (
          <DeleteFolderConfirm
            onClose={() => {
              setShowDeleteConfirm(false)
              setFolderToDelete(null)
            }}
            onSuccess={handleDeleteFolderSuccess}
            folderPath={folderToDelete.path}
            folderName={folderToDelete.name}
          />
        )}
      </div>
    </div>
  )
}

// Componente interno para tarjeta de imagen
interface ImageCardProps {
  image: CloudinaryImageExtended
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  onSelect,
  onDelete
}) => (
  <div
    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
      isSelected
        ? 'border-blue-500 ring-2 ring-blue-500/20'
        : 'border-gray-200 dark:border-gray-700'
    }`}
    onClick={onSelect}
  >
    <img
      src={image.secure_url}
      alt={image.public_id}
      className='h-40 w-full object-cover'
      loading='lazy'
    />
    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity'>
      <div className='absolute bottom-2 left-2 right-2'>
        <p className='text-xs text-white truncate'>
          {image.public_id.split('/').pop()}
        </p>
        <p className='text-xs text-gray-300'>
          {new Date(image.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    {isSelected && (
      <div className='absolute top-2 right-2'>
        <MdCheckCircle className='text-blue-500 text-2xl' />
      </div>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
      className='absolute top-2 left-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors'
    >
      <MdDelete size={14} />
    </button>
  </div>
)

export default CloudinaryGallery
