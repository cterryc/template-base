'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  MdSearch,
  MdRemoveRedEye,
  MdDelete,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
  MdCheckCircle,
  MdCancel,
  MdRateReview,
  MdPerson,
  MdStar
} from 'react-icons/md'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

interface Review {
  id: number
  rating: number
  comment: string | null
  aiApproved: boolean | null
  aiModerated: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  producto: {
    name: string
    image: string
  }
}

interface ApiResponse {
  data: Review[]
  pagination: {
    total: number
    page: number
    totalPages: number
    limit: number
  }
}

const ReviewsManagement: React.FC = () => {
  const { isLoaded } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pagination, setPagination] = useState<ApiResponse['pagination']>({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10
  })

  // Estados para Funcionalidad
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchReviews = useCallback(
    async (page: number = 1, search: string = '', showLoading: boolean = true) => {
      if (showLoading) setLoading(true)
      try {
        const queryParam = `page=${page}&limit=10&search=${encodeURIComponent(search)}`
        const response = await fetch(`/api/admin/reviews?${queryParam}`)
        if (!response.ok) throw new Error('Error al obtener reseñas')
        const result: ApiResponse = await response.json()

        setReviews(result.data)
        setPagination(result.pagination)
        setCurrentPage(result.pagination.page)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        toast.error('No se pudieron cargar las reseñas')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const delayDebounceFn = setTimeout(
      () => {
        fetchReviews(currentPage, searchTerm, true)
      },
      searchTerm ? 500 : 0
    )

    return () => clearTimeout(delayDebounceFn)
  }, [currentPage, searchTerm, fetchReviews])

  const handleUpdateStatus = async (id: number, approved: boolean | null) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiApproved: approved, aiModerated: true })
      })

      if (!response.ok) throw new Error('Error al actualizar reseña')

      toast.success(approved === true ? 'Reseña aprobada' : approved === false ? 'Reseña rechazada' : 'Reseña pendiente')
      
      // Actualizar estado local
      setReviews(prev => prev.map(r => r.id === id ? { ...r, aiApproved: approved, aiModerated: true } : r))
      if (selectedReview?.id === id) {
        setSelectedReview(prev => prev ? { ...prev, aiApproved: approved, aiModerated: true } : null)
      }
    } catch (error) {
      toast.error('No se pudo actualizar la reseña')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta reseña? Esta acción es irreversible.')) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== id))
        setPagination(prev => ({ ...prev, total: prev.total - 1 }))
        toast.success('Reseña eliminada')
        if (selectedReview?.id === id) setSelectedReview(null)
        
        if (reviews.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1)
        } else {
          fetchReviews(currentPage, searchTerm, false)
        }
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error('No se pudo eliminar la reseña')
    } finally {
      setIsDeleting(null)
    }
  }

  // Paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <main className='flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 pb-12'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:p-8'>
        {/* Header & Search */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-3xl'>
              Gestión de Reseñas
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Modera y administra las opiniones de los clientes.
            </p>
          </div>
          <div className='relative w-full sm:w-80'>
            <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl dark:text-gray-500' />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500'
              placeholder='Buscar por usuario, producto o comentario...'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <MdClose />
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
          <div>
            Mostrando <span className='font-bold'>{reviews.length}</span> de <span className='font-bold'>{pagination.total}</span> reseñas
          </div>
          <div>
            Página <span className='font-bold'>{currentPage}</span> de <span className='font-bold'>{pagination.totalPages}</span>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
                <tr>
                  <th className='px-6 py-4 font-bold'>Producto</th>
                  <th className='px-6 py-4 font-bold'>Usuario</th>
                  <th className='px-6 py-4 font-bold'>Calificación</th>
                  <th className='px-6 py-4 font-bold'>Estado</th>
                  <th className='px-6 py-4 font-bold'>Fecha</th>
                  <th className='px-6 py-4 text-right font-bold'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                {loading ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='flex justify-center'>
                        <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                      </div>
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>
                      No se encontraron reseñas.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className='hover:bg-gray-50 transition-colors group dark:hover:bg-gray-700/30'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <img src={review.producto.image} alt='' className='h-8 w-8 rounded-lg object-cover' />
                          <span className='font-medium text-gray-900 dark:text-white truncate max-w-[150px]'>
                            {review.producto.name}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-gray-900 dark:text-white'>{review.user.name || 'Usuario'}</span>
                          <span className='text-xs text-gray-400'>{review.user.email}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-0.5 text-yellow-500 font-bold'>
                          {review.rating} <MdStar className='text-lg' />
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          review.aiApproved === true ? 'bg-emerald-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          review.aiApproved === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {review.aiApproved === true ? 'Aprobado' : review.aiApproved === false ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-gray-500 dark:text-gray-400'>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
                          <button
                            onClick={() => setSelectedReview(review)}
                            className='p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors'
                          >
                            <MdRemoveRedEye size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className='p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors'
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación (Simplificada) */}
        {pagination.totalPages > 1 && (
          <div className='flex items-center justify-center gap-4'>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className='p-2 border rounded-lg disabled:opacity-50'
            >
              <MdChevronLeft size={20} />
            </button>
            <span className='text-sm font-medium'>{currentPage} / {pagination.totalPages}</span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className='p-2 border rounded-lg disabled:opacity-50'
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modal de Detalles / Moderación */}
      {selectedReview && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col dark:bg-gray-800'>
            <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
              <h3 className='text-xl font-bold dark:text-white'>Detalle de Reseña</h3>
              <button onClick={() => setSelectedReview(null)} className='p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700'>
                <MdClose size={24} />
              </button>
            </div>

            <div className='p-6 space-y-6 overflow-y-auto max-h-[70vh]'>
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl dark:bg-gray-700/30'>
                <img src={selectedReview.producto.image} className='h-16 w-16 rounded-lg object-cover' alt='' />
                <div>
                  <p className='font-bold dark:text-white'>{selectedReview.producto.name}</p>
                  <div className='flex items-center text-yellow-500'>
                    {[1,2,3,4,5].map(s => (
                      <MdStar key={s} className={s <= selectedReview.rating ? 'fill-current' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-xs font-bold text-gray-400 uppercase'>Comentario</p>
                <p className='text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg italic'>
                  "{selectedReview.comment || 'Sin comentario'}"
                </p>
              </div>

              <div className='flex items-center justify-between border-t pt-6'>
                <div className='flex flex-col'>
                  <span className='text-xs font-bold text-gray-400 uppercase'>Acciones de Moderación</span>
                  <p className='text-sm text-gray-500'>Cambia el estado de visibilidad.</p>
                </div>
                <div className='flex gap-2'>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedReview.id, true)}
                    className={`p-2 rounded-lg transition-colors ${selectedReview.aiApproved === true ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600 dark:bg-gray-700'}`}
                    title='Aprobar'
                  >
                    <MdCheckCircle size={24} />
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedReview.id, false)}
                    className={`p-2 rounded-lg transition-colors ${selectedReview.aiApproved === false ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700'}`}
                    title='Rechazar'
                  >
                    <MdCancel size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className='p-6 bg-gray-50 dark:bg-gray-700/30 flex justify-end gap-3'>
              <button
                onClick={() => handleDelete(selectedReview.id)}
                className='px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2'
              >
                <MdDelete size={18} /> Eliminar Permanente
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className='px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 dark:bg-gray-700'
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default ReviewsManagement
