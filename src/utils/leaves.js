// Helpers for the leaves module: counting days and working out balances.

import { LEAVE_TYPES } from '../data/sampleData.js'

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
    used[lv.type] = (used[lv.type] || 0) + countLeaveDays(lv.fromDate, lv.toDate)
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
  return leave?.status === 'pending'
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
