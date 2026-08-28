// Helpers for the leaves module: counting days and working out balances.

import { LEAVE_TYPES } from '../data/sampleData.js'
import { formatDate } from './attendance.js'

export const SICK_LEAVE_DOC_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

// Number of working days (Mon-Fri) between two dates, both included.
// Weekends do not count as leave.
export function countLeaveDays(fromDate, toDate) {
  if (!fromDate || !toDate) return 0
  const start = new Date(`${fromDate}T00:00:00`)
  const end = new Date(`${toDate}T00:00:00`)
  if (end < start) return 0

  let days = 0
  const d = new Date(start)
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days++
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Look up the friendly label for a leave type key.
export function leaveTypeLabel(key) {
  const t = LEAVE_TYPES.find((x) => x.key === key)
  return t ? t.label : key
}

// Partial-day leaves (half day, short leave) cover a single date and
// consume half a working day.
export function isPartialLeaveType(type) {
  const t = LEAVE_TYPES.find((x) => x.key === type)
  return Boolean(t?.partial)
}

export function leaveDayFraction(type) {
  return isPartialLeaveType(type) ? 0.5 : 1
}

// Total days a leave request consumes, honouring partial-day types.
export function leaveDays(leave) {
  if (!leave) return 0
  return countLeaveDays(leave.fromDate, leave.toDate) * leaveDayFraction(leave.type)
}

// "First half" / "Second half" for half-day leaves, else null.
export function leaveHalfLabel(leave) {
  if (leave?.type !== 'halfday') return null
  if (leave.halfDayPart === 'second') return 'Second half'
  // Default to first half if not specified
  return 'First half'
}

// Type label including the chosen half, e.g. "Half day (First half)".
export function leaveTypeLabelWithPart(leave) {
  const label = leaveTypeLabel(leave?.type)
  const half = leaveHalfLabel(leave)
  return half ? `${label} (${half.toLowerCase()})` : label
}

export function isPaidType(key) {
  const t = LEAVE_TYPES.find((x) => x.key === key)
  return t ? t.paid : false
}

// Days already used (approved) this year, grouped by leave type.
export function usedDaysByType(leaves) {
  const year = new Date().getFullYear()
  const used = {}
  for (const t of LEAVE_TYPES) used[t.key] = 0

  for (const lv of leaves) {
    if (lv.status !== 'approved') continue
    const y = new Date(`${lv.fromDate}T00:00:00`).getFullYear()
    if (y !== year) continue
    // Partial-day leaves are allotted by count, so each approved request uses one.
    const amount = isPartialLeaveType(lv.type) ? 1 : leaveDays(lv)
    used[lv.type] = (used[lv.type] || 0) + amount
  }
  return used
}

// Build a balance summary for the paid leave types.
// Returns [{ key, label, allowed, used, remaining }]
export function leaveBalance(leaves, allowance) {
  const used = usedDaysByType(leaves)
  return LEAVE_TYPES.filter((t) => t.paid).map((t) => {
    const allowed = (allowance && allowance[t.key]) || 0
    const u = used[t.key] || 0
    return {
      key: t.key,
      label: t.label,
      allowed,
      used: u,
      remaining: Math.max(0, allowed - u)
    }
  })
}

// Colour tag class for a status word.
export function statusTagClass(status) {
  if (status === 'approved') return 'tag-ok'
  if (status === 'rejected') return 'tag-late'
  if (status === 'withdrawn') return 'tag-absent'
  return 'tag-absent' // pending
}

export function canEditLeave(leave) {
  // Once the manager has approved, the request is locked for editing
  // (it is with HR for final approval). Withdrawal is still allowed.
  return leave?.status === 'pending' && leave?.managerStatus !== 'approved'
}

export function canWithdrawLeave(leave) {
  return leave?.status === 'pending'
}

export function leaveSupportingDocuments(leave) {
  return Array.isArray(leave?.supportingDocuments) ? leave.supportingDocuments : []
}

export function sickLeaveRequiresDocument(type) {
  return type === 'sick'
}

// ---- probation & two-stage approval workflow ----

function todayKey() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function toKey(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Date the employee's probation ends (dateJoined + probationMonths), or null.
export function probationEndDate(employee, settings) {
  if (!employee?.dateJoined) return null
  const d = new Date(`${employee.dateJoined}T00:00:00`)
  d.setMonth(d.getMonth() + Number(settings?.probationMonths || 0))
  return toKey(d)
}

export function isOnProbation(employee, settings) {
  const end = probationEndDate(employee, settings)
  if (!end) return false
  return todayKey() < end
}

// Current approval stage of a pending request: manager first, then HR.
// Requests created before the two-stage flow (no stage field) sit with HR.
export function leaveStage(leave) {
  if (leave?.status !== 'pending') return null
  return leave.stage === 'manager' ? 'manager' : 'hr'
}

export function leaveStageLabel(leave) {
  const stage = leaveStage(leave)
  if (!stage) return null
  return stage === 'manager' ? 'With manager' : 'With HR'
}

// True once the manager's response window (appliedOn + leaveManagerDays) has passed.
export function isManagerLeaveExpired(leave, settings) {
  if (leaveStage(leave) !== 'manager') return false
  const days = Number(settings?.leaveManagerDays || 0)
  const d = new Date(`${leave.appliedOn}T00:00:00`)
  d.setDate(d.getDate() + days)
  return todayKey() > toKey(d)
}

// Guard for paid-leave applications: probation must be over and balance enough.
// Returns an error message, or null when the employee may apply.
export function paidLeaveApplyError({ employee, leaves, settings, type, fromDate, toDate }) {
  if (!isPaidType(type)) return null

  const probationEnd = probationEndDate(employee, settings)
  if (probationEnd && todayKey() < probationEnd) {
    return `You are on probation until ${formatDate(probationEnd)}. Paid leave can be applied only after probation ends.`
  }

  const requested = isPartialLeaveType(type) ? 1 : countLeaveDays(fromDate, toDate)
  if (requested <= 0) return null
  const row = leaveBalance(leaves, settings?.leaveAllowance).find((b) => b.key === type)
  if (row && requested > row.remaining) {
    const unit = isPartialLeaveType(type) ? 'leave(s)' : 'day(s)'
    return `You have only ${row.remaining} ${row.label.toLowerCase()} ${unit} left, but this request needs ${requested}.`
  }
  return null
}
