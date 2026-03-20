'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'
import { useCache } from '@/hooks/useCache'

// Tipos basados en tu esquema Prisma
interface Cupon {
  id: number
  codigoCupon: string
  mostrarCupon: boolean
  descuento: number
  createdAt: string
  updatedAt: string
}

interface Settings {
  [key: string]: string
}

interface ConfigMetadata {
  lastUpdated: string
  etag: string
  totalCupones: number
  totalSettings: number
}

interface ConfigData {
  settings: Settings
  cupones: Cupon[]
  metadata: ConfigMetadata
}

interface ConfigContextType {
  configData: ConfigData | null
  isLoading: boolean
  error: string | null
  refetchConfig: () => Promise<void>
  getSetting: (key: string, defaultValue?: string) => string
  getActiveCoupon: () => Cupon | null
  getCouponByCode: (code: string) => Cupon | null
  lastFetched: Date | null
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

const STORAGE_KEY = 'app_config_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configData, setConfigData] = useState<ConfigData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Usar hook de caché
  const { getFromCache, saveToCache, removeFromCache, cachedDataRef } = useCache<ConfigData>({
    storageKey: STORAGE_KEY,
    ttl: CACHE_TTL
  })

  // Función para obtener un setting con fallback a caché
  const getSettingWithCache = useCallback(
    (key: string, defaultValue: string = '') => {
      if (configData?.settings && configData.settings[key]) {
        return configData.settings[key]
      }
      if (cachedDataRef.current?.data?.settings && cachedDataRef.current.data.settings[key]) {
        return cachedDataRef.current.data.settings[key]
      }
      return defaultValue
    },
    [configData, cachedDataRef]
  )

  // Función principal para cargar configuración
  const loadConfig = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoading(true)
      setError(null)

      try {
        // Cargar caché inmediatamente (solo en cliente)
        let cachedData: ConfigData | null = null
        if (typeof window !== 'undefined') {
          const cacheResult = getFromCache()
          cachedDataRef.current = cacheResult

          if (cacheResult) {
            cachedData = cacheResult.data
            setConfigData(cachedData)
            setLastFetched(new Date(cacheResult.timestamp))
            // No marcar isLoading = false aquí, dejar que el fetch continúe
          }
        }

        // Hacer fetch al servidor
        abortControllerRef.current = new AbortController()

        const headers: HeadersInit = {}
        // Verificar si caché expiró (TTL de 5 minutos)
        const cacheExpired = cachedDataRef.current && 
          (Date.now() - cachedDataRef.current.timestamp > CACHE_TTL)
        
        // Solo usar etag si caché no ha expirado
        if (cachedDataRef.current?.etag && !forceRefresh && !cacheExpired) {
          headers['If-None-Match'] = cachedDataRef.current.etag
        }

        const response = await fetch('/api/config', {
          signal: abortControllerRef.current.signal,
          headers,
          cache: 'no-store'
        })

        // Si 304 Not Modified, mantener caché
        if (response.status === 304) {
          setIsLoading(false)
          return
        }

        // Si hay error y tenemos caché, mantenerlo
        if (!response.ok) {
          if (cachedData) {
            console.warn('Server error, using cached config')
            setIsLoading(false)
            return
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to load configuration')
        }

        console.log('result ConfigContext', result)

        const etag =
          response.headers.get('etag') ||
          result.data?.metadata?.etag ||
          `"${Date.now()}"`

        // Verificar si los datos cambiaron
        const currentEtag = cachedDataRef.current?.etag
        const hasChanged = !currentEtag || currentEtag !== etag

        if (hasChanged) {
          saveToCache(result.data, etag)
          setConfigData(result.data)
          setLastFetched(new Date())
        } else {
          console.log('Config unchanged (etag match)')
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error loading config:', error)
          setError(error.message)

          // Si no tenemos datos, establecer estructura vacía
          if (!configData && !cachedDataRef.current) {
            setConfigData({
              settings: {},
              cupones: [],
              metadata: {
                lastUpdated: new Date().toISOString(),
                etag: 'error-fallback',
                totalCupones: 0,
                totalSettings: 0
              }
            })
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getFromCache, saveToCache, cachedDataRef]
  )

  // Re-fetch manual
  const refetchConfig = useCallback(async () => {
    removeFromCache()
    await loadConfig(true)
  }, [loadConfig, removeFromCache])

  // Obtener cupón activo
  const getActiveCoupon = useCallback(() => {
    const data = configData || cachedDataRef.current?.data
    if (!data?.cupones || data.cupones.length === 0) return null
    return data.cupones.find((cupon) => cupon.mostrarCupon) || null
  }, [configData])

  // Buscar cupón por código
  const getCouponByCode = useCallback(
    (code: string) => {
      const data = configData || cachedDataRef.current?.data
      if (!data?.cupones || data.cupones.length === 0) return null
      return (
        data.cupones.find(
          (cupon) => cupon.codigoCupon.toLowerCase() === code.toLowerCase()
        ) || null
      )
    },
    [configData]
  )

  // Cargar configuración al montar
  useEffect(() => {
    loadConfig()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadConfig])

  return (
    <ConfigContext.Provider
      value={{
        configData,
        isLoading,
        error,
        refetchConfig,
        getSetting: getSettingWithCache,
        getActiveCoupon,
        getCouponByCode,
        lastFetched
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
