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
  let d
  // Date-only string "YYYY-MM-DD" — parse as local time to avoid UTC midnight shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, day] = iso.split('-').map(Number)
    d = new Date(y, m - 1, day)
  } else {
    d = new Date(iso)
  }
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
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
  if (status === 'withdrawn') return 'Withdrawn'
  return 'Pending'
}

export function requestStatusTagClass(status) {
  if (status === 'approved') return 'tag-ok'
  if (status === 'rejected') return 'tag-high'
  if (status === 'withdrawn') return 'tag-absent' // grey — app-wide withdrawn convention
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

// Today-change cutoff: an employee may skip (or un-skip) today's pickup until
// `cutoffHours` before the shift start, and today's drop until `cutoffHours`
// before the shift end. Returns true while the change is still allowed.
export function isTodayChangeOpen(shiftTime, cutoffHours) {
  if (!shiftTime) return true // no shift time known, allow
  const [h, m] = shiftTime.split(':').map(Number)
  const shift = new Date()
  shift.setHours(h, m, 0, 0)
  const cutoffMs = (Number(cutoffHours) || 0) * 60 * 60 * 1000
  return shift.getTime() - Date.now() >= cutoffMs
}

// The clock time at which today's changes close, e.g. "06:30 AM".
export function todayChangeDeadline(shiftTime, cutoffHours) {
  if (!shiftTime) return null
  const [h, m] = shiftTime.split(':').map(Number)
  const shift = new Date()
  shift.setHours(h, m, 0, 0)
  const deadline = new Date(shift.getTime() - (Number(cutoffHours) || 0) * 60 * 60 * 1000)
  const hh = String(deadline.getHours()).padStart(2, '0')
  const mm = String(deadline.getMinutes()).padStart(2, '0')
  return formatTime12(`${hh}:${mm}`)
}

// Turn a saved map point into a link that opens in Google Maps.
// The driver taps this on their phone and presses "Navigate".
export function googleMapsUrl(point) {
  if (!point) return null
  return `https://www.google.com/maps?q=${point.lat},${point.lng}`
}
