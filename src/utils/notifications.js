// Build attention alerts for an employee from live module data.
// Read/unread is tracked separately in the store.

import {
  getAnnouncementsForEmployee,
  getAttendanceCorrectionsForEmployee,
  getEmployeeById,
  getITIssuesForEmployee,
  getLeavesForEmployee,
  getProfileForEmployee,
  getReadNotificationIds,
  getReimbursementsForEmployee,
  getTasksForAssignee,
  getTicketsForEmployee,
  isAnnouncementRead
} from '../data/store.js'
import { correctionIssueLabel } from './attendance.js'
import { leaveTypeLabel } from './leaves.js'

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

  items.sort((a, b) => String(b.on || '').localeCompare(String(a.on || '')))
  return items
}

export function getEmployeeNotificationFeed(employeeId) {
  const readIds = new Set(getReadNotificationIds(employeeId))
  const all = buildEmployeeNotifications(employeeId).map((n) => ({
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
