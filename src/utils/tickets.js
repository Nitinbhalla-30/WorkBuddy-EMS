// Small helpers for the queries & grievances (help desk) screens.

import { TICKET_CATEGORIES, TICKET_STATUSES } from '../data/sampleData.js'

// The two kinds of ticket.
export function kindLabel(kind) {
  return kind === 'grievance' ? 'Grievance' : 'Query'
}

// Look up a category by its key.
export function categoryById(key) {
  return TICKET_CATEGORIES.find((c) => c.key === key) || null
}

export function categoryLabel(key) {
  const c = categoryById(key)
  return c ? c.label : key
}

// The categories that belong to one kind ('query' or 'grievance').
export function categoriesForKind(kind) {
  return TICKET_CATEGORIES.filter((c) => c.kind === kind)
}

// Is this a POSH (harassment) category? These get a special legal note.
export function isPosh(categoryKey) {
  const c = categoryById(categoryKey)
  return !!(c && c.posh)
}

export function statusLabel(key) {
  const s = TICKET_STATUSES.find((x) => x.key === key)
  return s ? s.label : key
}

// Reuse the existing tag colours for a status.
export function statusTagClass(key) {
  switch (key) {
    case 'open':       return 'tag-late'   // orange: needs attention
    case 'inprogress': return 'tag-low'    // blue: being worked on
    case 'resolved':   return 'tag-ok'     // green: sorted
    case 'closed':     return 'tag-absent' // grey: finished
    case 'withdrawn':  return 'tag-absent'
    default:           return 'tag-absent'
  }
}

export function canEditTicket(ticket) {
  return ticket?.status === 'open'
}

export function canWithdrawTicket(ticket) {
  return ticket?.status === 'open' || ticket?.status === 'inprogress'
}

// Who raised the ticket, as shown to HR. Anonymous grievances hide the name.
export function raisedByName(ticket, nameOf) {
  if (ticket.anonymous) return 'Anonymous'
  return nameOf ? nameOf(ticket.employeeId) : ticket.employeeId
}

// Newest activity first.
export function byUpdatedDesc(a, b) {
  return a.updatedOn < b.updatedOn ? 1 : -1
}
