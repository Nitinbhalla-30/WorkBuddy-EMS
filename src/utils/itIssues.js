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

export function itIssueStatusLabel(status) {
  switch (status) {
    case 'open': return 'Open'
    case 'inprogress': return 'In Progress'
    case 'resolved': return 'Resolved'
    case 'closed': return 'Closed'
    case 'withdrawn': return 'Withdrawn'
    default: return status
  }
}

export function itIssueStatusClass(status) {
  switch (status) {
    case 'open': return 'tag-it-open'
    case 'inprogress': return 'tag-it-inprogress'
    case 'resolved': return 'tag-it-resolved'
    case 'closed': return 'tag-it-closed'
    case 'withdrawn': return 'tag-it-withdrawn'
    default: return 'tag-it-closed'
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
