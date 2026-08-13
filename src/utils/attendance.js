// Helpers to turn raw time stamps into useful numbers for the screens.

import { ATTENDANCE_CORRECTION_ISSUES } from '../data/sampleData.js'

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

// Total break minutes for a record (includes open breaks up to now).
export function totalBreakMinutes(record, asOfIso = null) {
  if (!record || !record.breaks) return 0
  const now = asOfIso || new Date().toISOString()
  return record.breaks.reduce((sum, b) => {
    if (!b.start) return sum
    const end = b.end || now
    return sum + minutesBetween(b.start, end)
  }, 0)
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

// Was the person late? Compares time-in against office start + grace period.
// officeStartTime is a string like "09:30". lateGraceMinutes is minutes after that
// when arrival is still on time (e.g. start 09:30 + 20 min → late only after 09:50).
export function isLate(record, officeStartTime, lateGraceMinutes = 0) {
  if (!record || !record.timeIn || !officeStartTime) return false
  const [h, m] = officeStartTime.split(':').map((n) => parseInt(n, 10))
  const grace = Math.max(0, Number(lateGraceMinutes) || 0)
  const timeIn = toDate(record.timeIn)
  const limit = new Date(timeIn)
  limit.setHours(h, m + grace, 0, 0)
  return timeIn.getTime() > limit.getTime()
}

// A short status word for a record.
export function statusOf(record, officeStartTime, lateGraceMinutes = 0) {
  if (!record || !record.timeIn) return 'Absent'
  if (record.timeIn && !record.timeOut) return 'Present'
  return isLate(record, officeStartTime, lateGraceMinutes) ? 'Late' : 'On time'
}

// What is the employee doing right now (for the live buttons)?
// Returns one of: 'not-in', 'working', 'on-break', 'done'
export function currentState(record) {
  if (!record || !record.timeIn) return 'not-in'
  if (record.timeOut) return 'done'
  const openBreak = (record.breaks || []).some((b) => b.start && !b.end)
  return openBreak ? 'on-break' : 'working'
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function monthLabel(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
}

export function lastMonthKey(d = new Date()) {
  const x = new Date(d)
  x.setDate(1)
  x.setMonth(x.getMonth() - 1)
  return monthKey(x)
}

export function todayDateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const ATTENDANCE_STATS_PERIODS = [
  { key: 'this-month', label: 'This month' },
  { key: 'last-month', label: 'Last month' },
  { key: 'ytd', label: 'Year to date' },
  { key: 'since-joining', label: 'Since joining' }
]

export function statsPeriodLabel(period, joinDate) {
  switch (period) {
    case 'this-month':
      return `${monthLabel(monthKey())} (month to date)`
    case 'last-month':
      return monthLabel(lastMonthKey())
    case 'ytd':
      return `${new Date().getFullYear()} (year to date)`
    case 'since-joining':
      if (joinDate) {
        const d = new Date(`${joinDate}T00:00:00`)
        const joined = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
        return `Since ${joined}`
      }
      return 'Since joining'
    default:
      return period
  }
}

// Joining date from employee profile, or earliest attendance row as fallback.
export function resolveJoinDate(employee, records = []) {
  if (employee?.dateJoined) return employee.dateJoined
  const dates = records.map((r) => r.date).filter(Boolean).sort()
  return dates[0] || todayDateKey()
}

function recordInPeriod(record, period, { joinDate, todayDate }) {
  const date = record.date
  if (!date || date > todayDate) return false

  switch (period) {
    case 'this-month':
      return date.startsWith(monthKey()) && date <= todayDate
    case 'last-month':
      return date.startsWith(lastMonthKey())
    case 'ytd':
      return date >= `${todayDate.slice(0, 4)}-01-01` && date <= todayDate
    case 'since-joining':
      return date >= joinDate && date <= todayDate
    default:
      return true
  }
}

// Filter attendance rows for a stats period (this month, last month, YTD, since joining).
export function filterRecordsForStatsPeriod(records, period, options = {}) {
  const todayDate = options.todayDate || todayDateKey()
  const joinDate = options.joinDate || todayDate
  return records.filter((r) => recordInPeriod(r, period, { joinDate, todayDate }))
}

function clockMinutesFromIso(iso) {
  const d = toDate(iso)
  if (!d) return null
  return d.getHours() * 60 + d.getMinutes()
}

function formatAverageClock(avgMinutes) {
  if (avgMinutes == null || Number.isNaN(avgMinutes)) return '--'
  const total = Math.round(avgMinutes)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return formatClock(d.toISOString())
}

// Averages for a set of attendance rows (time in/out, break, worked).
export function computeAttendanceAverages(records) {
  const timeInMins = records.filter((r) => r.timeIn).map((r) => clockMinutesFromIso(r.timeIn))
  const timeOutMins = records.filter((r) => r.timeOut).map((r) => clockMinutesFromIso(r.timeOut))
  const breakMins = records.filter((r) => r.timeIn).map((r) => totalBreakMinutes(r))
  const workedMins = records.filter((r) => r.timeIn).map((r) => workedMinutes(r))

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  return {
    days: records.length,
    avgTimeIn: formatAverageClock(avg(timeInMins)),
    avgTimeOut: formatAverageClock(avg(timeOutMins)),
    avgBreak: avg(breakMins) != null ? formatMinutes(avg(breakMins)) : '--',
    avgWorked: avg(workedMins) != null ? formatMinutes(avg(workedMins)) : '--'
  }
}

// Month-to-date averages for an employee's attendance rows.
export function computeMonthAverages(records, month = monthKey()) {
  const inMonth = records.filter((r) => r.date && r.date.startsWith(month))
  return computeAttendanceAverages(inMonth)
}

// Raw numeric month averages (null when no data), used to sort tables
// whose displayed values are formatted strings.
export function computeMonthRawAverages(records, month = monthKey()) {
  const inMonth = records.filter((r) => r.date && r.date.startsWith(month))
  const timeInMins = inMonth.filter((r) => r.timeIn).map((r) => clockMinutesFromIso(r.timeIn))
  const timeOutMins = inMonth.filter((r) => r.timeOut).map((r) => clockMinutesFromIso(r.timeOut))
  const breakMins = inMonth.filter((r) => r.timeIn).map((r) => totalBreakMinutes(r))
  const workedMins = inMonth.filter((r) => r.timeIn).map((r) => workedMinutes(r))

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)

  return {
    avgTimeInMins: avg(timeInMins),
    avgTimeOutMins: avg(timeOutMins),
    avgBreakMins: avg(breakMins),
    avgWorkedMins: avg(workedMins)
  }
}

export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  const d = new Date(`${dateStr}T${timeStr}:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function correctionIssueLabel(key) {
  const i = ATTENDANCE_CORRECTION_ISSUES.find((x) => x.key === key)
  return i ? i.label : key
}
