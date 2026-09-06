// Build attention alerts for an employee from live module data.
// Read/unread is tracked separately in the store.

import {
  getAnnouncementsForEmployee,
  getAttendanceCorrections,
  getAttendanceCorrectionsForEmployee,
  getCabRequests,
  getCabRequestsForEmployee,
  getDeletedTasks,
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
import { announcementTypeLabel } from './announcements.js'
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
// over date-only strings (which show as 12:00 AM). Date-only fallbacks are
// coerced to local noon so the notification list never shows 12:00 AM.
function bestTime(...candidates) {
  for (const val of candidates) {
    if (val && !isDateOnly(val)) return val
  }
  // Fall back to the first truthy value (even if date-only)
  for (const val of candidates) {
    if (val) return toDisplayTime(val)
  }
  return null
}

// Convert a date-only string ("2026-08-26") to a local-noon ISO datetime so
// the notification list shows "12:00 PM" (an approximation) instead of the
// misleading "12:00 AM" that a raw date-only value produces. Full ISO
// datetimes pass through unchanged.
function toDisplayTime(val) {
  if (!isDateOnly(val)) return val
  const [y, m, d] = val.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).toISOString()
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

// One alert per unread announcement, shared by the employee and admin feeds.
// The type goes into the headline so an urgent notice reads differently from a
// general one before it is even opened.
function announcementNotification(a, href) {
  const typeLabel = a.type ? announcementTypeLabel(a.type) : ''
  return {
    id: `announcement-${a.id}`,
    category: 'announcement',
    title: typeLabel ? `New announcement · ${typeLabel}` : 'New announcement',
    body: a.title,
    // Announcements used to record only the date, which the bell showed as
    // 12:00 AM. bestTime keeps those at noon and shows the real clock time for
    // anything published after the store started writing full timestamps.
    on: bestTime(a.publishedOn, a.createdOn),
    href
  }
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
        on: toDisplayTime(lv.decidedOn),
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
        on: toDisplayTime(lv.decidedOn),
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
        on: bestTime(lv.createdAt, lv.appliedOn),
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
        on: toDisplayTime(lv.managerDecidedOn),
        href: '/my-leaves'
      })
    }
    if (lv.status === 'pending' && lv.managerStatus === 'escalated') {
      push(items, {
        id: `leave-escalated-${lv.id}`,
        category: 'leave',
        title: 'Leave sent to HR',
        body: `Your ${leavePhrase(lv.type)} moved to HR for final approval.`,
        on: toDisplayTime(lv.escalatedOn),
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
        body: `${nameOf(task.createdById)} assigned "${task.title}".`,
        on: bestTime(task.createdAt, task.createdOn),
        href: '/my-tasks'
      })
    }
    if (task.status === 'closed' && task.closedOn) {
      push(items, {
        id: `task-closed-${task.id}`,
        category: 'task',
        title: 'Task closed',
        body: `"${task.title}" was approved and closed by ${nameOf(task.closedBy)}.`,
        on: bestTime(task.closedOn, task.createdAt, task.createdOn),
        href: '/my-tasks'
      })
    }
  }
  
  // Everything happening on the tasks this person is one half of (they either
  // assigned or were assigned): an employee marking a task done needs the
  // manager to approve it, and a message in the Q&A thread is an alert for the
  // other half — the manager when the assignee asks, the assignee when the
  // manager answers. A task someone assigned to themself involves nobody else.
  for (const task of getTasks()) {
    if (task.createdById === task.assigneeId) continue
    const isCreator = task.createdById === employeeId
    const isAssignee = task.assigneeId === employeeId
    if (!isCreator && !isAssignee) continue

    if (isCreator && task.status === 'done' && task.completedOn) {
      push(items, {
        id: `task-done-${task.id}`,
        category: 'task',
        title: 'Task marked done',
        body: `${nameOf(task.assigneeId)} completed "${task.title}". Approve closure.`,
        on: bestTime(task.completedOn, task.createdAt, task.createdOn),
        href: '/my-team?tab=tasks'
      })
    }

    // Only the newest message is announced, and it is announced under its own
    // id, so every new question or reply raises a fresh unread alert instead of
    // reviving an old one (same convention as leaves and queries).
    const last = lastMessage(task.messages)
    if (!last?.text || last.byId === employeeId) continue
    push(items, {
      id: `task-message-${task.id}-${last.id}`,
      category: 'task',
      title: isAssignee ? `Reply on "${task.title}"` : `Question on "${task.title}"`,
      body: `${nameOf(last.byId)}: ${last.text}`,
      on: bestTime(last.on, task.createdAt, task.createdOn),
      href: isAssignee ? '/my-tasks' : '/my-team?tab=tasks'
    })
  }

  // Notify employees when a manager deletes a task that was assigned to them.
  for (const task of getDeletedTasks()) {
    if (task.assigneeId === employeeId && task.deletedBy !== employeeId) {
      push(items, {
        id: `task-deleted-${task.id}`,
        category: 'task',
        title: 'Task deleted',
        body: `${nameOf(task.deletedBy)} deleted the task "${task.title}".`,
        on: task.deletedAt,
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
        // The decision used to be stored as a bare date, which rendered as
        // 12:00 AM; bestTime keeps old rows readable while new ones show the
        // real approval time (see resolveAttendanceCorrection in the store).
        on: bestTime(c.decidedOn, c.appliedOn),
        // Land on the employee's correction list, not the punch-in tab behind it.
        href: '/me?tab=corrections'
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
        on: bestTime(c.decidedOn, c.appliedOn),
        href: '/me?tab=corrections'
      })
    }
    const last = lastMessage(c.messages)
    if (c.status === 'pending' && last?.byRole === 'admin') {
      push(items, {
        id: `correction-question-${c.id}-${last.id}`,
        category: 'attendance',
        title: 'HR asked about your correction',
        body: last.text,
        on: bestTime(last.on, c.appliedOn),
        href: '/me?tab=corrections'
      })
    }
  }

  for (const claim of getReimbursementsForEmployee(employeeId)) {
    // Approval alert — its own notification, shown once the claim is approved.
    // Stays in the feed after payment too, but with a distinct id so it never
    // collides with (or is mistaken for) the separate "paid" alert below.
    if (claim.status === 'approved' || claim.status === 'approved_unpaid' || claim.status === 'paid') {
      push(items, {
        id: `reimburse-approved-${claim.id}`,
        category: 'reimbursement',
        title: 'Reimbursement approved',
        body: `Your claim of ₹${claim.amount} was approved.`,
        on: toDisplayTime(bestTime(claim.decidedOn, claim.appliedOn)),
        href: '/my-reimbursements'
      })
    }
    // Payment alert — a separate notification with its own id, so marking a
    // claim paid raises a NEW alert instead of repeating the approval one.
    if (claim.status === 'paid') {
      push(items, {
        id: `reimburse-paid-${claim.id}`,
        category: 'reimbursement',
        title: 'Reimbursement paid',
        body: `Your claim of ₹${claim.amount} has been paid.`,
        on: toDisplayTime(bestTime(claim.paidOn, claim.decidedOn, claim.appliedOn)),
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
        on: toDisplayTime(bestTime(claim.decidedOn, claim.appliedOn)),
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
        // Older tickets recorded the reply moment as a bare date (the store now
        // writes a full ISO time); bestTime keeps those from showing 12:00 AM.
        on: bestTime(last.on, t.updatedOn, t.createdOn),
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
        // Old IT issues stored the date only, which the bell showed as 12:00 AM
        // (the columns were DATE and the store wrote todayKey()). bestTime covers
        // any of those still cached in a browser, while new events show the real
        // clock time from the store's ISO timestamps.
        on: bestTime(issue.updatedOn, issue.createdOn),
        href: '/it-help'
      })
    } else if (issue.assignedTo && issue.status === 'inprogress') {
      push(items, {
        id: `it-progress-${issue.id}`,
        category: 'it',
        title: 'IT is working on your issue',
        body: issue.issue,
        on: bestTime(issue.updatedOn, issue.createdOn),
        href: '/it-help'
      })
    }
  }

  for (const a of getAnnouncementsForEmployee(employeeId)) {
    if (!isAnnouncementRead(employeeId, a.id)) {
      push(items, announcementNotification(a, '/announcements'))
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

  // Cab change request updates for the employee (approved / rejected).
  for (const r of getCabRequestsForEmployee(employeeId)) {
    if (r.status === 'approved') {
      push(items, {
        id: `cab-change-approved-${r.id}`,
        category: 'cab',
        title: 'Cab change approved',
        body: r.adminNote
          ? `Your cab change request was approved: ${r.adminNote}`
          : 'Your cab change request was approved.',
        on: bestTime(r.decidedOn, r.createdAt, r.raisedOn),
        href: '/my-cab?tab=change-requests'
      })
    }
    if (r.status === 'rejected') {
      push(items, {
        id: `cab-change-rejected-${r.id}`,
        category: 'cab',
        title: 'Cab change rejected',
        body: r.adminNote
          ? `Your cab change request was rejected: ${r.adminNote}`
          : 'Your cab change request was rejected.',
        on: bestTime(r.decidedOn, r.createdAt, r.raisedOn),
        href: '/my-cab?tab=change-requests'
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

// An open IT issue, worded for whoever the alert is for. When an employee reopens
// an issue IT had marked resolved or closed, it simply goes back to status 'open'
// — indistinguishable from a request nobody has looked at yet, so the reader was
// told "New IT issue" and the fact that the first fix was rejected was lost.
// reopenITIssue (src/data/store.js) stamps `reopenedOn` for exactly this moment,
// and setITIssueStatus clears it again once IT acts, so the alert self-clears
// like the rest of the feed instead of needing to be dismissed by hand.
function openITIssueAlert(issue, newTitle) {
  const reopened = !!issue.reopenedOn
  return {
    // A reopened issue gets its own id, otherwise a reader who had already read
    // or dismissed the original "new issue" alert would never see this one.
    id: reopened ? `it-reopen-${issue.id}` : `it-open-${issue.id}`,
    category: 'it',
    title: reopened ? 'IT issue reopened' : newTitle,
    body: `${nameOf(issue.employeeId)}: ${issue.issue}`,
    // The reopen moment carries a real clock time, so show that rather than the
    // date the issue was first raised weeks ago.
    on: bestTime(reopened ? issue.reopenedOn : issue.createdOn),
    href: '/it-help-desk'
  }
}

// Action items and replies HR/Admin should know about. `adminId` is the HR user
// reading the feed, needed to work out which side of a task thread they are on.
export function buildAdminNotifications(adminId) {
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
        on: bestTime(last.on, lv.appliedOn),
        href: '/leave-requests'
      })
    } else {
      // Only notify admin when leave is at HR stage (after manager approval or escalation)
      if (lv.stage === 'manager') continue
      const stageNote = lv.managerStatus === 'approved'
        ? ' — manager approved, final approval needed'
        : lv.managerStatus === 'escalated'
          ? ' — auto-escalated, final approval needed'
          : ' — final approval needed'
      push(items, {
        id: `leave-pending-${lv.id}`,
        category: 'leave',
        title: 'Leave request pending',
        body: `${nameOf(lv.employeeId)} applied for ${leavePhrase(lv.type)}${stageNote}.`,
        on: bestTime(lv.managerDecidedOn, lv.escalatedOn, lv.createdAt, lv.appliedOn),
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
      on: toDisplayTime(claim.appliedOn),
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
        on: bestTime(last.on, c.appliedOn),
        // Land on the correction queue, not the attendance table behind it.
        href: '/records?tab=corrections'
      })
    } else {
      push(items, {
        id: `correction-pending-${c.id}`,
        category: 'attendance',
        title: 'Attendance correction pending',
        body: `${nameOf(c.employeeId)} — ${correctionIssueLabel(c.issueType)} on ${c.date}.`,
        // Corrections record the submission as `appliedOn`; `requestedOn` only
        // exists on shift changes, so this item used to render without a time.
        on: bestTime(c.appliedOn),
        href: '/records?tab=corrections'
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
        // Legacy rows stored only a date when the employee wrote in; fall back
        // through updatedOn/createdOn so the alert never shows 12:00 AM.
        on: bestTime(last.on, t.updatedOn, t.createdOn),
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
        body: `${nameOf(task.assigneeId)} completed "${task.title}". Approve closure.`,
        on: bestTime(task.completedOn, task.createdAt, task.createdOn),
        href: '/my-team?tab=tasks'
      })
    }
  }

  // HR assigns tasks and posts follow-ups from the Tasks screen, so a message
  // from the other side of a thread HR is part of has to reach them too.
  for (const task of getTasks()) {
    if (isSelfAssigned(task)) continue
    const isAssignee = task.assigneeId === adminId
    if (!isAssignee && task.createdById !== adminId) continue
    const last = lastMessage(task.messages)
    if (!last?.text || last.byId === adminId) continue
    push(items, {
      id: `task-message-${task.id}-${last.id}`,
      category: 'task',
      title: isAssignee ? `Reply on "${task.title}"` : `Question on "${task.title}"`,
      body: `${nameOf(last.byId)}: ${last.text}`,
      on: bestTime(last.on, task.createdAt, task.createdOn),
      href: '/tasks'
    })
  }

  for (const issue of getITIssues()) {
    if (issue.status === 'open') {
      push(items, openITIssueAlert(issue, 'New IT issue'))
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

  // Pending overtime requests from employees (only HR-stage, after manager approval).
  for (const req of getOvertimeRequests()) {
    if (req.status !== 'pending') continue
    // Only notify admin when request is at HR stage (manager has approved)
    if (req.stage !== 'hr') continue
    push(items, {
      id: `overtime-pending-${req.id}`,
      category: 'overtime',
      title: 'Overtime request pending',
      body: `${nameOf(req.employeeId)} logged ${req.hours}h overtime for ${monthLabel(req.monthKey)} — manager approved, final approval needed.`,
      on: req.managerDecidedOn || req.requestedOn,
      href: '/overtime?tab=requests'
    })
  }

  // Pending cab change requests raised by employees.
  for (const r of getCabRequests()) {
    if (r.status !== 'pending') continue
    push(items, {
      id: `cab-change-pending-${r.id}`,
      category: 'cab',
      title: 'Cab change request',
      body: `${nameOf(r.employeeId)} requested a temporary cab change.`,
      on: bestTime(r.createdAt, r.raisedOn),
      href: '/cab-management?tab=requests'
    })
  }

  items.sort((a, b) => toTimestamp(b.on) - toTimestamp(a.on))
  return items
}

// The IT team's own work queue, added on top of their personal alerts. Until now
// "New IT issue" only ever reached HR, who cannot assign it, while the people who
// can were never told. The IT Manager is alerted about everything still waiting
// to be picked up; everyone gets told when an issue lands on their own desk.
function buildITWorkNotifications(userId) {
  const items = []
  const isITManager = !!getEmployeeById(userId)?.isManager

  if (isITManager) {
    for (const issue of getITIssues()) {
      if (issue.status !== 'open') continue
      push(items, openITIssueAlert(issue, 'New IT issue needs assigning'))
    }
  }

  for (const issue of getITIssues()) {
    if (issue.assignedTo !== userId) continue
    // Only while there is work to do — once IT resolves or closes the issue the
    // alert goes away on its own instead of sitting there needing dismissal.
    if (!['open', 'inprogress'].includes(issue.status)) continue
    push(items, {
      id: `it-assigned-${issue.id}`,
      category: 'it',
      title: isITManager ? 'You are handling this IT issue' : 'IT issue assigned to you',
      body: `${nameOf(issue.employeeId)}: ${issue.issue}`,
      on: bestTime(issue.updatedOn, issue.createdOn),
      href: '/it-help-desk'
    })
  }

  return items
}

function buildNotifications(userId, viewerRole) {
  if (viewerRole === 'it') {
    // IT staff are employees too — they take leave and get paid — so their bell
    // carries both halves: the help desk work and their own HR requests.
    return [...buildITWorkNotifications(userId), ...buildEmployeeNotifications(userId)].sort(
      (a, b) => toTimestamp(b.on) - toTimestamp(a.on)
    )
  }
  if (viewerRole === 'admin') {
    const actionItems = buildAdminNotifications(userId)
    const announcementItems = []
    for (const a of getAnnouncementsForEmployee(userId)) {
      if (!isAnnouncementRead(userId, a.id)) {
        push(announcementItems, announcementNotification(a, '/company-announcements'))
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
  // An id is both the list key and the handle for read/dismissed state, so the
  // same alert reaching the feed twice (e.g. a task recorded as deleted in two
  // sync passes) is shown once.
  const seenIds = new Set()
  const all = buildNotifications(userId, viewerRole)
    .filter((n) => {
      if (dismissedIds.has(n.id) || seenIds.has(n.id)) return false
      seenIds.add(n.id)
      return true
    })
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
