import { IT_ISSUE_STATUSES } from '../data/sampleData.js'

export function canEditITIssue(issue) {
  return issue?.status === 'open' && !issue?.assignedTo
}

export function canWithdrawITIssue(issue) {
  return issue?.status === 'open' || issue?.status === 'inprogress'
}

// An issue can be re-opened by the employee when it was marked resolved or
// closed but the problem is not actually fixed.
export function canReopenITIssue(issue) {
  return issue?.status === 'resolved' || issue?.status === 'closed'
}

// The status as it should be shown to a person. A re-opened issue stays at stage
// 'open' in the data — that is the stage IT works it from — but somebody has
// rejected the previous fix, and plain "Open" hides the one fact that changes how
// hard IT pushes it. `reopenedOn` is stamped by reopenITIssue and cleared by
// setITIssueStatus (both in src/data/store.js), so the wording disappears on its
// own once IT acts. This is a reading of the row, never a stage a person can set.
export function itIssueDisplayStatus(issue) {
  return issue?.status === 'open' && issue?.reopenedOn ? 'reopened' : issue?.status
}

export function itIssueStatusLabel(status) {
  switch (status) {
    case 'open': return 'Open'
    case 'reopened': return 'Reopened'
    case 'inprogress': return 'In Progress'
    case 'resolved': return 'Resolved'
    case 'closed': return 'Closed'
    case 'withdrawn': return 'Withdrawn'
    default: return status
  }
}

// Same palette as the Queries & Grievances statuses: this module's own three
// active stages, plus the shared app-wide pills for the two end states —
// `tag-closed` (slate, finished) and `tag-absent` (faded grey, withdrawn by the
// employee). Withdrawn used to be red here, which clashed with every other
// module, and Closed was the same grey as Withdrawn.
export function itIssueStatusClass(status) {
  switch (status) {
    case 'open': return 'tag-it-open'
    case 'reopened': return 'tag-it-reopened'
    case 'inprogress': return 'tag-it-inprogress'
    case 'resolved': return 'tag-it-resolved'
    case 'closed': return 'tag-closed'
    case 'withdrawn': return 'tag-absent'
    default: return 'tag-closed'
  }
}

export function itIssueCategoryLabel(key) {
  switch (key) {
    case 'hardware': return 'Hardware'
    case 'software': return 'Software'
    case 'network': return 'Network Access'
    case 'email': return 'Email & Accounts'
    case 'other': return 'Other'
    default: return key || 'Other'
  }
}

// Status choices for the filter dropdown, shared so the employee, IT and HR
// screens all offer the same list. Derived from IT_ISSUE_STATUSES rather than
// typed out again, so a renamed stage can't drift out of sync. "Reopened" sits
// directly after Open because that is what it is — and it belongs in a filter and
// a label only: it is deliberately absent from IT_ISSUE_STATUSES so it never
// appears in the picker IT uses to set a stage.
export const IT_ISSUE_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...IT_ISSUE_STATUSES.flatMap((s) => {
    const opt = { value: s.key, label: s.label }
    return s.key === 'open'
      ? [opt, { value: 'reopened', label: itIssueStatusLabel('reopened') }]
      : [opt]
  })
]
