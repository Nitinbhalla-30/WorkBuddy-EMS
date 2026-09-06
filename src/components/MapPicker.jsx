import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet's default marker icons need their paths fixed when bundled by Vite.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// Rough centre of India so the map opens somewhere sensible; the employee
// drags the pin (or clicks the map) to their exact spot.
const DEFAULT_CENTER = [22.5, 80]
const DEFAULT_ZOOM = 5

// A small map the employee uses to pick a point.
// Props:
//   value    - { lat, lng } or null
//   onChange  - function({ lat, lng })
export default function MapPicker({ value, onChange }) {
  const mapDiv = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  // Keep the latest onChange without re-creating the map.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const start = value ? [value.lat, value.lng] : DEFAULT_CENTER
    const zoom = value ? 16 : DEFAULT_ZOOM

    const map = L.map(mapDiv.current).setView(start, zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    const marker = L.marker(start, { draggable: true }).addTo(map)

    function emit(latlng) {
      onChangeRef.current({ lat: latlng.lat, lng: latlng.lng })
    }
    marker.on('dragend', () => emit(marker.getLatLng()))
    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      emit(e.latlng)
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Map is created once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If the value changes from outside, move the pin to match.
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLatLng([value.lat, value.lng])
    }
  }, [value])

  return <div ref={mapDiv} className="map-picker" />
}
