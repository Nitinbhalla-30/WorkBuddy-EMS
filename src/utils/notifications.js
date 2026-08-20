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
  getProfileForEmployee,
  getProfiles,
  getReadNotificationIds,
  getReimbursements,
  getReimbursementsForEmployee,
  getTasks,
  getTasksForAssignee,
  getTeamConversations,
  getTickets,
  getTicketsForEmployee,
  isAnnouncementRead
} from '../data/store.js'
import { correctionIssueLabel } from './attendance.js'
import { leaveTypeLabel } from './leaves.js'
import { isSelfAssigned } from './tasks.js'

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

// All notifications for one employee (read + unread), newest first.
export function buildEmployeeNotifications(employeeId) {
  const items = []

  for (const lv of getLeavesForEmployee(employeeId)) {
    if (lv.status === 'approved' && lv.decidedOn) {
      push(items, {
        id: `leave-approved-${lv.id}`,
        category: 'leave',
        title: 'Leave approved',
        body: `Your ${leaveTypeLabel(lv.type)} leave was approved.`,
        on: lv.decidedOn,
        href: '/my-leaves'
      })
    }
    if (lv.status === 'rejected' && lv.decidedOn) {
      push(items, {
        id: `leave-rejected-${lv.id}`,
        category: 'leave',
        title: 'Leave rejected',
        body: lv.rejectionReason
          ? `Your ${leaveTypeLabel(lv.type)} leave was rejected: ${lv.rejectionReason}`
          : `Your ${leaveTypeLabel(lv.type)} leave was rejected.`,
        on: lv.decidedOn,
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
        body: `${getEmployeeById(lv.employeeId)?.name || 'An employee'} applied for ${leaveTypeLabel(lv.type)} leave.`,
        on: lv.appliedOn,
        href: '/my-team'
      })
    }
    if (lv.employeeId !== employeeId) continue
    if (lv.status === 'pending' && lv.stage === 'hr' && lv.managerStatus === 'approved') {
      push(items, {
        id: `leave-manager-approved-${lv.id}`,
        category: 'leave',
        title: 'Manager approved your leave',
        body: `Your ${leaveTypeLabel(lv.type)} leave was approved by your manager and sent to HR for final approval.`,
        on: lv.managerDecidedOn || lv.appliedOn,
        href: '/my-leaves'
      })
    }
    if (lv.status === 'pending' && lv.managerStatus === 'escalated') {
      push(items, {
        id: `leave-escalated-${lv.id}`,
        category: 'leave',
        title: 'Leave sent to HR',
        body: `Your ${leaveTypeLabel(lv.type)} leave moved to HR for final approval.`,
        on: lv.escalatedOn || lv.appliedOn,
        href: '/my-leaves'
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

  items.sort((a, b) => String(b.on || '').localeCompare(String(a.on || '')))
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
        body: `${nameOf(lv.employeeId)} applied for ${leaveTypeLabel(lv.type)} leave${stageNote}.`,
        on: lv.appliedOn,
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

  items.sort((a, b) => String(b.on || '').localeCompare(String(a.on || '')))
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
      (a, b) => String(b.on || '').localeCompare(String(a.on || ''))
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
