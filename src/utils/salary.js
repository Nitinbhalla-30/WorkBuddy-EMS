// Salary calculation for one employee for one month.
//
// Steps:
//   gross            = basic + hra + other
//   one day's pay    = gross / days in that month
//   loss of pay      = (unpaid-leave days + absent days) * one day's pay
//   earned gross     = gross - loss of pay
//   PF               = pfPercent% of basic
//   ESI              = esiPercent% of earned gross (only if gross <= threshold)
//   TDS              = the fixed monthly amount set for the employee
//   net pay          = earned gross - (PF + ESI + TDS)

import { isPaidType } from './leaves.js'

function pad(n) {
  return String(n).padStart(2, '0')
}

// "YYYY-MM" for a date (defaults to today).
export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

// Number of days in a month given "YYYY-MM".
export function daysInMonth(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// A friendly month label like "July 2026".
export function monthLabel(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  })
}

// A list of the last `n` months for a dropdown: [{ key, label }].
export function listRecentMonths(n = 6) {
  const out = []
  const d = new Date()
  for (let i = 0; i < n; i++) {
    const mk = monthKey(d)
    out.push({ key: mk, label: monthLabel(mk) })
    d.setMonth(d.getMonth() - 1)
  }
  return out
}

// Show a number as Indian rupees, e.g. 32000 -> "₹32,000".
export function formatRupees(n) {
  const v = Math.round(n || 0)
  return '₹' + v.toLocaleString('en-IN')
}

// Work out the full salary breakdown for an employee in a month.
export function computeSalary(employee, mKey, { attendance, leaves, settings }) {
  const s = employee.salary || { basic: 0, hra: 0, other: 0, tdsMonthly: 0 }
  const gross = (s.basic || 0) + (s.hra || 0) + (s.other || 0)
  const dim = daysInMonth(mKey)
  const [y, m] = mKey.split('-').map(Number)

  // How far into the month do we count? Current month stops at yesterday
  // (today is still open). Past months use the whole month.
  const today = new Date()
  const isCurrent = monthKey(today) === mKey
  const monthStart = new Date(y, m - 1, 1)
  let lastDay
  if (monthStart > today) lastDay = 0            // future month
  else if (isCurrent) lastDay = today.getDate() - 1
  else lastDay = dim

  let workingDays = 0
  let presentDays = 0
  let paidLeaveDays = 0
  let lopDays = 0

  for (let day = 1; day <= lastDay; day++) {
    const dt = new Date(y, m - 1, day)
    const dow = dt.getDay()
    if (dow === 0 || dow === 6) continue // weekend
    workingDays++
    const key = `${y}-${pad(m)}-${pad(day)}`

    const onUnpaidLeave = leaves.some(
      (l) =>
        l.employeeId === employee.id &&
        l.status === 'approved' &&
        !isPaidType(l.type) &&
        key >= l.fromDate &&
        key <= l.toDate
    )
    if (onUnpaidLeave) { lopDays++; continue }

    const wasPresent = attendance.some(
      (r) => r.employeeId === employee.id && r.date === key && r.timeIn
    )
    if (wasPresent) { presentDays++; continue }

    const onPaidLeave = leaves.some(
      (l) =>
        l.employeeId === employee.id &&
        l.status === 'approved' &&
        isPaidType(l.type) &&
        key >= l.fromDate &&
        key <= l.toDate
    )
    if (onPaidLeave) { paidLeaveDays++; continue }

    lopDays++ // no attendance and no leave = absent
  }

  const perDay = dim > 0 ? gross / dim : 0
  const lopDeduction = Math.round(perDay * lopDays)
  const earnedGross = Math.max(0, gross - lopDeduction)

  const rules = settings.salary || {}
  const pf = Math.round(((rules.pfPercent || 0) / 100) * (s.basic || 0))
  const esiApplicable = gross > 0 && gross <= (rules.esiThreshold || 0)
  const esi = esiApplicable
    ? Math.round(((rules.esiPercent || 0) / 100) * earnedGross)
    : 0
  const tds = s.tdsMonthly || 0

  const totalDeductions = pf + esi + tds
  const netPay = Math.max(0, earnedGross - totalDeductions)

  return {
    basic: s.basic || 0,
    hra: s.hra || 0,
    other: s.other || 0,
    gross,
    daysInMonth: dim,
    perDay,
    workingDays,
    presentDays,
    paidLeaveDays,
    lopDays,
    lopDeduction,
    earnedGross,
    pf,
    esi,
    esiApplicable,
    tds,
    totalDeductions,
    netPay
  }
}
