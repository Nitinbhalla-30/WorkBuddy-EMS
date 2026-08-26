import { formatDate } from './attendance.js'
import { leaveDays, leaveTypeLabelWithPart, leaveSupportingDocuments } from './leaves.js'

export function leaveStatusLabel(leaveOrStatus) {
  // Accept either a leave object or a plain status string for backwards compatibility.
  const status = typeof leaveOrStatus === 'string' ? leaveOrStatus : leaveOrStatus?.status
  const stage = typeof leaveOrStatus === 'object' ? leaveOrStatus?.stage : null
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'withdrawn') return 'Withdrawn'
  if (status === 'pending') {
    if (stage === 'hr') return 'Pending (HR)'
    return 'Pending (Manager)'
  }
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
    type: leaveTypeLabelWithPart(leave),
    from: leave.fromDate,
    to: leave.toDate,
    days: leaveDays(leave),
    reason: leave.reason,
    appliedOn: leave.appliedOn,
    documents: leaveSupportingDocuments(leave)
  }
}
