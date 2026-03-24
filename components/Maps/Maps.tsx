'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from 'lucide-react'
import { FaRegTrashAlt } from 'react-icons/fa'

interface Position {
  lat: number
  lng: number
}

interface RouteInfo {
  distance: number
  duration: number
  coordinates: [number, number][]
}

interface InteractiveMapProps {
  setDeliveryCost: (cost: number) => void
  setGetlocation: (position: Position) => void
  locationToSend: Position | null
}

export default function InteractiveMap({
  setDeliveryCost,
  setGetlocation,
  locationToSend
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [userPosition, setUserPosition] = useState<Position | null>({
    lat: -12.0892609,
    lng: -77.0248411
  })
  const [destinationPosition, setDestinationPosition] =
    useState<Position | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setMapLoaded(true)
        }
        document.head.appendChild(script)
      } catch (error) {
        setError('Error cargando el mapa')
      }
    }

    loadLeaflet()
  }, [])

  const getLocationDevice = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          setError(
            'No se pudo obtener la ubicación. Usando ubicación por defecto.'
          )
          setUserPosition({
            lat: -12.0892609,
            lng: -77.0248411
          })
        }
      )
    } else {
      setError('Geolocalización no soportada por el navegador')
      setUserPosition({
        lat: -12.0892609,
        lng: -77.0248411
      })
    }
  }

  // Obtener ubicación del usuario
  useEffect(() => {
    getLocationDevice()
  }, [])

  // Manejar cambios en locationToSend (desde localStorage)
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      locationToSend &&
      (locationToSend.lat !== 0 || locationToSend.lng !== 0)
    ) {
      const { map, endIcon } = mapInstanceRef.current
      const L = (window as any).L

      if (
        destinationPosition &&
        destinationPosition.lat === locationToSend.lat &&
        destinationPosition.lng === locationToSend.lng
      ) {
        return
      }

      setDestinationPosition(locationToSend)

      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
      }

      const destinationMarker = L.marker(
        [locationToSend.lat, locationToSend.lng],
        { icon: endIcon }
      )
        .addTo(map)
        .bindPopup(
          '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
        )
        .openPopup()

      mapInstanceRef.current.destinationMarker = destinationMarker
      map.setView([locationToSend.lat, locationToSend.lng], 13)
    }
  }, [mapInstanceRef.current, locationToSend, destinationPosition])

  // Inicializar mapa
  useEffect(() => {
    if (
      mapLoaded &&
      userPosition &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      const L = (window as any).L

      const map = L.map(mapRef.current).setView(
        [userPosition.lat, userPosition.lng],
        13
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      const endIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      // Manejar clicks en el mapa
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        setGetlocation({ lat, lng })

        if (e.originalEvent) {
          e.originalEvent.stopPropagation()
        }
      })

      let initialDestinationMarker = null

      if (
        locationToSend &&
        (locationToSend.lat !== 0 || locationToSend.lng !== 0)
      ) {
        setDestinationPosition(locationToSend)
        initialDestinationMarker = L.marker(
          [locationToSend.lat, locationToSend.lng],
          { icon: endIcon }
        )
          .addTo(map)
          .bindPopup(
            '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
          )
          .openPopup()
      }

      mapInstanceRef.current = {
        map,
        endIcon,
        destinationMarker: initialDestinationMarker
      }
    }
  }, [mapLoaded, userPosition])

  // Calcular ruta usando OpenRouteService
  const calculateRoute = async () => {
    if (!destinationPosition) return

    // Ubicación fija para testing (Mercado Central de Lima)
    const testUserPosition = {
      lat: -11.993006368779662,
      lng: -77.04907178878786
    }

    setLoading(true)
    setError(null)

    try {
      const routeData = await getRouteFromORS(
        testUserPosition,
        destinationPosition
      )

      if (routeData) {
        displayRoute(routeData)
      } else {
        const fallbackRoute = calculateFallbackRoute(
          testUserPosition,
          destinationPosition
        )
        displayRoute(fallbackRoute)
      }
    } catch (error) {
      console.error('Error calculando ruta:', error)
      const fallbackRoute = calculateFallbackRoute(
        testUserPosition,
        destinationPosition
      )
      displayRoute(fallbackRoute)
    }

    setLoading(false)
  }

  // Manejar cambios en destinationPosition y calcular ruta
  useEffect(() => {
    if (mapInstanceRef.current && destinationPosition) {
      const { map, endIcon } = mapInstanceRef.current
      const L = (window as any).L

      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
      }

      const destinationMarker = L.marker(
        [destinationPosition.lat, destinationPosition.lng],
        { icon: endIcon }
      )
        .addTo(map)
        .bindPopup(
          '<div style="text-align: center;"><strong>Destino</strong><br><small>Punto de llegada</small></div>'
        )

      mapInstanceRef.current.destinationMarker = destinationMarker

      // Calcular ruta
      if (userPosition) {
        calculateRoute()
      }
    }
  }, [destinationPosition, userPosition])

  // Obtener ruta de OpenRouteService
  const getRouteFromORS = async (start: Position, end: Position) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62487d47185c1a574927a757648458453cc2&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
        {
          headers: {
            Accept:
              'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          }
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.features && data.features[0]) {
        const route = data.features[0]
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        )
        const distance = route.properties.segments[0].distance / 1000
        const duration = route.properties.segments[0].duration / 60

        return {
          distance,
          duration,
          coordinates
        }
      }

      return null
    } catch (error) {
      console.error('Error con OpenRouteService:', error)
      return null
    }
  }

  // Ruta de fallback
  const calculateFallbackRoute = (start: Position, end: Position) => {
    const distance = calculateStraightLineDistance(start, end)

    const coordinates: [number, number][] = []
    coordinates.push([start.lat, start.lng])

    const latDiff = end.lat - start.lat
    const lngDiff = end.lng - start.lng

    for (let i = 1; i < 4; i++) {
      const ratio = i / 4
      const intermediateLat =
        start.lat + latDiff * ratio + (Math.random() - 0.5) * 0.001
      const intermediateLng =
        start.lng + lngDiff * ratio + (Math.random() - 0.5) * 0.001
      coordinates.push([intermediateLat, intermediateLng])
    }

    coordinates.push([end.lat, end.lng])

    return {
      distance: distance * 1.3,
      duration: distance * 1.3 * 2,
      coordinates
    }
  }

  // Mostrar la ruta en el mapa y calcular costo
  const displayRoute = (routeData: RouteInfo) => {
    const { map } = mapInstanceRef.current

    if (mapInstanceRef.current.routeLine) {
      map.removeLayer(mapInstanceRef.current.routeLine)
    }

    // Calcular costo de delivery
    // Fórmula original: distancia * 1.2, redondeado hacia arriba
    const costDelivery = Math.ceil(routeData.distance * 10) / 10
    setDeliveryCost(Math.ceil(costDelivery * 1.2))

    setRouteInfo(routeData)
  }

  // Calcular distancia en línea recta
  const calculateStraightLineDistance = (
    pos1: Position,
    pos2: Position
  ): number => {
    const R = 6371
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
    const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  const resetRoute = () => {
    if (mapInstanceRef.current) {
      const { map } = mapInstanceRef.current

      if (mapInstanceRef.current.destinationMarker) {
        map.removeLayer(mapInstanceRef.current.destinationMarker)
        mapInstanceRef.current.destinationMarker = null
        setDeliveryCost(0)
      }

      if (mapInstanceRef.current.routeLine) {
        map.removeLayer(mapInstanceRef.current.routeLine)
        mapInstanceRef.current.routeLine = null
        setDeliveryCost(0)
      }
    }

    setDestinationPosition(null)
    setRouteInfo(null)
  }

  if (!mapLoaded || !userPosition) {
    return (
      <div className='w-full h-full flex items-center justify-center min-h-64'>
        <Card className='w-96'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Navigation className='h-5 w-5' />
              {!mapLoaded ? 'Cargando mapa...' : 'Obteniendo ubicación...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <p className='text-muted-foreground'>
              {!mapLoaded
                ? 'Cargando componentes del mapa...'
                : 'Por favor, permite el acceso a tu ubicación para continuar.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='relative w-full h-full min-h-64'>
      <div ref={mapRef} className='w-full h-full' />

      {/* Panel de información */}
      <div className='absolute bottom-4 right-4 z-[1000]'>
        <Card className='w-auto'>
          <CardContent className='space-y-3 p-0 m-0'>
            {!destinationPosition ? (
              <>
                {userPosition.lat === -12.0892609 &&
                userPosition.lng === -77.0248411 ? (
                  <button
                    type='button'
                    className='text-muted-foreground text-sm'
                    onClick={(e) => {
                      e.preventDefault()
                      getLocationDevice()
                    }}
                  >
                    Permitir acceso a la ubicacion
                  </button>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    Haz click en el mapa para seleccionar el destino
                  </p>
                )}
              </>
            ) : loading ? (
              <p className='text-muted-foreground text-sm'>
                Calculando ruta óptima...
              </p>
            ) : routeInfo ? (
              <>
                <Button
                  onClick={resetRoute}
                  variant='outline'
                  className='w-10'
                  size='sm'
                >
                  <FaRegTrashAlt className='' />
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
