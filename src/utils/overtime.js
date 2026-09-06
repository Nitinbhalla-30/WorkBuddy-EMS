// Overtime calculation helpers.
//
// In India, overtime is paid at twice the normal hourly rate.
// Hourly rate = monthly gross / days in month / 8 (standard 8-hour workday)
// Overtime pay = overtime hours x hourly rate x 2

import { daysInMonth } from './salary.js'

// Calculate the hourly rate from an employee's monthly gross salary.
export function hourlyRate(employee) {
  const s = employee.salary || { basic: 0, hra: 0, other: 0 }
  const gross = (s.basic || 0) + (s.hra || 0) + (s.other || 0)
  const dim = daysInMonth(new Date().toISOString().slice(0, 7))
  // Standard 8-hour workday
  return gross / dim / 8
}

// Calculate overtime pay for a given number of hours.
// Rate = hourly rate x 2 (double wages as per Indian labor law)
export function calculateOvertimePay(employee, hours) {
  const rate = hourlyRate(employee)
  return Math.round(hours * rate * 2)
}

// Get total approved overtime hours for an employee in a month.
export function totalApprovedOvertimeHours(approvedRequests) {
  return approvedRequests.reduce((sum, r) => sum + (r.hours || 0), 0)
}

// Get total overtime pay for an employee in a month.
export function totalOvertimePay(employee, approvedRequests) {
  const totalHours = totalApprovedOvertimeHours(approvedRequests)
  return calculateOvertimePay(employee, totalHours)
}

// Status helpers - accepts request object to show stage info for pending requests
export function overtimeStatusLabel(requestOrStatus) {
  const req = typeof requestOrStatus === 'object' ? requestOrStatus : null
  const status = req ? req.status : requestOrStatus
  
  if (status === 'pending' && req) {
    // Show stage info for pending requests
    if (req.stage === 'manager') return 'Pending (Manager)'
    if (req.stage === 'hr') return 'Pending (HR)'
  }
  
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  }
  return labels[status] || status
}

export function overtimeStatusTagClass(status) {
  const classes = {
    approved: 'tag-ok',
    rejected: 'tag-late',
    withdrawn: 'tag-absent',
    pending: 'tag-pending'
  }
  return classes[status] || 'tag-pending'
}
