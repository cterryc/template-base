'use client'

import { useRef, useCallback } from 'react'

interface CacheData<T> {
  data: T
  timestamp: number
  etag: string
}

interface UseCacheOptions {
  ttl?: number // Time to live en milisegundos
  storageKey: string
}

interface UseCacheReturn<T> {
  getFromCache: () => CacheData<T> | null
  saveToCache: (data: T, etag: string) => void
  removeFromCache: () => void
  isCacheValid: (cacheData: CacheData<T> | null) => boolean
  cachedDataRef: React.MutableRefObject<CacheData<T> | null>
}

/**
 * Hook para manejar caché de datos en localStorage
 * 
 * @example
 * ```tsx
 * const { getFromCache, saveToCache, isCacheValid } = useCache<ConfigData>({
 *   storageKey: 'app_config_cache',
 *   ttl: 5 * 60 * 1000 // 5 minutos
 * })
 * ```
 */
export function useCache<T>({
  ttl = 5 * 60 * 1000,
  storageKey
}: UseCacheOptions): UseCacheReturn<T> {
  const cachedDataRef = useRef<CacheData<T> | null>(null)

  const getFromCache = useCallback((): CacheData<T> | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(storageKey)
      if (!cached) return null
      const parsed = JSON.parse(cached) as CacheData<T>

      // Verificar si el cache ha expirado
      const isExpired = Date.now() - parsed.timestamp > ttl
      if (isExpired) {
        localStorage.removeItem(storageKey)
        return null
      }

      return parsed
    } catch (error) {
      console.warn('Error reading from cache:', error)
      return null
    }
  }, [storageKey, ttl])

  const saveToCache = useCallback((data: T, etag: string) => {
    if (typeof window === 'undefined') return

    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        etag
      }
      localStorage.setItem(storageKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Error saving to cache:', error)
    }
  }, [storageKey])

  const removeFromCache = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(storageKey)
      cachedDataRef.current = null
    } catch (error) {
      console.warn('Error removing from cache:', error)
    }
  }, [storageKey])

  const isCacheValid = useCallback((cacheData: CacheData<T> | null): boolean => {
    if (!cacheData) return false
    return Date.now() - cacheData.timestamp <= ttl
  }, [ttl])

  return {
    getFromCache,
    saveToCache,
    removeFromCache,
    isCacheValid,
    cachedDataRef
  }
}
