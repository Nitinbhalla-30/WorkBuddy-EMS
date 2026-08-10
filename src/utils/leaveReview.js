import { formatDate } from './attendance.js'
import { countLeaveDays, leaveTypeLabel, leaveSupportingDocuments } from './leaves.js'

export function leaveStatusLabel(status) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'withdrawn') return 'Withdrawn'
  return 'Pending'
}

export function leaveDecisionText(leave, nameOf) {
  if (!leave?.decidedBy || leave.status === 'pending') return null

  const name = nameOf(leave.decidedBy) || leave.decidedBy
  const on = leave.decidedOn ? formatDate(leave.decidedOn) : '--'

  if (leave.status === 'approved') {
    return { line: `Approved by ${name} on ${on}`, reason: null }
  }

  if (leave.status === 'rejected') {
    const reason = leave.rejectionReason?.trim()
    return {
      line: `Rejected by ${name} on ${on}`,
      reason: reason || 'No reason was recorded.'
    }
  }

  return null
}

export function leaveSummaryLines(leave) {
  return {
    type: leaveTypeLabel(leave.type),
    from: leave.fromDate,
    to: leave.toDate,
    days: countLeaveDays(leave.fromDate, leave.toDate),
    reason: leave.reason,
    appliedOn: leave.appliedOn,
    documents: leaveSupportingDocuments(leave)
  }
}
