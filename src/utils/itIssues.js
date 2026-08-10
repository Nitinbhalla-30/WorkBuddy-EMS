export function canEditITIssue(issue) {
  return issue?.status === 'open' && !issue?.assignedTo
}

export function canWithdrawITIssue(issue) {
  return issue?.status === 'open' || issue?.status === 'inprogress'
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
    case 'open': return 'tag-high'
    case 'inprogress': return 'tag-medium'
    case 'resolved': return 'tag-low'
    case 'withdrawn': return 'tag-absent'
    case 'closed': return ''
    default: return ''
  }
}
