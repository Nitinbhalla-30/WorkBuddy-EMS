// Helpers for the cab management module.

// Format a 24h time string like "08:30" into "08:30 AM".
export function formatTime12(time) {
  if (!time) return '--'
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export function directionLabel(dir) {
  return dir === 'drop' ? 'Drop' : 'Pickup'
}

// Format an ISO date-time into a short "20 Jul, 08:32 AM" style string.
export function formatDateTime(iso) {
  if (!iso) return '--'
  const d = new Date(iso)
  const date = d.toLocaleDateString([], { day: '2-digit', month: 'short' })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

// A short readable label for a trip, e.g. "Pickup 08:30 AM".
export function tripLabel(trip) {
  if (!trip) return '--'
  return `${directionLabel(trip.direction)} ${formatTime12(trip.time)}`
}

// Look up helpers (pass the arrays in to avoid circular imports).
export function vehicleById(vehicles, id) {
  return vehicles.find((v) => v.id === id) || null
}

export function driverById(drivers, id) {
  return drivers.find((d) => d.id === id) || null
}

export function tripById(trips, id) {
  return trips.find((t) => t.id === id) || null
}

// Request status display.
export function requestStatusLabel(status) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

export function requestStatusTagClass(status) {
  if (status === 'approved') return 'tag-ok'
  if (status === 'rejected') return 'tag-high'
  return 'tag-late'
}

// 5-hour rule: is it still early enough to request a change for a given date
// and pickup time? Returns true if the request is allowed.
export function isWithinDeadline(forDate, pickupTime) {
  if (!forDate || !pickupTime) return true // no time set, allow
  const [h, m] = pickupTime.split(':').map(Number)
  const pickup = new Date(`${forDate}T00:00:00`)
  pickup.setHours(h, m, 0, 0)
  const now = new Date()
  const diff = pickup.getTime() - now.getTime()
  return diff >= 5 * 60 * 60 * 1000 // at least 5 hours away
}

// Turn a saved map point into a link that opens in Google Maps.
// The driver taps this on their phone and presses "Navigate".
export function googleMapsUrl(point) {
  if (!point) return null
  return `https://www.google.com/maps?q=${point.lat},${point.lng}`
}
