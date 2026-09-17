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

const NO_DATES = new Set()
const NO_ROWS = []

// Work out the full salary breakdown for one employee from pre-grouped data:
// `presentDates` holds the 'YYYY-MM-DD' keys the employee clocked in on, and
// the emp* arrays hold only that employee's rows. computeSalary and
// computeSalaries build those parts from the shared collections.
function computeSalaryFromParts(employee, mKey, { presentDates, empLeaves, settings, empOvertime, empReimbursements }) {
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

    const onUnpaidLeave = empLeaves.some(
      (l) => !isPaidType(l.type) && key >= l.fromDate && key <= l.toDate
    )
    if (onUnpaidLeave) { lopDays++; continue }

    if (presentDates.has(key)) { presentDays++; continue }

    const onPaidLeave = empLeaves.some(
      (l) => isPaidType(l.type) && key >= l.fromDate && key <= l.toDate
    )
    if (onPaidLeave) { paidLeaveDays++; continue }

    lopDays++ // no attendance and no leave = absent
  }

  const perDay = dim > 0 ? gross / dim : 0
  const lopDeduction = Math.round(perDay * lopDays)
  const earnedGross = Math.max(0, gross - lopDeduction)

  // Overtime: approved hours x hourly rate x 2
  const overtimeHours = empOvertime.reduce((sum, r) => sum + (r.hours || 0), 0)
  const hourlyRate = gross / dim / 8 // standard 8-hour workday
  const overtimePay = Math.round(overtimeHours * hourlyRate * 2)

  // Reimbursements: approved claims for this month (based on approval date)
  const reimbursementAmount = empReimbursements.reduce((sum, r) => sum + (r.amount || 0), 0)

  const rules = settings.salary || {}
  const pf = Math.round(((rules.pfPercent || 0) / 100) * (s.basic || 0))
  const esiApplicable = gross > 0 && gross <= (rules.esiThreshold || 0)
  const esi = esiApplicable
    ? Math.round(((rules.esiPercent || 0) / 100) * earnedGross)
    : 0
  const tds = s.tdsMonthly || 0

  const totalDeductions = pf + esi + tds
  const netPay = Math.max(0, earnedGross + overtimePay + reimbursementAmount - totalDeductions)

  return {
    basic: s.basic || 0,
    hra: s.hra || 0,
    other: s.other || 0,
    gross,
    overtimeHours,
    overtimePay,
    reimbursementAmount,
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

// Full breakdown for one employee. The shared collections are scanned once to
// pull out this employee's rows, so the cost is linear in their size instead
// of one scan per working day.
export function computeSalary(employee, mKey, { attendance, leaves, settings, overtimeRequests, reimbursements }) {
  const presentDates = new Set()
  for (const r of attendance) {
    if (r.employeeId === employee.id && r.timeIn) presentDates.add(r.date)
  }
  return computeSalaryFromParts(employee, mKey, {
    presentDates,
    empLeaves: leaves.filter((l) => l.employeeId === employee.id && l.status === 'approved'),
    settings,
    empOvertime: (overtimeRequests || []).filter((r) =>
      r.employeeId === employee.id && r.monthKey === mKey && r.status === 'approved'
    ),
    empReimbursements: (reimbursements || []).filter((r) =>
      r.employeeId === employee.id &&
      (r.status === 'approved_unpaid' || r.status === 'paid') &&
      r.decidedOn && r.decidedOn.startsWith(mKey)
    )
  })
}

// Breakdowns for a whole payroll in one call. Grouping once matters: running
// computeSalary per employee against the full attendance array re-scanned it
// for every working day of every employee (~500 x 22 x 30,000 comparisons),
// which stalled the Salaries screen for seconds on open.
export function computeSalaries(employees, mKey, { attendance, leaves, settings, overtimeRequests, reimbursements }) {
  const presentByEmployee = new Map()
  for (const r of attendance) {
    if (!r.timeIn) continue
    let dates = presentByEmployee.get(r.employeeId)
    if (!dates) {
      dates = new Set()
      presentByEmployee.set(r.employeeId, dates)
    }
    dates.add(r.date)
  }

  const leavesByEmployee = new Map()
  for (const l of leaves) {
    if (l.status !== 'approved') continue
    let list = leavesByEmployee.get(l.employeeId)
    if (!list) {
      list = []
      leavesByEmployee.set(l.employeeId, list)
    }
    list.push(l)
  }

  const overtimeByEmployee = new Map()
  for (const r of overtimeRequests || []) {
    if (r.status !== 'approved' || r.monthKey !== mKey) continue
    let list = overtimeByEmployee.get(r.employeeId)
    if (!list) {
      list = []
      overtimeByEmployee.set(r.employeeId, list)
    }
    list.push(r)
  }

  const reimbursementsByEmployee = new Map()
  for (const r of reimbursements || []) {
    if (r.status !== 'approved_unpaid' && r.status !== 'paid') continue
    if (!r.decidedOn || !r.decidedOn.startsWith(mKey)) continue
    let list = reimbursementsByEmployee.get(r.employeeId)
    if (!list) {
      list = []
      reimbursementsByEmployee.set(r.employeeId, list)
    }
    list.push(r)
  }

  return employees.map((emp) =>
    computeSalaryFromParts(emp, mKey, {
      presentDates: presentByEmployee.get(emp.id) || NO_DATES,
      empLeaves: leavesByEmployee.get(emp.id) || NO_ROWS,
      settings,
      empOvertime: overtimeByEmployee.get(emp.id) || NO_ROWS,
      empReimbursements: reimbursementsByEmployee.get(emp.id) || NO_ROWS
    })
  )
}
