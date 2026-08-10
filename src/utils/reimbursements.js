import { REIMBURSEMENT_CATEGORIES, REIMBURSEMENT_STATUSES } from '../data/sampleData.js'
import { formatRupees } from './salary.js'

export function categoryLabel(key) {
  const normalized = key === 'convenience' ? 'conveyance' : key
  const c = REIMBURSEMENT_CATEGORIES.find((x) => x.key === normalized)
  return c ? c.label : key
}

export function statusLabel(status) {
  const s = REIMBURSEMENT_STATUSES.find((x) => x.key === status)
  return s ? s.label : status
}

export function statusTagClass(status) {
  if (status === 'paid') return 'tag-ok'
  if (status === 'approved_unpaid') return 'tag-medium'
  if (status === 'rejected') return 'tag-late'
  if (status === 'withdrawn') return 'tag-absent'
  return 'tag-absent' // pending
}

export function canEditReimbursement(claim) {
  return claim?.status === 'pending'
}

export function canWithdrawReimbursement(claim) {
  return claim?.status === 'pending'
}

export function formatAmount(amount) {
  return formatRupees(amount)
}

export function isApproved(status) {
  return status === 'approved_unpaid' || status === 'paid'
}

// Summary totals for an employee's claims.
export function reimbursementSummary(claims) {
  const year = new Date().getFullYear()
  let pendingCount = 0
  let pendingAmount = 0
  let approvedUnpaidCount = 0
  let approvedUnpaidAmount = 0
  let paidThisYear = 0

  for (const c of claims) {
    if (c.status === 'pending') {
      pendingCount++
      pendingAmount += c.amount || 0
    } else if (c.status === 'approved_unpaid') {
      approvedUnpaidCount++
      approvedUnpaidAmount += c.amount || 0
    } else if (c.status === 'paid') {
      const paidYear = c.paidOn ? new Date(c.paidOn).getFullYear() : null
      if (paidYear === year) paidThisYear += c.amount || 0
    }
  }

  return {
    pendingCount,
    pendingAmount,
    approvedUnpaidCount,
    approvedUnpaidAmount,
    paidThisYear
  }
}
