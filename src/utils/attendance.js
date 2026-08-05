// Helpers to turn raw time stamps into useful numbers for the screens.

function toDate(iso) {
  return iso ? new Date(iso) : null
}

// Difference between two ISO times in minutes (0 if missing).
function minutesBetween(startIso, endIso) {
  const s = toDate(startIso)
  const e = toDate(endIso)
  if (!s || !e) return 0
  return Math.max(0, Math.round((e - s) / 60000))
}

// Total break minutes for a record.
export function totalBreakMinutes(record) {
  if (!record || !record.breaks) return 0
  return record.breaks.reduce(
    (sum, b) => sum + minutesBetween(b.start, b.end),
    0
  )
}

// Worked minutes = (time out - time in) - break time.
// If the person has not timed out yet, we count up to "now".
export function workedMinutes(record) {
  if (!record || !record.timeIn) return 0
  const end = record.timeOut || new Date().toISOString()
  const gross = minutesBetween(record.timeIn, end)
  return Math.max(0, gross - totalBreakMinutes(record))
}

// Turn minutes into a friendly "7h 45m" style string.
export function formatMinutes(mins) {
  const m = Math.max(0, Math.round(mins))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}m`
  return `${h}h ${r}m`
}

// Show a time like "09:32 AM". Returns "--" when missing.
export function formatClock(iso) {
  const d = toDate(iso)
  if (!d) return '--'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Show a date like "Mon, 20 Jul".
export function formatDate(dateKey) {
  if (!dateKey) return '--'
  const d = new Date(`${dateKey}T00:00:00`)
  return d.toLocaleDateString([], {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  })
}

// Was the person late? Compares time-in against the office start time.
// officeStartTime is a string like "09:30".
export function isLate(record, officeStartTime) {
  if (!record || !record.timeIn || !officeStartTime) return false
  const [h, m] = officeStartTime.split(':').map((n) => parseInt(n, 10))
  const timeIn = toDate(record.timeIn)
  const limit = new Date(timeIn)
  limit.setHours(h, m, 0, 0)
  return timeIn.getTime() > limit.getTime()
}

// A short status word for a record.
export function statusOf(record, officeStartTime) {
  if (!record || !record.timeIn) return 'Absent'
  if (record.timeIn && !record.timeOut) return 'Present'
  return isLate(record, officeStartTime) ? 'Late' : 'On time'
}

// What is the employee doing right now (for the live buttons)?
// Returns one of: 'not-in', 'working', 'on-break', 'done'
export function currentState(record) {
  if (!record || !record.timeIn) return 'not-in'
  if (record.timeOut) return 'done'
  const openBreak = (record.breaks || []).some((b) => b.start && !b.end)
  return openBreak ? 'on-break' : 'working'
}
