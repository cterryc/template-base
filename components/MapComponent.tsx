import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

interface MapComponentProps {
  center: LatLngExpression
  zoom: number
  onLocationSelected: (lat: number, lng: number) => void
}

function LocationMarker({
  onLocationSelected
}: {
  onLocationSelected: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      onLocationSelected(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    }
  })

  return null
}

export default function MapComponent({
  center,
  zoom,
  onLocationSelected
}: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={center as LatLngExpression} />
      <LocationMarker onLocationSelected={onLocationSelected} />
    </MapContainer>
  )
}
