// Build attention alerts for an employee from live module data.
// Read/unread is tracked separately in the store.

import {
  getAnnouncementsForEmployee,
  getAttendanceCorrections,
  getAttendanceCorrectionsForEmployee,
  getDismissedNotificationIds,
  getEmployeeById,
  getITIssues,
  getITIssuesForEmployee,
  getLeaves,
  getLeavesForEmployee,
  getOvertimeRequests,
  getOvertimeRequestsForEmployee,
  getProfileForEmployee,
  getProfiles,
  getReadNotificationIds,
  getReimbursements,
  getReimbursementsForEmployee,
  getShiftById,
  getShiftChangeRequests,
  getShiftChangeRequestsForEmployee,
  getTasks,
  getTasksForAssignee,
  getTeamConversations,
  getTickets,
  getTicketsForEmployee,
  isAnnouncementRead
} from '../data/store.js'
import { correctionIssueLabel } from './attendance.js'
import { leaveTypeLabel } from './leaves.js'
import { monthLabel } from './salary.js'
import { isSelfAssigned } from './tasks.js'

function toTimestamp(val) {
  if (!val) return 0
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  return new Date(val).getTime() || 0
}

// Returns true if the value is a date-only string (e.g., "2026-08-26")
// without a time component. These show as 12:00 AM in the UI.
function isDateOnly(val) {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)
}

// Pick the best timestamp for display, preferring full ISO datetimes
// over date-only strings (which show as 12:00 AM).
function bestTime(...candidates) {
  for (const val of candidates) {
    if (val && !isDateOnly(val)) return val
  }
  // Fall back to the first truthy value (even if date-only)
  for (const val of candidates) {
    if (val) return val
  }
  return null
}

function push(list, item) {
  if (!item?.id) return
  list.push(item)
}

function lastMessage(messages) {
  const list = Array.isArray(messages) ? messages : []
  return list.length ? list[list.length - 1] : null
}

function nameOf(id) {
  return getEmployeeById(id)?.name || 'HR'
}

// Returns leave type label with "leave" suffix, avoiding duplication
// (e.g., "Short leave" stays as-is, "Casual" becomes "Casual leave").
function leavePhrase(type) {
  const label = leaveTypeLabel(type)
  return label.toLowerCase().endsWith('leave') ? label : `${label} leave`
}

// All notifications for one employee (read + unread), newest first.
export function buildEmployeeNotifications(employeeId) {
  const items = []

  for (const lv of getLeavesForEmployee(employeeId)) {
    if (lv.status === 'approved' && lv.decidedOn) {
      push(items, {
        id: `leave-approved-${lv.id}`,
        category: 'leave',
        title: 'Leave approved',
        body: `Your ${leavePhrase(lv.type)} was approved.`,
        on: bestTime(lv.decidedOn, lv.createdAt, lv.appliedOn),
        href: '/my-leaves'
      })
    }
    if (lv.status === 'rejected' && lv.decidedOn) {
      push(items, {
        id: `leave-rejected-${lv.id}`,
        category: 'leave',
        title: 'Leave rejected',
        body: lv.rejectionReason
          ? `Your ${leavePhrase(lv.type)} was rejected: ${lv.rejectionReason}`
          : `Your ${leavePhrase(lv.type)} was rejected.`,
        on: bestTime(lv.decidedOn, lv.createdAt, lv.appliedOn),
        href: '/my-leaves'
      })
    }
    const last = lastMessage(lv.messages)
    if (lv.status === 'pending' && last?.byRole === 'admin') {
      push(items, {
        id: `leave-question-${lv.id}-${last.id}`,
        category: 'leave',
        title: 'HR asked about your leave',
        body: last.text,
        on: last.on,
        href: '/my-leaves'
      })
    }
  }

  // Two-stage flow: requests waiting on this person's manager approval, and
  // updates about where the employee's own requests currently sit.
  for (const lv of getLeaves()) {
    if (
      lv.status === 'pending' && lv.stage === 'manager' &&
      getEmployeeById(lv.employeeId)?.managerId === employeeId
    ) {
      push(items, {
        id: `leave-manager-pending-${lv.id}`,
        category: 'leave',
        title: 'Leave awaiting your approval',
        body: `${getEmployeeById(lv.employeeId)?.name || 'An employee'} applied for ${leavePhrase(lv.type)}.`,
        on: lv.createdAt || lv.appliedOn,
        href: '/my-team?tab=leaves'
      })
    }
    if (lv.employeeId !== employeeId) continue
    if (lv.status === 'pending' && lv.stage === 'hr' && lv.managerStatus === 'approved') {
      push(items, {
        id: `leave-manager-approved-${lv.id}`,
        category: 'leave',
        title: 'Manager approved your leave',
        body: `Your ${leavePhrase(lv.type)} was approved by your manager and sent to HR for final approval.`,
        on: bestTime(lv.managerDecidedOn, lv.createdAt, lv.appliedOn),
        href: '/my-leaves'
      })
    }
    if (lv.status === 'pending' && lv.managerStatus === 'escalated') {
      push(items, {
        id: `leave-escalated-${lv.id}`,
        category: 'leave',
        title: 'Leave sent to HR',
        body: `Your ${leavePhrase(lv.type)} moved to HR for final approval.`,
        on: bestTime(lv.escalatedOn, lv.createdAt, lv.appliedOn),
        href: '/my-leaves'
      })
    }
  }

  // Two-stage overtime flow: requests waiting on this person's manager
  // approval, and updates about where the employee's own requests sit.
  for (const req of getOvertimeRequests()) {
    if (
      req.status === 'pending' &&
      (req.stage === 'manager' || !req.stage) &&
      getEmployeeById(req.employeeId)?.managerId === employeeId
    ) {
      push(items, {
        id: `overtime-manager-pending-${req.id}`,
        category: 'overtime',
        title: 'Overtime awaiting your approval',
        body: `${getEmployeeById(req.employeeId)?.name || 'An employee'} logged ${req.hours}h overtime for ${monthLabel(req.monthKey)}.`,
        on: req.requestedOn,
        href: '/my-team?tab=overtime'
      })
    }
    if (req.employeeId !== employeeId) continue
    if (req.status === 'pending' && req.stage === 'hr' && req.managerStatus === 'approved') {
      push(items, {
        id: `overtime-manager-approved-${req.id}`,
        category: 'overtime',
        title: 'Manager approved your overtime',
        body: `Your ${req.hours}h overtime request was approved by your manager and sent to HR for final approval.`,
        on: req.managerDecidedOn || req.requestedOn,
        href: '/my-overtime'
      })
    }
  }

  for (const task of getTasksForAssignee(employeeId)) {
    if (task.createdById !== task.assigneeId) {
      push(items, {
        id: `task-assigned-${task.id}`,
        category: 'task',
        title: 'Task assigned to you',
        body: `${nameOf(task.createdById)} assigned “${task.title}”.`,
        on: task.createdOn,
        href: '/my-tasks'
      })
    }
    if (task.status === 'closed' && task.closedOn) {
      push(items, {
        id: `task-closed-${task.id}`,
        category: 'task',
        title: 'Task closed',
        body: `“${task.title}” was approved and closed by ${nameOf(task.closedBy)}.`,
        on: task.closedOn,
        href: '/my-tasks'
      })
    }
  }

  for (const c of getAttendanceCorrectionsForEmployee(employeeId)) {
    if (c.status === 'approved' && c.decidedOn) {
      push(items, {
        id: `correction-approved-${c.id}`,
        category: 'attendance',
        title: 'Attendance correction approved',
        body: `${correctionIssueLabel(c.issueType)} for ${c.date} was approved.`,
        on: c.decidedOn,
        href: '/me'
      })
    }
    if (c.status === 'rejected' && c.decidedOn) {
      push(items, {
        id: `correction-rejected-${c.id}`,
        category: 'attendance',
        title: 'Attendance correction rejected',
        body: c.reviewNote
          ? `${correctionIssueLabel(c.issueType)} rejected: ${c.reviewNote}`
          : `${correctionIssueLabel(c.issueType)} was rejected.`,
        on: c.decidedOn,
        href: '/me'
      })
    }
    const last = lastMessage(c.messages)
    if (c.status === 'pending' && last?.byRole === 'admin') {
      push(items, {
        id: `correction-question-${c.id}-${last.id}`,
        category: 'attendance',
        title: 'HR asked about your correction',
        body: last.text,
        on: last.on,
        href: '/me'
      })
    }
  }

  for (const claim of getReimbursementsForEmployee(employeeId)) {
    if (claim.status === 'approved' || claim.status === 'approved_unpaid' || claim.status === 'paid') {
      push(items, {
        id: `reimburse-ok-${claim.id}`,
        category: 'reimbursement',
        title: 'Reimbursement update',
        body: `Your claim of ₹${claim.amount} was ${claim.status === 'paid' ? 'paid' : 'approved'}.`,
        on: claim.decidedOn || claim.appliedOn,
        href: '/my-reimbursements'
      })
    }
    if (claim.status === 'rejected') {
      push(items, {
        id: `reimburse-rejected-${claim.id}`,
        category: 'reimbursement',
        title: 'Reimbursement rejected',
        body: claim.reviewNote
          ? `Claim of ₹${claim.amount} rejected: ${claim.reviewNote}`
          : `Your claim of ₹${claim.amount} was rejected.`,
        on: claim.decidedOn || claim.appliedOn,
        href: '/my-reimbursements'
      })
    }
  }

  const profile = getProfileForEmployee(employeeId)
  if (profile.status === 'returned') {
    push(items, {
      id: `profile-returned-${profile.reviewedOn || profile.updatedOn}`,
      category: 'profile',
      title: 'Profile returned for correction',
      body: profile.reviewNote || 'HR asked you to update your details.',
      on: profile.reviewedOn || profile.updatedOn,
      href: '/my-profile'
    })
  }
  if (profile.status === 'update_approved') {
    push(items, {
      id: `profile-update-approved-${profile.updatedOn}`,
      category: 'profile',
      title: 'Profile update approved',
      body: 'You can edit your details now.',
      on: profile.updatedOn,
      href: '/my-profile'
    })
  }
  if (profile.status === 'verified' && profile.reviewedOn) {
    push(items, {
      id: `profile-verified-${profile.reviewedOn}`,
      category: 'profile',
      title: 'Profile verified',
      body: 'HR verified your onboarding details.',
      on: profile.reviewedOn,
      href: '/my-profile'
    })
  }

  for (const t of getTicketsForEmployee(employeeId)) {
    const last = lastMessage(t.messages)
    if (last?.byRole === 'admin' || last?.byRole === 'hr') {
      push(items, {
        id: `ticket-reply-${t.id}-${last.id}`,
        category: 'ticket',
        title: 'Reply on your query',
        body: last.text || t.subject,
        on: last.on || t.updatedOn,
        href: '/help'
      })
    }
  }

  for (const issue of getITIssuesForEmployee(employeeId)) {
    if (issue.status === 'resolved' || issue.status === 'closed') {
      push(items, {
        id: `it-${issue.status}-${issue.id}`,
        category: 'it',
        title: issue.status === 'resolved' ? 'IT issue resolved' : 'IT issue closed',
        body: issue.issue,
        on: issue.updatedOn || issue.createdOn,
        href: '/it-help'
      })
    } else if (issue.assignedTo && issue.status === 'inprogress') {
      push(items, {
        id: `it-progress-${issue.id}`,
        category: 'it',
        title: 'IT is working on your issue',
        body: issue.issue,
        on: issue.updatedOn || issue.createdOn,
        href: '/it-help'
      })
    }
  }

  for (const a of getAnnouncementsForEmployee(employeeId)) {
    if (!isAnnouncementRead(employeeId, a.id)) {
      push(items, {
        id: `announcement-${a.id}`,
        category: 'announcement',
        title: 'New announcement',
        body: a.title,
        on: a.publishedOn || a.createdOn,
        href: '/announcements'
      })
    }
  }

  // Shift change request updates for the employee.
  for (const req of getShiftChangeRequestsForEmployee(employeeId)) {
    if (req.status === 'approved' && req.decidedOn) {
      const toShift = getShiftById(req.toShiftId)
      push(items, {
        id: `shift-change-approved-${req.id}`,
        category: 'shift',
        title: 'Shift change approved',
        body: `Your request to move to ${toShift?.name || 'a new shift'} was approved.`,
        on: req.decidedOn,
        href: '/my-shifts?tab=change-requests'
      })
    }
    if (req.status === 'rejected' && req.decidedOn) {
      const toShift = getShiftById(req.toShiftId)
      push(items, {
        id: `shift-change-rejected-${req.id}`,
        category: 'shift',
        title: 'Shift change rejected',
        body: req.rejectReason
          ? `Your request to move to ${toShift?.name || 'a new shift'} was rejected: ${req.rejectReason}`
          : `Your request to move to ${toShift?.name || 'a new shift'} was rejected.`,
        on: req.decidedOn,
        href: '/my-shifts?tab=change-requests'
      })
    }
  }

  // Overtime request updates for the employee.
  for (const req of getOvertimeRequestsForEmployee(employeeId)) {
    if (req.status === 'approved' && req.decidedOn) {
      push(items, {
        id: `overtime-approved-${req.id}`,
        category: 'overtime',
        title: 'Overtime approved',
        body: `Your ${req.hours}h overtime request for ${req.monthKey} was approved. It will be added to your salary.`,
        on: req.decidedOn,
        href: '/my-overtime'
      })
    }
    if (req.status === 'rejected' && req.decidedOn) {
      push(items, {
        id: `overtime-rejected-${req.id}`,
        category: 'overtime',
        title: 'Overtime rejected',
        body: req.rejectReason
          ? `Your ${req.hours}h overtime request was rejected: ${req.rejectReason}`
          : `Your ${req.hours}h overtime request was rejected.`,
        on: req.decidedOn,
        href: '/my-overtime'
      })
    }
  }

  // Unread team messages from each teammate.
  const unreadByPeer = {}
  for (const m of getTeamConversations()) {
    if (m.toId === employeeId && !m.read) {
      if (!unreadByPeer[m.fromId] || m.on > unreadByPeer[m.fromId].on) {
        unreadByPeer[m.fromId] = m
      }
    }
  }
  for (const [peerId, latest] of Object.entries(unreadByPeer)) {
    const peerName = nameOf(peerId)
    const hasAttachment = latest.attachments && latest.attachments.length > 0
    const body = latest.text
      ? latest.text
      : hasAttachment
        ? `${latest.attachments.map((f) => f.name).join(', ')}`
        : 'Sent you a message.'
    push(items, {
      id: `team-msg-${latest.id}`,
      category: 'team',
      title: `${peerName} messaged you`,
      body,
      on: latest.on,
      href: `/my-team?chat=${peerId}`,
      peerId
    })
  }

  items.sort((a, b) => toTimestamp(b.on) - toTimestamp(a.on))
  return items
}

// Action items and replies HR/Admin should know about.
export function buildAdminNotifications() {
  const items = []

  for (const lv of getLeaves()) {
    if (lv.status !== 'pending') continue
    const last = lastMessage(lv.messages)
    if (last?.byRole === 'employee' && (lv.messages?.length || 0) > 1) {
      push(items, {
        id: `leave-reply-${lv.id}-${last.id}`,
        category: 'leave',
        title: 'Employee replied on leave',
        body: `${nameOf(lv.employeeId)}: ${last.text}`,
        on: last.on || lv.appliedOn,
        href: '/leave-requests'
      })
    } else {
      const stageNote = lv.stage === 'manager'
        ? ' — awaiting manager approval'
        : lv.managerStatus === 'approved'
          ? ' — manager approved, final approval needed'
          : lv.managerStatus === 'escalated'
            ? ' — auto-escalated, final approval needed'
            : ' — final approval needed'
      push(items, {
        id: `leave-pending-${lv.id}`,
        category: 'leave',
        title: lv.stage === 'manager' ? 'Leave with manager' : 'Leave request pending',
        body: `${nameOf(lv.employeeId)} applied for ${leavePhrase(lv.type)}${stageNote}.`,
        on: lv.createdAt || lv.appliedOn,
        href: '/leave-requests'
      })
    }
  }

  for (const claim of getReimbursements()) {
    if (claim.status !== 'pending') continue
    push(items, {
      id: `reimburse-pending-${claim.id}`,
      category: 'reimbursement',
      title: 'Reimbursement pending',
      body: `${nameOf(claim.employeeId)} submitted a claim of ₹${claim.amount}.`,
      on: claim.appliedOn,
      href: '/reimbursements'
    })
  }

  for (const c of getAttendanceCorrections()) {
    if (c.status !== 'pending') continue
    const last = lastMessage(c.messages)
    if (last?.byRole === 'employee' && (c.messages?.length || 0) > 1) {
      push(items, {
        id: `correction-reply-${c.id}-${last.id}`,
        category: 'attendance',
        title: 'Employee replied on correction',
        body: `${nameOf(c.employeeId)}: ${last.text}`,
        on: last.on || c.requestedOn,
        href: '/records'
      })
    } else {
      push(items, {
        id: `correction-pending-${c.id}`,
        category: 'attendance',
        title: 'Attendance correction pending',
        body: `${nameOf(c.employeeId)} — ${correctionIssueLabel(c.issueType)} on ${c.date}.`,
        on: c.requestedOn,
        href: '/records'
      })
    }
  }

  for (const profile of getProfiles()) {
    if (profile.status === 'submitted') {
      push(items, {
        id: `profile-submitted-${profile.employeeId}`,
        category: 'profile',
        title: 'Profile awaiting review',
        body: `${nameOf(profile.employeeId)} submitted onboarding details.`,
        on: profile.submittedOn || profile.updatedOn,
        href: '/records-profiles'
      })
    }
    if (profile.status === 'update_requested') {
      push(items, {
        id: `profile-update-requested-${profile.employeeId}`,
        category: 'profile',
        title: 'Profile update requested',
        body: `${nameOf(profile.employeeId)} asked to update their details.`,
        on: profile.updateRequestedOn || profile.updatedOn,
        href: '/records-profiles'
      })
    }
  }

  for (const t of getTickets()) {
    if (!['open', 'inprogress'].includes(t.status)) continue
    const last = lastMessage(t.messages)
    if (last?.byRole === 'employee') {
      push(items, {
        id: `ticket-employee-${t.id}-${last.id}`,
        category: 'ticket',
        title: t.kind === 'grievance' ? 'New grievance activity' : 'New query activity',
        body: last.text || t.subject,
        on: last.on || t.updatedOn,
        href: '/queries'
      })
    }
  }

  for (const task of getTasks()) {
    if (!isSelfAssigned(task) && task.status === 'done' && task.completedOn) {
      push(items, {
        id: `task-done-${task.id}`,
        category: 'task',
        title: 'Task marked done',
        body: `${nameOf(task.assigneeId)} completed “${task.title}”. Approve closure.`,
        on: task.completedOn,
        href: '/tasks'
      })
    }
  }

  for (const issue of getITIssues()) {
    if (issue.status === 'open') {
      push(items, {
        id: `it-open-${issue.id}`,
        category: 'it',
        title: 'New IT issue',
        body: `${nameOf(issue.employeeId)}: ${issue.issue}`,
        on: issue.createdOn,
        href: '/it-help-desk'
      })
    }
  }

  // Pending shift change requests from employees.
  for (const req of getShiftChangeRequests()) {
    if (req.status !== 'pending') continue
    const toShift = getShiftById(req.toShiftId)
    push(items, {
      id: `shift-change-pending-${req.id}`,
      category: 'shift',
      title: 'Shift change request',
      body: `${nameOf(req.employeeId)} requested a change to ${toShift?.name || 'another shift'}.`,
      on: req.requestedOn,
      href: '/shift-management?tab=change-requests'
    })
  }

  // Pending overtime requests from employees.
  for (const req of getOvertimeRequests()) {
    if (req.status !== 'pending') continue
    const withManager = req.stage === 'manager' || !req.stage
    push(items, {
      id: `overtime-pending-${req.id}`,
      category: 'overtime',
      title: withManager ? 'Overtime with manager' : 'Overtime request pending',
      body: `${nameOf(req.employeeId)} logged ${req.hours}h overtime for ${monthLabel(req.monthKey)}${withManager ? ' — awaiting manager approval' : ' — manager approved, final approval needed'}.`,
      on: req.requestedOn,
      href: '/overtime'
    })
  }

  items.sort((a, b) => toTimestamp(b.on) - toTimestamp(a.on))
  return items
}

function buildNotifications(userId, viewerRole) {
  if (viewerRole === 'admin') {
    const actionItems = buildAdminNotifications()
    const announcementItems = []
    for (const a of getAnnouncementsForEmployee(userId)) {
      if (!isAnnouncementRead(userId, a.id)) {
        push(announcementItems, {
          id: `announcement-${a.id}`,
          category: 'announcement',
          title: 'New announcement',
          body: a.title,
          on: a.publishedOn || a.createdOn,
          href: '/company-announcements'
        })
      }
    }
    return [...actionItems, ...announcementItems].sort(
      (a, b) => toTimestamp(b.on) - toTimestamp(a.on)
    )
  }
  return buildEmployeeNotifications(userId)
}

export function getNotificationFeed(userId, viewerRole = 'employee') {
  const readIds = new Set(getReadNotificationIds(userId))
  const dismissedIds = new Set(getDismissedNotificationIds(userId))
  const all = buildNotifications(userId, viewerRole)
    .filter((n) => !dismissedIds.has(n.id))
    .map((n) => ({
      ...n,
      unread: !readIds.has(n.id)
    }))
  const unread = all.filter((n) => n.unread)
  return {
    all,
    unread,
    unreadCount: unread.length
  }
}

export function getEmployeeNotificationFeed(employeeId) {
  return getNotificationFeed(employeeId, 'employee')
}
