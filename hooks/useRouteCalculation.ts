'use client'

import { useState, useCallback, useEffect } from 'react'

interface Position {
  lat: number
  lng: number
}

interface RouteInfo {
  distance: number
  duration: number
  coordinates: [number, number][]
}

interface RouteCalculationResult {
  routeInfo: RouteInfo | null
  isLoading: boolean
  error: string | null
  calculateRoute: (start: Position, end: Position) => Promise<void>
  clearRoute: () => void
}

/**
 * Hook para calcular rutas entre dos puntos usando OpenRouteService
 *
 * @example
 * ```tsx
 * const { routeInfo, isLoading, calculateRoute } = useRouteCalculation()
 *
 * useEffect(() => {
 *   if (userPosition && destinationPosition) {
 *     calculateRoute(userPosition, destinationPosition)
 *   }
 * }, [userPosition, destinationPosition])
 * ```
 */
export function useRouteCalculation(): RouteCalculationResult {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateRoute = useCallback(async (start: Position, end: Position) => {
    setIsLoading(true)
    setError(null)

    try {
      // Intentar con OpenRouteService primero
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${process.env.NEXT_PUBLIC_ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
      )

      if (response.ok) {
        const data = await response.json()
        const route = data.features[0]
        const coordinates = route.geometry.coordinates

        setRouteInfo({
          distance: route.properties.segments[0].distance / 1000, // km
          duration: route.properties.segments[0].duration / 60, // minutos
          coordinates
        })
      } else {
        // Fallback a OSRM si ORS falla
        const orsmResponse = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        )

        if (orsmResponse.ok) {
          const orsmData = await orsmResponse.json()
          const route = orsmData.routes[0]

          setRouteInfo({
            distance: route.distance / 1000,
            duration: route.duration / 60,
            coordinates: route.geometry.coordinates
          })
        } else {
          throw new Error('No se pudo calcular la ruta')
        }
      }
    } catch {
      setError('Error calculando la ruta')
      setRouteInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearRoute = useCallback(() => {
    setRouteInfo(null)
    setError(null)
  }, [])

  return {
    routeInfo,
    isLoading,
    error,
    calculateRoute,
    clearRoute
  }
}

/**
 * Hook para calcular el costo de delivery basado en distancia
 *
 * @param distance - Distancia en kilómetros
 * @param minimoDelivery - Costo mínimo
 * @param maximoDelivery - Costo máximo
 * @returns Costo calculado
 */
export function useDeliveryCost(
  distance: number | null,
  minimoDelivery: number,
  maximoDelivery: number
): number {
  const [deliveryCost, setDeliveryCost] = useState(0)

  useEffect(() => {
    if (distance && distance > 0) {
      // S/ 1.5 por km, con mínimo y máximo
      const calculated = distance * 1.5
      const adjusted = Math.max(
        minimoDelivery,
        Math.min(maximoDelivery, calculated)
      )
      setDeliveryCost(adjusted)
    }
  }, [distance, minimoDelivery, maximoDelivery])

  return deliveryCost
}
