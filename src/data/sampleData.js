// Sample data for testing. In a real system this comes from a database.
// Times are stored as ISO date-time strings. Dates are "YYYY-MM-DD".

// Login is kept very simple for this test phase: an ID and a PIN.
// (Real login/security will be added in a later phase.)

export const DEFAULT_SETTINGS = {
  companyName: 'Your Company',       // your company name (change in Settings)
  officeStartTime: '09:30',          // shift start time
  // Minutes after office start before arrival counts as Late (e.g. 20 → start 09:30, late after 09:50).
  lateGraceMinutes: 20,
  standardWorkHours: 8,              // used to show a target per day
  officeIp: '',                      // office internet address (set by admin)
  cabWaitingTime: 20,                // max wait time in minutes for cabs
  // Test helper: when true, the office-internet check always passes.
  // Turn this OFF in the real office once officeIp is set.
  pretendOnOfficeNetwork: true,
  // Yearly paid-leave allowance, same for everyone (editable in Settings).
  // Unpaid leave has no limit, so it is not listed here.
  leaveAllowance: {
    casual: 12,
    sick: 8,
    earned: 15
  },
  // Salary rules (India). Delhi has no Professional Tax, so PT is not here.
  salary: {
    pfPercent: 12,        // Provident Fund: % of Basic (employee side)
    esiPercent: 0.75,     // ESI: % of gross (employee side)
    esiThreshold: 21000   // ESI only applies when gross is at or below this
  },
  // Lunch break policy shown to all employees on My Attendance.
  lunchPolicy: {
    durationMinutes: 30,
    place: 'Company cafeteria (2nd floor). Lunch at your desk is not allowed.',
    startTime: '13:00',
    endTime: '14:00',
    notes: 'Please take lunch only during the allowed window and return to your workstation on time.'
  },
  // Dates the company observes as holidays. isHoliday = true means a day off for employees.
  companyHolidays: [
    { id: 'HOL01', date: '2026-01-26', name: 'Republic Day', isHoliday: true },
    { id: 'HOL02', date: '2026-03-14', name: 'Holi', isHoliday: true },
    { id: 'HOL03', date: '2026-08-15', name: 'Independence Day', isHoliday: true },
    { id: 'HOL04', date: '2026-10-02', name: 'Gandhi Jayanti', isHoliday: true },
    { id: 'HOL05', date: '2026-11-08', name: 'Diwali', isHoliday: true },
    { id: 'HOL06', date: '2026-12-25', name: 'Christmas', isHoliday: false }
  ]
}

// The kinds of leave. "paid: true" means it does not cut salary later.
export const LEAVE_TYPES = [
  { key: 'casual', label: 'Casual', paid: true },
  { key: 'sick',   label: 'Sick',   paid: true },
  { key: 'earned', label: 'Earned', paid: true },
  { key: 'unpaid', label: 'Unpaid', paid: false }
]

// Expense categories employees can claim for reimbursement.
export const REIMBURSEMENT_CATEGORIES = [
  { key: 'conveyance', label: 'Conveyance / local travel' },
  { key: 'travel', label: 'Travel' },
  { key: 'meals', label: 'Meals & refreshments' },
  { key: 'office', label: 'Office supplies' },
  { key: 'other', label: 'Other' }
]

// Reimbursement claim workflow statuses.
export const REIMBURSEMENT_STATUSES = [
  { key: 'pending', label: 'Pending approval' },
  { key: 'approved_unpaid', label: 'Approved — yet to be paid' },
  { key: 'paid', label: 'Approved and paid' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrawn', label: 'Withdrawn' }
]

// Each employee has a salary structure (basic, hra, other, tdsMonthly) and a
// team link:
//   isManager  -> true if this person is a Manager / Team Leader.
//   managerId  -> the id of the manager this person reports to (or null).
// A manager's team = everyone whose managerId is that manager's id.
export const SAMPLE_EMPLOYEES = [
  { id: 'EMP001', name: 'Arjun Mehta', pin: '1111', role: 'employee', department: 'Sales',
    isManager: true, managerId: null,
    email: 'arjun.mehta@company.com', designation: 'Sales Manager',
    dateJoined: '2024-06-10',
    salary: { basic: 45000, hra: 20000, other: 8000, tdsMonthly: 3000 } },
  { id: 'EMP002', name: 'Kavya Reddy', pin: '2222', role: 'employee', department: 'Design',
    isManager: false, managerId: 'EMP001',
    email: 'kavya.reddy@company.com', designation: 'UI Designer',
    dateJoined: '2025-03-15',
    salary: { basic: 22000, hra: 10000, other: 4000, tdsMonthly: 0 } },
  { id: 'EMP003', name: 'Sameer Joshi', pin: '3333', role: 'employee', department: 'Support',
    isManager: false, managerId: 'EMP001',
    email: 'sameer.joshi@company.com', designation: 'Support Executive',
    dateJoined: '2025-01-10',
    salary: { basic: 12000, hra: 5000, other: 2000, tdsMonthly: 0 } },
  { id: 'EMP004', name: 'Divya Menon', pin: '4444', role: 'employee', department: 'Sales',
    isManager: false, managerId: 'EMP001',
    email: 'divya.menon@company.com', designation: 'Sales Executive',
    dateJoined: '2024-11-01',
    salary: { basic: 16000, hra: 7000, other: 3000, tdsMonthly: 0 } },
  { id: 'EMP005', name: 'Rahul Verma', pin: '8888', role: 'employee', department: 'Marketing',
    isManager: false, managerId: 'EMP001',
    email: 'rahul.verma@company.com', designation: 'Marketing Associate',
    dateJoined: '2025-05-02',
    salary: { basic: 14000, hra: 6000, other: 2500, tdsMonthly: 0 } },
  { id: 'EMP006', name: 'Neha Kulkarni', pin: '9999', role: 'employee', department: 'Operations',
    isManager: true, managerId: null,
    email: 'neha.kulkarni@company.com', designation: 'Operations Manager',
    dateJoined: '2024-04-18',
    salary: { basic: 40000, hra: 18000, other: 7000, tdsMonthly: 2500 } },
  { id: 'EMP007', name: 'Aditya Rao', pin: '1010', role: 'employee', department: 'Operations',
    isManager: false, managerId: 'EMP006',
    email: 'aditya.rao@company.com', designation: 'Operations Executive',
    dateJoined: '2025-02-20',
    salary: { basic: 13000, hra: 5500, other: 2000, tdsMonthly: 0 } },
  { id: 'EMP008', name: 'Ishita Bose', pin: '2020', role: 'employee', department: 'Marketing',
    isManager: false, managerId: 'EMP001',
    email: 'ishita.bose@company.com', designation: 'Content Writer',
    dateJoined: '2025-06-09',
    salary: { basic: 15000, hra: 6500, other: 2500, tdsMonthly: 0 } },
  { id: 'EMP009', name: 'Karan Malhotra', pin: '3030', role: 'employee', department: 'Quality',
    isManager: false, managerId: 'EMP006',
    email: 'karan.malhotra@company.com', designation: 'QA Analyst',
    dateJoined: '2025-04-07',
    salary: { basic: 17000, hra: 7500, other: 3000, tdsMonthly: 0 } },
  { id: 'EMP010', name: 'Pooja Hegde', pin: '4040', role: 'employee', department: 'Human Resources',
    isManager: false, managerId: 'EMP006',
    email: 'pooja.hegde@company.com', designation: 'HR Executive',
    dateJoined: '2025-07-01',
    salary: { basic: 18000, hra: 8000, other: 3500, tdsMonthly: 0 } },
  { id: 'ADM001', name: 'Meera Kapoor', pin: '0000', role: 'admin', department: 'Human Resources',
    isManager: false, managerId: null,
    salary: { basic: 0, hra: 0, other: 0, tdsMonthly: 0 } },
  { id: 'IT001', name: 'Rajesh Kumar', pin: '5555', role: 'it', department: 'IT Support',
    isManager: false, managerId: null,
    salary: { basic: 20000, hra: 8000, other: 5000, tdsMonthly: 1000 } },
  { id: 'IT002', name: 'Anita Desai', pin: '6666', role: 'it', department: 'IT Support',
    isManager: false, managerId: null,
    salary: { basic: 18000, hra: 7000, other: 4000, tdsMonthly: 800 } },
  { id: 'IT003', name: 'Vikram Singh', pin: '7777', role: 'it', department: 'IT Support',
    isManager: true, managerId: null,
    salary: { basic: 25000, hra: 10000, other: 6000, tdsMonthly: 1500 } }
]

// ---- small date helpers ----

function pad(n) {
  return String(n).padStart(2, '0')
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Build an ISO time on a given day at hour:minute (local time).
function atTime(day, hour, minute) {
  const d = new Date(day)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// A date a given number of days from today, as "YYYY-MM-DD".
function dayFromToday(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return dateKey(d)
}

// Sample profile photo as an SVG data URL (initials on a coloured circle).
function samplePhoto(name, bg, uploadedOn) {
  const initials = String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${bg}"/><text x="64" y="64" dy="0.35em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" fill="#ffffff">${initials}</text></svg>`
  return {
    name: `${initials.toLowerCase()}-photo.svg`,
    size: svg.length,
    type: 'image/svg+xml',
    uploadedOn,
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
}

// ---- sample leave requests ----
// Defined before attendance so attendance can skip approved-leave days.
export const SAMPLE_LEAVES = [
  {
    id: 'LV01', employeeId: 'EMP001', type: 'casual',
    fromDate: dayFromToday(-20), toDate: dayFromToday(-20),
    reason: 'Personal work', status: 'approved',
    appliedOn: dayFromToday(-25), decidedBy: 'ADM001', decidedOn: dayFromToday(-24),
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV02', employeeId: 'EMP002', type: 'sick',
    fromDate: dayFromToday(-10), toDate: dayFromToday(-9),
    reason: 'Fever', status: 'approved',
    appliedOn: dayFromToday(-11), decidedBy: 'ADM001', decidedOn: dayFromToday(-11),
    supportingDocuments: [
      { name: 'kavya-medical-cert.pdf', size: 145000, type: 'application/pdf', uploadedOn: dayFromToday(-11) }
    ],
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV03', employeeId: 'EMP003', type: 'earned',
    fromDate: dayFromToday(5), toDate: dayFromToday(9),
    reason: 'Family function', status: 'pending',
    appliedOn: dayFromToday(-1), decidedBy: null, decidedOn: null,
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV04', employeeId: 'EMP004', type: 'unpaid',
    fromDate: dayFromToday(3), toDate: dayFromToday(3),
    reason: 'Out of station', status: 'pending',
    appliedOn: dayFromToday(-1), decidedBy: null, decidedOn: null,
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV05', employeeId: 'EMP001', type: 'sick',
    fromDate: dayFromToday(-2), toDate: dayFromToday(-2),
    reason: 'Headache', status: 'rejected',
    appliedOn: dayFromToday(-3), decidedBy: 'ADM001', decidedOn: dayFromToday(-3),
    messages: [], rejectionReason: 'Medical certificate was not uploaded for sick leave.'
  },
  {
    // Approved UNPAID leave in the past: this creates a real "loss of pay"
    // so the salary screen shows an absent-day cut.
    id: 'LV06', employeeId: 'EMP004', type: 'unpaid',
    fromDate: dayFromToday(-6), toDate: dayFromToday(-4),
    reason: 'Personal emergency', status: 'approved',
    appliedOn: dayFromToday(-8), decidedBy: 'ADM001', decidedOn: dayFromToday(-7),
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV07', employeeId: 'EMP002', type: 'casual',
    fromDate: dayFromToday(8), toDate: dayFromToday(9),
    reason: 'Family visit', status: 'pending',
    appliedOn: dayFromToday(-2), decidedBy: null, decidedOn: null,
    messages: [
      {
        id: 'LVM01', byId: 'ADM001', byRole: 'admin',
        text: 'Is this a local visit or out of station? Please confirm.',
        on: dayFromToday(-1)
      }
    ],
    rejectionReason: ''
  },
  {
    id: 'LV08', employeeId: 'EMP002', type: 'earned',
    fromDate: dayFromToday(12), toDate: dayFromToday(14),
    reason: 'Short break after project delivery', status: 'pending',
    appliedOn: dayFromToday(-1), decidedBy: null, decidedOn: null,
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV09', employeeId: 'EMP002', type: 'casual',
    fromDate: dayFromToday(-18), toDate: dayFromToday(-18),
    reason: 'Doctor appointment', status: 'rejected',
    appliedOn: dayFromToday(-20), decidedBy: 'ADM001', decidedOn: dayFromToday(-19),
    messages: [], rejectionReason: 'Please apply as sick leave with a medical certificate.'
  },
  {
    id: 'LV10', employeeId: 'EMP002', type: 'unpaid',
    fromDate: dayFromToday(20), toDate: dayFromToday(21),
    reason: 'Personal travel', status: 'withdrawn',
    appliedOn: dayFromToday(-4), withdrawnOn: dayFromToday(-3),
    decidedBy: null, decidedOn: null,
    messages: [], rejectionReason: ''
  },
  {
    id: 'LV11', employeeId: 'EMP002', type: 'sick',
    fromDate: dayFromToday(-1), toDate: dayFromToday(0),
    reason: 'Migraine', status: 'pending',
    appliedOn: dayFromToday(-2), decidedBy: null, decidedOn: null,
    supportingDocuments: [
      { name: 'kavya-clinic-note.pdf', size: 98000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }
    ],
    messages: [
      {
        id: 'LVM02', byId: 'EMP002', byRole: 'employee',
        text: 'I have uploaded the clinic note. Please approve for today and tomorrow.',
        on: dayFromToday(-1)
      }
    ],
    rejectionReason: ''
  }
]

export const SAMPLE_REIMBURSEMENTS = [
  {
    id: 'RMB01', employeeId: 'EMP002', category: 'conveyance',
    expenseDate: dayFromToday(-42), amount: 450,
    description: 'Cab to client site — Metro station to office',
    status: 'paid', appliedOn: dayFromToday(-40),
    decidedBy: 'ADM001', decidedOn: dayFromToday(-38), paidOn: dayFromToday(-35)
  },
  {
    id: 'RMB02', employeeId: 'EMP002', category: 'travel',
    expenseDate: dayFromToday(-14), amount: 2200,
    description: 'Client visit — train tickets Delhi to Jaipur',
    status: 'approved_unpaid', appliedOn: dayFromToday(-12),
    decidedBy: 'ADM001', decidedOn: dayFromToday(-10), paidOn: null
  },
  {
    id: 'RMB03', employeeId: 'EMP002', category: 'meals',
    expenseDate: dayFromToday(-4), amount: 680,
    description: 'Team lunch during off-site workshop',
    status: 'pending', appliedOn: dayFromToday(-3),
    decidedBy: null, decidedOn: null, paidOn: null
  },
  {
    id: 'RMB04', employeeId: 'EMP002', category: 'office',
    expenseDate: dayFromToday(-28), amount: 320,
    description: 'Printer cartridges for home office',
    status: 'rejected', appliedOn: dayFromToday(-27),
    decidedBy: 'ADM001', decidedOn: dayFromToday(-26), paidOn: null,
    reviewNote: 'Please use the office supply request process instead.'
  },
  {
    id: 'RMB06', employeeId: 'EMP002', category: 'conveyance',
    expenseDate: dayFromToday(-2), amount: 380,
    description: 'Auto fare — client meeting at Indiranagar',
    status: 'pending', appliedOn: dayFromToday(-1),
    decidedBy: null, decidedOn: null, paidOn: null, reviewNote: ''
  },
  {
    id: 'RMB07', employeeId: 'EMP002', category: 'other',
    expenseDate: dayFromToday(-7), amount: 1250,
    description: 'Design software plugin subscription (project expense)',
    status: 'pending', appliedOn: dayFromToday(-6),
    decidedBy: null, decidedOn: null, paidOn: null, reviewNote: ''
  },
  {
    id: 'RMB05', employeeId: 'EMP001', category: 'travel',
    expenseDate: dayFromToday(-6), amount: 1500,
    description: 'Flight to Mumbai client meeting',
    status: 'pending', appliedOn: dayFromToday(-5),
    decidedBy: null, decidedOn: null, paidOn: null
  }
]

// Does an employee have an APPROVED leave covering this date?
function hasApprovedLeaveOn(employeeId, key) {
  return SAMPLE_LEAVES.some(
    (l) =>
      l.employeeId === employeeId &&
      l.status === 'approved' &&
      key >= l.fromDate &&
      key <= l.toDate
  )
}

// Build attendance for roughly the last 25 working days (up to yesterday).
// Days covered by an approved leave are skipped (the person was on leave).
function buildSampleAttendance() {
  const records = []
  let counter = 1
  const today = new Date()
  const todayStr = dateKey(today)

  // A little variety per employee so the screens look real.
  const plans = {
    EMP001: { inH: 9, inM: 25, outH: 18, outM: 5,  bs: [13, 0],  be: [13, 40] },
    EMP002: { inH: 9, inM: 45, outH: 18, outM: 30, bs: [13, 30], be: [14, 15] }, // often late
    EMP003: { inH: 9, inM: 10, outH: 17, outM: 50, bs: [12, 45], be: [13, 20] },
    EMP004: { inH: 9, inM: 32, outH: 18, outM: 0,  bs: [13, 15], be: [13, 45] },
    EMP005: { inH: 9, inM: 20, outH: 18, outM: 10, bs: [13, 0],  be: [13, 35] },
    EMP006: { inH: 9, inM: 5,  outH: 18, outM: 20, bs: [13, 0],  be: [13, 30] },
    EMP007: { inH: 9, inM: 50, outH: 18, outM: 40, bs: [13, 45], be: [14, 20] }, // often late
    EMP008: { inH: 9, inM: 15, outH: 17, outM: 55, bs: [12, 50], be: [13, 25] },
    EMP009: { inH: 9, inM: 28, outH: 18, outM: 15, bs: [13, 10], be: [13, 40] },
    EMP010: { inH: 9, inM: 35, outH: 18, outM: 5,  bs: [13, 20], be: [13, 50] }
  }

  // ~70 calendar days back yields more months for attendance history testing.
  const d = new Date(today)
  d.setDate(d.getDate() - 70)
  while (dateKey(d) < todayStr) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const key = dateKey(d)
      for (const emp of SAMPLE_EMPLOYEES) {
        if (emp.role === 'admin') continue
        const p = plans[emp.id]
        if (!p) continue
        if (hasApprovedLeaveOn(emp.id, key)) continue // on leave, no attendance

        records.push({
          id: `ATT${pad(counter++)}`,
          employeeId: emp.id,
          date: key,
          timeIn: atTime(d, p.inH, p.inM),
          timeOut: atTime(d, p.outH, p.outM),
          breaks: [{ start: atTime(d, p.bs[0], p.bs[1]), end: atTime(d, p.be[0], p.be[1]) }]
        })
      }
    }
    d.setDate(d.getDate() + 1)
  }

  return records
}

export const SAMPLE_ATTENDANCE = buildSampleAttendance()

export const ATTENDANCE_CORRECTION_ISSUES = [
  { key: 'missed_time_in', label: 'Forgot to time in' },
  { key: 'missed_time_out', label: 'Forgot to time out' },
  { key: 'wrong_times', label: 'Wrong time in / time out' },
  { key: 'wrong_break', label: 'Break recorded incorrectly' },
  { key: 'other', label: 'Other' }
]

export const SAMPLE_ATTENDANCE_CORRECTIONS = [
  {
    id: 'ACR01',
    employeeId: 'EMP002',
    date: dayFromToday(-5),
    issueType: 'missed_time_out',
    description: 'Left for a client visit and forgot to time out.',
    suggestedTimeIn: '09:28',
    suggestedTimeOut: '18:05',
    status: 'approved',
    appliedOn: dayFromToday(-4),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-3),
    reviewNote: 'Updated from your suggested times.',
    messages: [
      {
        id: 'ACM01',
        byId: 'ADM001',
        byRole: 'admin',
        text: 'Was this after the client visit on the south campus?',
        on: dayFromToday(-4)
      },
      {
        id: 'ACM02',
        byId: 'EMP002',
        byRole: 'employee',
        text: 'Yes — I timed out mentally when I left but forgot to punch.',
        on: dayFromToday(-4)
      }
    ]
  },
  {
    id: 'ACR02',
    employeeId: 'EMP002',
    date: dayFromToday(-2),
    issueType: 'missed_time_in',
    description: 'Reached office early but forgot to time in after the team stand-up.',
    suggestedTimeIn: '09:15',
    suggestedTimeOut: null,
    status: 'pending',
    appliedOn: dayFromToday(-1),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: [
      {
        id: 'ACM03',
        byId: 'ADM001',
        byRole: 'admin',
        text: 'Can you confirm you were at your desk by 9:15?',
        on: dayFromToday(-1)
      }
    ]
  },
  {
    id: 'ACR03',
    employeeId: 'EMP002',
    date: dayFromToday(-8),
    issueType: 'wrong_times',
    description: 'System showed a late time in; I actually arrived on time.',
    suggestedTimeIn: '09:00',
    suggestedTimeOut: '18:00',
    status: 'rejected',
    appliedOn: dayFromToday(-7),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-6),
    reviewNote: 'No supporting badge or visitor log for that morning. Please request again with evidence if available.',
    messages: []
  },
  {
    id: 'ACR04',
    employeeId: 'EMP002',
    date: dayFromToday(-10),
    issueType: 'missed_time_out',
    description: 'Laptop battery died before I could time out.',
    suggestedTimeIn: null,
    suggestedTimeOut: '17:45',
    status: 'approved',
    appliedOn: dayFromToday(-9),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-9),
    reviewNote: 'Approved. Attendance updated.',
    messages: []
  },
  {
    id: 'ACR05',
    employeeId: 'EMP002',
    date: dayFromToday(-12),
    issueType: 'wrong_break',
    description: 'Break was recorded as 45 minutes but I was only away for 20.',
    suggestedTimeIn: null,
    suggestedTimeOut: null,
    status: 'pending',
    appliedOn: dayFromToday(-11),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: []
  },
  {
    id: 'ACR06',
    employeeId: 'EMP002',
    date: dayFromToday(-14),
    issueType: 'missed_time_in',
    description: 'Security gate queue delayed me; punched in late after I reached my desk.',
    suggestedTimeIn: '09:32',
    suggestedTimeOut: null,
    status: 'approved',
    appliedOn: dayFromToday(-13),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-12),
    reviewNote: 'Confirmed with reception log.',
    messages: []
  },
  {
    id: 'ACR07',
    employeeId: 'EMP002',
    date: dayFromToday(-16),
    issueType: 'other',
    description: 'Worked from meeting room all morning; punch machine did not sync.',
    suggestedTimeIn: '09:25',
    suggestedTimeOut: '18:10',
    status: 'rejected',
    appliedOn: dayFromToday(-15),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-14),
    reviewNote: 'Please attach the meeting calendar invite or room booking next time.',
    messages: [
      {
        id: 'ACM04',
        byId: 'ADM001',
        byRole: 'admin',
        text: 'Which meeting room were you in?',
        on: dayFromToday(-15)
      },
      {
        id: 'ACM05',
        byId: 'EMP002',
        byRole: 'employee',
        text: 'Room 3B for the branding sync from 9:30 to 11:00.',
        on: dayFromToday(-15)
      }
    ]
  },
  {
    id: 'ACR08',
    employeeId: 'EMP002',
    date: dayFromToday(-18),
    issueType: 'missed_time_out',
    description: 'Left for an offsite workshop and forgot to punch out.',
    suggestedTimeIn: null,
    suggestedTimeOut: '16:30',
    status: 'withdrawn',
    appliedOn: dayFromToday(-17),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    withdrawnOn: dayFromToday(-16),
    messages: []
  },
  {
    id: 'ACR09',
    employeeId: 'EMP002',
    date: dayFromToday(-20),
    issueType: 'wrong_times',
    description: 'Time out shows 15:00 but I stayed until 18:00 for a release.',
    suggestedTimeIn: '09:30',
    suggestedTimeOut: '18:00',
    status: 'approved',
    appliedOn: dayFromToday(-19),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-18),
    reviewNote: 'Updated based on Slack activity log.',
    messages: []
  },
  {
    id: 'ACR10',
    employeeId: 'EMP002',
    date: dayFromToday(-22),
    issueType: 'missed_time_in',
    description: 'Forgot to time in after returning from leave.',
    suggestedTimeIn: '10:00',
    suggestedTimeOut: null,
    status: 'pending',
    appliedOn: dayFromToday(-21),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: []
  },
  {
    id: 'ACR11',
    employeeId: 'EMP002',
    date: dayFromToday(-24),
    issueType: 'wrong_break',
    description: 'Lunch break end was not recorded; system still shows me on break.',
    suggestedTimeIn: null,
    suggestedTimeOut: null,
    status: 'approved',
    appliedOn: dayFromToday(-23),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-23),
    reviewNote: 'Break closed at 13:15 as requested.',
    messages: []
  },
  {
    id: 'ACR12',
    employeeId: 'EMP002',
    date: dayFromToday(-26),
    issueType: 'missed_time_out',
    description: 'App crashed while timing out.',
    suggestedTimeIn: null,
    suggestedTimeOut: '18:20',
    status: 'rejected',
    appliedOn: dayFromToday(-25),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-24),
    reviewNote: 'VPN logs show disconnect at 17:10. Please clarify with your manager.',
    messages: []
  },
  {
    id: 'ACR13',
    employeeId: 'EMP002',
    date: dayFromToday(-28),
    issueType: 'wrong_times',
    description: 'Swapped time in/out with a colleague by mistake on shared kiosk.',
    suggestedTimeIn: '09:20',
    suggestedTimeOut: '17:55',
    status: 'approved',
    appliedOn: dayFromToday(-27),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-26),
    reviewNote: 'Corrected after manager confirmation.',
    messages: []
  },
  {
    id: 'ACR14',
    employeeId: 'EMP002',
    date: dayFromToday(-30),
    issueType: 'other',
    description: 'Half-day training at vendor office; attendance not captured.',
    suggestedTimeIn: '09:30',
    suggestedTimeOut: '13:30',
    status: 'pending',
    appliedOn: dayFromToday(-29),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: [
      {
        id: 'ACM06',
        byId: 'ADM001',
        byRole: 'admin',
        text: 'Please share the vendor training invitation for our records.',
        on: dayFromToday(-29)
      }
    ]
  },
  {
    id: 'ACR15',
    employeeId: 'EMP002',
    date: dayFromToday(-32),
    issueType: 'missed_time_in',
    description: 'Building access card issue; entered late and forgot to punch.',
    suggestedTimeIn: '09:40',
    suggestedTimeOut: null,
    status: 'approved',
    appliedOn: dayFromToday(-31),
    decidedBy: 'ADM001',
    decidedOn: dayFromToday(-30),
    reviewNote: 'Aligned with access-control entry time.',
    messages: []
  }
]

// ---- tasks (Planner-style) ----
// Task lifecycle statuses (self-assigned: done is final; manager-assigned: done → manager approves → closed).
export const TASK_STATUSES = [
  { key: 'todo',       label: 'To do' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'done',       label: 'Done' },
  { key: 'closed',     label: 'Closed' }
]

// Task priority levels.
export const TASK_PRIORITIES = [
  { key: 'low',    label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high',   label: 'High' }
]

// ---- IT Help Desk ----
// IT issue priority levels.
export const IT_ISSUE_PRIORITIES = [
  { key: 'low',    label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high',   label: 'High' }
]

// The stages an IT issue moves through.
export const IT_ISSUE_STATUSES = [
  { key: 'open',       label: 'Open' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'resolved',   label: 'Resolved' },
  { key: 'closed',     label: 'Closed' },
  { key: 'withdrawn',  label: 'Withdrawn' }
]

// IT support team members (for assigning issues)
export const SAMPLE_IT_STAFF = [
  { id: 'IT001', name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh.kumar@company.com' },
  { id: 'IT002', name: 'Anita Desai', mobile: '9876543211', email: 'anita.desai@company.com' },
  { id: 'IT003', name: 'Vikram Singh', mobile: '9876543212', email: 'vikram.singh@company.com' }
]

// Sample IT issues reported by employees
export const SAMPLE_IT_ISSUES = [
  {
    id: 'ITI01',
    employeeId: 'EMP001',
    issue: 'Computer not starting',
    description: 'My computer is not booting up. Shows blue screen error.',
    priority: 'high',
    status: 'inprogress',
    assignedTo: 'IT001',
    estimatedTime: '2 hours',
    createdOn: dayFromToday(-1),
    updatedOn: dayFromToday(0)
  },
  {
    id: 'ITI02',
    employeeId: 'EMP002',
    issue: 'Internet connection slow',
    description: 'Internet is very slow since morning. Unable to work.',
    priority: 'medium',
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    createdOn: dayFromToday(0),
    updatedOn: dayFromToday(0)
  },
  {
    id: 'ITI05',
    employeeId: 'EMP002',
    issue: 'Adobe Creative Cloud login failing',
    description: 'Cannot sign in to Creative Cloud since the password reset yesterday.',
    priority: 'high',
    status: 'inprogress',
    assignedTo: 'IT002',
    estimatedTime: '30 minutes',
    createdOn: dayFromToday(-3),
    updatedOn: dayFromToday(-1)
  },
  {
    id: 'ITI06',
    employeeId: 'EMP002',
    issue: 'Keyboard keys sticking',
    description: 'Several keys on my keyboard are sticking and need cleaning or replacement.',
    priority: 'low',
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    createdOn: dayFromToday(-1),
    updatedOn: dayFromToday(-1)
  },
  {
    id: 'ITI03',
    employeeId: 'EMP003',
    issue: 'Printer not working',
    description: 'The shared printer on 2nd floor is not responding.',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'IT002',
    estimatedTime: '1 hour',
    createdOn: dayFromToday(-2),
    updatedOn: dayFromToday(-1)
  },
  {
    id: 'ITI04',
    employeeId: 'EMP004',
    issue: 'Monitor flickering',
    description: 'My monitor keeps flickering. It is hard to work.',
    priority: 'medium',
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    createdOn: dayFromToday(0),
    updatedOn: dayFromToday(0)
  }
]

// ---- Company Announcements ----
// Announcement types for categorization
export const ANNOUNCEMENT_TYPES = [
  { key: 'general', label: 'General' },
  { key: 'policy', label: 'Policy Update' },
  { key: 'event', label: 'Event' },
  { key: 'job', label: 'Internal Job Posting' },
  { key: 'urgent', label: 'Urgent' }
]

// Sample company announcements
export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 'ANN01',
    title: 'Office closure for Diwali',
    content: 'The office will remain closed from October 28th to November 1st for Diwali celebrations. Normal operations will resume from November 2nd. Wishing everyone a happy and prosperous Diwali!',
    type: 'general',
    createdBy: 'ADM001',
    createdOn: dayFromToday(-5),
    excludedEmployees: [] // All employees receive this
  },
  {
    id: 'ANN02',
    title: 'Updated Work from Home Policy',
    content: 'Effective from next month, employees can work from home up to 2 days per week. Prior approval from manager is required. Please review the full policy document attached in the HR portal.',
    type: 'policy',
    createdBy: 'ADM001',
    createdOn: dayFromToday(-3),
    excludedEmployees: ['IT003'] // IT manager excluded as it doesn't apply to his team
  },
  {
    id: 'ANN03',
    title: 'Senior Sales Executive Position Available',
    content: 'We are looking for an experienced Sales Executive to join our team. Minimum 3 years of experience required. Interested internal candidates can apply by sending their CV to HR by end of this week.',
    type: 'job',
    createdBy: 'ADM001',
    createdOn: dayFromToday(-1),
    excludedEmployees: ['EMP001', 'EMP004'] // Current sales team excluded
  },
  {
    id: 'ANN04',
    title: 'Annual Sports Day - November 15th',
    content: 'Join us for our annual sports day on November 15th at the company ground. Events include cricket, badminton, and track events. Registration closes on November 10th. Contact HR for more details.',
    type: 'event',
    createdBy: 'ADM001',
    createdOn: dayFromToday(0),
    excludedEmployees: []
  },
  {
    id: 'ANN05',
    title: 'Urgent: Server Maintenance Tonight',
    content: 'Critical server maintenance will be performed tonight from 11 PM to 2 AM. All systems will be unavailable during this period. Please save your work before leaving the office.',
    type: 'urgent',
    createdBy: 'IT001',
    createdOn: dayFromToday(0),
    excludedEmployees: []
  }
]

// Sample tasks. Most are assigned by the manager (EMP001) to the team;
// TSK06 is one an employee (EMP004) created for themselves.
export const SAMPLE_TASKS = [
  { id: 'TSK01', title: 'Prepare monthly sales report',
    description: 'Compile last month\u2019s figures for the review meeting.',
    assigneeId: 'EMP004', createdById: 'EMP001',
    dueDate: dayFromToday(2), priority: 'high', status: 'inprogress', createdOn: dayFromToday(-3) },
  { id: 'TSK02', title: 'Call new leads',
    description: 'Follow up with the five leads from the website.',
    assigneeId: 'EMP004', createdById: 'EMP001',
    dueDate: dayFromToday(1), priority: 'medium', status: 'todo', createdOn: dayFromToday(-1) },
  { id: 'TSK03', title: 'Update design mockups',
    description: 'Revise the home page mockups after the client feedback.',
    assigneeId: 'EMP002', createdById: 'EMP001',
    dueDate: dayFromToday(4), priority: 'medium', status: 'todo', createdOn: dayFromToday(-2),
    messages: [
      { id: 'TSM01', byId: 'EMP002', text: 'Which mockup version should I use as the base?', on: dayFromToday(-1) },
      { id: 'TSM02', byId: 'EMP001', text: 'Use the March draft. Client comments are in the email I sent yesterday.', on: dayFromToday(-1) }
    ] },
  { id: 'TSK04', title: 'Reply to support tickets',
    description: 'Clear the pending customer emails from this week.',
    assigneeId: 'EMP003', createdById: 'EMP001',
    dueDate: dayFromToday(-1), priority: 'high', status: 'inprogress', createdOn: dayFromToday(-4) },
  { id: 'TSK05', title: 'Plan next week for the team',
    description: 'Draft the weekly plan and share it with everyone.',
    assigneeId: 'EMP001', createdById: 'EMP001',
    dueDate: dayFromToday(3), priority: 'low', status: 'todo', createdOn: dayFromToday(-1) },
  { id: 'TSK06', title: 'Submit expense sheet',
    description: 'My own travel expenses for last week.',
    assigneeId: 'EMP004', createdById: 'EMP004',
    dueDate: dayFromToday(0), priority: 'low', status: 'done', createdOn: dayFromToday(-2) },
  { id: 'TSK07', title: 'Prepare client presentation deck',
    description: 'Slides for Friday review with the branding team.',
    assigneeId: 'EMP002', createdById: 'EMP001',
    dueDate: dayFromToday(1), priority: 'high', status: 'inprogress', createdOn: dayFromToday(-4),
    messages: [
      { id: 'TSM03', byId: 'EMP001', text: 'Include the Q2 metrics slide from the shared folder.', on: dayFromToday(-2) }
    ] },
  { id: 'TSK08', title: 'Upload final UI assets',
    description: 'Export icons and hand off to the dev team.',
    assigneeId: 'EMP002', createdById: 'EMP001',
    dueDate: dayFromToday(-2), priority: 'medium', status: 'done',
    createdOn: dayFromToday(-8), completedOn: dayFromToday(-1) },
  { id: 'TSK09', title: 'Organise design file library',
    description: 'Sort Figma files and archive old campaign work.',
    assigneeId: 'EMP002', createdById: 'EMP002',
    dueDate: dayFromToday(5), priority: 'low', status: 'todo', createdOn: dayFromToday(-1) },
  { id: 'TSK10', title: 'Review accessibility checklist',
    description: 'Run through the new component library against WCAG notes.',
    assigneeId: 'EMP002', createdById: 'EMP002',
    dueDate: dayFromToday(3), priority: 'medium', status: 'inprogress', createdOn: dayFromToday(-3) },
  { id: 'TSK11', title: 'Send weekly design status',
    description: 'Email the team with progress on homepage redesign.',
    assigneeId: 'EMP002', createdById: 'EMP001',
    dueDate: dayFromToday(-4), priority: 'low', status: 'closed',
    createdOn: dayFromToday(-10), completedOn: dayFromToday(-5),
    closedBy: 'EMP001', closedOn: dayFromToday(-4) },
  { id: 'TSK12', title: 'Prototype mobile nav',
    description: 'Interactive prototype for the mobile navigation refresh.',
    assigneeId: 'EMP002', createdById: 'EMP001',
    dueDate: dayFromToday(6), priority: 'medium', status: 'todo', createdOn: dayFromToday(0) }
]

// ---- employee onboarding profile ----
// The documents a new employee uploads. All should be PDF and self-signed.
//   multiple -> can hold several files (e.g. many certificates)
//   required -> must be present before the employee can submit
export const DOCUMENT_TYPES = [
  { key: 'panCard',     label: 'PAN card',                          multiple: false, required: true },
  { key: 'aadhaarCard', label: 'Aadhaar card',                      multiple: false, required: true },
  { key: 'educational', label: 'Educational certificates',          multiple: true,  required: true },
  { key: 'experience',  label: 'Experience / relieving letters',    multiple: true,  required: false,
    hint: 'From previous employers, if you have any.' },
  { key: 'form12b',     label: 'Form 12B',                          multiple: false, required: false,
    hint: 'Only if you joined in the middle of the financial year.' },
  { key: 'bankProof',   label: 'Bank proof (cancelled cheque / passbook)', multiple: false, required: false }
]

// Sample profiles for the 10 employees so HR has something to review.
// Documents store only the file details (name/size), not the actual PDF, in
// this test phase. Every employee opted in to the cab service
// (wantsCabService: true) and has a home gate + pickup map point.
export const SAMPLE_PROFILES = [
  {
    employeeId: 'EMP001', status: 'verified',
    updatedOn: dayFromToday(-30), submittedOn: dayFromToday(-32),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-30), reviewNote: '',
    personal: {
      fullName: 'Arjun Mehta', dob: '1990-04-12',
      address: 'B-42 Sector 15, Gurugram 122001', contactNumber: '9810012345',
      emergencyName: 'Ravi Mehta', emergencyRelation: 'Father', emergencyContact: '9810099999',
      aadhaar: '123456789012', pan: 'ABCPA1234K', homeGate: 'Gate 3',
      wantsCabService: true,
      pickupPoint: { lat: 28.4595, lng: 77.0266 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Arjun Mehta', '#2f6fed', dayFromToday(-32))
    },
    bank: { accountNumber: '50100123456789', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
    statutory: {
      uan: '100200300401', esicApplicable: false, esic: '',
      nomineeName: 'Ravi Mehta', nomineeRelation: 'Father', nomineeShare: '100'
    },
    documents: {
      panCard: [{ name: 'arjun-pan.pdf', size: 120000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      aadhaarCard: [{ name: 'arjun-aadhaar.pdf', size: 200000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      educational: [{ name: 'arjun-degree.pdf', size: 300000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      experience: [{ name: 'arjun-relieving.pdf', size: 140000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      form12b: [],
      bankProof: [{ name: 'arjun-cheque.pdf', size: 90000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }]
    }
  },
  {
    employeeId: 'EMP002', status: 'submitted',
    updatedOn: dayFromToday(-2), submittedOn: dayFromToday(-2),
    reviewedBy: '', reviewedOn: '', reviewNote: '',
    personal: {
      fullName: 'Kavya Reddy', dob: '1994-09-03',
      address: '18 Sector 62, Noida 201309', contactNumber: '9900011122',
      emergencyName: 'Anita Reddy', emergencyRelation: 'Mother', emergencyContact: '9900099888',
      aadhaar: '987654321098', pan: 'AXNPK5678L', homeGate: 'Gate B',
      wantsCabService: true,
      pickupPoint: { lat: 28.6353, lng: 77.3668 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Kavya Reddy', '#0f9d7a', dayFromToday(-2))
    },
    bank: { accountNumber: '000123456789', ifsc: 'ICIC0000456', bankName: 'ICICI Bank' },
    statutory: {
      uan: '555666777888', esicApplicable: false, esic: '',
      nomineeName: 'Anita Reddy', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {
      panCard: [{ name: 'kavya-pan.pdf', size: 110000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      aadhaarCard: [{ name: 'kavya-aadhaar.pdf', size: 210000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      educational: [
        { name: 'kavya-btech.pdf', size: 280000, type: 'application/pdf', uploadedOn: dayFromToday(-2) },
        { name: 'kavya-12th.pdf', size: 150000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }
      ],
      experience: [{ name: 'kavya-relieving.pdf', size: 130000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      form12b: [{ name: 'kavya-form12b.pdf', size: 95000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      bankProof: [{ name: 'kavya-cheque.pdf', size: 90000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }]
    }
  },
  {
    employeeId: 'EMP003', status: 'verified',
    updatedOn: dayFromToday(-15), submittedOn: dayFromToday(-18),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-15), reviewNote: '',
    personal: {
      fullName: 'Sameer Joshi', dob: '1992-01-20',
      address: '8 Sector 18, Dwarka, New Delhi 110075', contactNumber: '9811122233',
      emergencyName: 'Kiran Joshi', emergencyRelation: 'Spouse', emergencyContact: '9811144455',
      aadhaar: '112233445566', pan: 'SMRPJ1234M', homeGate: 'Gate 1',
      wantsCabService: true,
      pickupPoint: { lat: 28.5921, lng: 77.0460 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Sameer Joshi', '#d97706', dayFromToday(-18))
    },
    bank: { accountNumber: '30099887766', ifsc: 'SBIN0001234', bankName: 'State Bank of India' },
    statutory: {
      uan: '111222333444', esicApplicable: true, esic: '3100998877',
      nomineeName: 'Kiran Joshi', nomineeRelation: 'Spouse', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP004', status: 'verified',
    updatedOn: dayFromToday(-12), submittedOn: dayFromToday(-14),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-12), reviewNote: '',
    personal: {
      fullName: 'Divya Menon', dob: '1993-07-08',
      address: '22 Sector 21, Faridabad 121001', contactNumber: '9840055666',
      emergencyName: 'Lakshmi Menon', emergencyRelation: 'Mother', emergencyContact: '9840077888',
      aadhaar: '998877665544', pan: 'DVYPM5678N', homeGate: 'Gate 2',
      wantsCabService: true,
      pickupPoint: { lat: 28.4089, lng: 77.3178 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Divya Menon', '#7c3aed', dayFromToday(-14))
    },
    bank: { accountNumber: '40055667788', ifsc: 'AXIS0000456', bankName: 'Axis Bank' },
    statutory: {
      uan: '222333444555', esicApplicable: false, esic: '',
      nomineeName: 'Lakshmi Menon', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP005', status: 'verified',
    updatedOn: dayFromToday(-20), submittedOn: dayFromToday(-22),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-20), reviewNote: '',
    personal: {
      fullName: 'Rahul Verma', dob: '1995-11-25',
      address: '56 Sector 8, Rohini, New Delhi 110085', contactNumber: '9812345670',
      emergencyName: 'Sunita Verma', emergencyRelation: 'Mother', emergencyContact: '9812340000',
      aadhaar: '445566778899', pan: 'RHLVR9012P', homeGate: 'Gate A',
      wantsCabService: true,
      pickupPoint: { lat: 28.7260, lng: 77.0765 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Rahul Verma', '#0ea5e9', dayFromToday(-22))
    },
    bank: { accountNumber: '11223344556677', ifsc: 'PUNB0123400', bankName: 'Punjab National Bank' },
    statutory: {
      uan: '333444555666', esicApplicable: false, esic: '',
      nomineeName: 'Sunita Verma', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP006', status: 'verified',
    updatedOn: dayFromToday(-40), submittedOn: dayFromToday(-42),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-40), reviewNote: '',
    personal: {
      fullName: 'Neha Kulkarni', dob: '1989-02-17',
      address: '77 Saket District Centre, New Delhi 110017', contactNumber: '9818877665',
      emergencyName: 'Mahesh Kulkarni', emergencyRelation: 'Spouse', emergencyContact: '9818800112',
      aadhaar: '223344556677', pan: 'NHKPK3456Q', homeGate: 'Gate 4',
      wantsCabService: true,
      pickupPoint: { lat: 28.5245, lng: 77.2066 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Neha Kulkarni', '#db2777', dayFromToday(-42))
    },
    bank: { accountNumber: '77889900112233', ifsc: 'KKBK0000123', bankName: 'Kotak Mahindra Bank' },
    statutory: {
      uan: '444555666777', esicApplicable: false, esic: '',
      nomineeName: 'Mahesh Kulkarni', nomineeRelation: 'Spouse', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP007', status: 'submitted',
    updatedOn: dayFromToday(-1), submittedOn: dayFromToday(-1),
    reviewedBy: '', reviewedOn: '', reviewNote: '',
    personal: {
      fullName: 'Aditya Rao', dob: '1996-06-30',
      address: '12 Indirapuram, Ghaziabad 201014', contactNumber: '9911223344',
      emergencyName: 'Sunita Rao', emergencyRelation: 'Mother', emergencyContact: '9911220001',
      aadhaar: '334455667788', pan: 'ADTRA7890R', homeGate: 'Gate C',
      wantsCabService: true,
      pickupPoint: { lat: 28.6430, lng: 77.3777 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Aditya Rao', '#16a34a', dayFromToday(-1))
    },
    bank: { accountNumber: '99001122334455', ifsc: 'BARB0001234', bankName: 'Bank of Baroda' },
    statutory: {
      uan: '666777888999', esicApplicable: true, esic: '3100556644',
      nomineeName: 'Sunita Rao', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP008', status: 'verified',
    updatedOn: dayFromToday(-10), submittedOn: dayFromToday(-11),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-10), reviewNote: '',
    personal: {
      fullName: 'Ishita Bose', dob: '1997-03-11',
      address: '33 Mayur Vihar, New Delhi 110091', contactNumber: '9955667788',
      emergencyName: 'Debashish Bose', emergencyRelation: 'Father', emergencyContact: '9955660002',
      aadhaar: '556677889900', pan: 'ISHRB2345S', homeGate: 'Gate D',
      wantsCabService: true,
      pickupPoint: { lat: 28.6050, lng: 77.2950 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Ishita Bose', '#f59e0b', dayFromToday(-11))
    },
    bank: { accountNumber: '66778899001122', ifsc: 'ICIC0000789', bankName: 'ICICI Bank' },
    statutory: {
      uan: '777888999000', esicApplicable: false, esic: '',
      nomineeName: 'Debashish Bose', nomineeRelation: 'Father', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP009', status: 'returned',
    updatedOn: dayFromToday(-3), submittedOn: dayFromToday(-5),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-3),
    reviewNote: 'PAN card copy is blurred. Please re-upload a clearer scan.',
    personal: {
      fullName: 'Karan Malhotra', dob: '1994-12-05',
      address: '9 Vaishali, Ghaziabad 201010', contactNumber: '9977889900',
      emergencyName: 'Rakesh Malhotra', emergencyRelation: 'Father', emergencyContact: '9977880003',
      aadhaar: '667788990011', pan: 'KARML6789T', homeGate: 'Gate E',
      wantsCabService: true,
      pickupPoint: { lat: 28.6440, lng: 77.3400 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Karan Malhotra', '#64748b', dayFromToday(-5))
    },
    bank: { accountNumber: '55667788990011', ifsc: 'SBIN0005678', bankName: 'State Bank of India' },
    statutory: {
      uan: '888999000111', esicApplicable: false, esic: '',
      nomineeName: 'Rakesh Malhotra', nomineeRelation: 'Father', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP010', status: 'verified',
    updatedOn: dayFromToday(-8), submittedOn: dayFromToday(-9),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-8), reviewNote: '',
    personal: {
      fullName: 'Pooja Hegde', dob: '1998-08-22',
      address: '15 Vasundhara Enclave, New Delhi 110096', contactNumber: '9988001122',
      emergencyName: 'Meena Hegde', emergencyRelation: 'Mother', emergencyContact: '9988000044',
      aadhaar: '778899001122', pan: 'POOHG0123U', homeGate: 'Gate F',
      wantsCabService: true,
      pickupPoint: { lat: 28.6070, lng: 77.2870 }, dropPoint: null, dropSameAsPickup: true,
      photo: samplePhoto('Pooja Hegde', '#dc2626', dayFromToday(-9))
    },
    bank: { accountNumber: '33445566778899', ifsc: 'AXIS0000321', bankName: 'Axis Bank' },
    statutory: {
      uan: '999000111222', esicApplicable: false, esic: '',
      nomineeName: 'Meena Hegde', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {}
  }
]

// ---- queries & grievances (HR help desk) ----
// Every ticket is one of two kinds:
//   query     -> a routine question (payslip, leave, PF, policy, IT, etc.)
//   grievance -> a serious concern; treated as confidential.
// POSH (harassment) complaints are flagged so the screens can show the legal
// note that, by law in India, they must go to an Internal Committee (IC).
export const TICKET_CATEGORIES = [
  // Queries
  { key: 'payslip',        label: 'Payslip / salary doubt',                    kind: 'query' },
  { key: 'leave',          label: 'Leave balance / approval',                  kind: 'query' },
  { key: 'pfuan',          label: 'PF / UAN issue',                            kind: 'query' },
  { key: 'form16',         label: 'Form 16 / TDS certificate',                 kind: 'query' },
  { key: 'policy',         label: 'Policy question (WFH, notice, holidays)',    kind: 'query' },
  { key: 'itasset',        label: 'ID card / email / IT asset request',        kind: 'query' },
  { key: 'query_other',    label: 'Other query',                               kind: 'query' },
  // Grievances
  { key: 'against_person', label: 'Complaint against a manager / colleague',    kind: 'grievance' },
  { key: 'posh',           label: 'Harassment / POSH complaint',               kind: 'grievance', posh: true },
  { key: 'compensation',   label: 'Compensation / promotion dispute',          kind: 'grievance' },
  { key: 'disciplinary',   label: 'Disciplinary matter',                       kind: 'grievance' },
  { key: 'grievance_other',label: 'Other grievance',                           kind: 'grievance' }
]

// The stages a ticket moves through. HR controls this.
export const TICKET_STATUSES = [
  { key: 'open',       label: 'Open' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'resolved',   label: 'Resolved' },
  { key: 'closed',     label: 'Closed' },
  { key: 'withdrawn',  label: 'Withdrawn' }
]

// Sample tickets so HR has something to work with. Each has a small message
// thread. Grievances are confidential; one POSH case is raised anonymously.
export const SAMPLE_TICKETS = [
  {
    id: 'TKT01', kind: 'query', category: 'payslip', subject: 'Higher deduction this month',
    status: 'resolved', employeeId: 'EMP002', anonymous: false, confidential: false,
    createdOn: dayFromToday(-6), updatedOn: dayFromToday(-4),
    messages: [
      { id: 'MSG0101', byId: 'EMP002', byRole: 'employee',
        text: 'My take-home is lower this month. Was there an extra deduction?', on: dayFromToday(-6) },
      { id: 'MSG0102', byId: 'ADM001', byRole: 'admin',
        text: 'Yes, one unpaid leave day was adjusted. The breakup is in your payslip under “Absent days”.', on: dayFromToday(-5) },
      { id: 'MSG0103', byId: 'EMP002', byRole: 'employee',
        text: 'Understood, thank you.', on: dayFromToday(-4) }
    ]
  },
  {
    id: 'TKT02', kind: 'query', category: 'pfuan', subject: 'UAN not showing PF balance',
    status: 'open', employeeId: 'EMP003', anonymous: false, confidential: false,
    createdOn: dayFromToday(-1), updatedOn: dayFromToday(-1),
    messages: [
      { id: 'MSG0201', byId: 'EMP003', byRole: 'employee',
        text: 'My UAN is active but the PF passbook shows no balance yet. Can you check?', on: dayFromToday(-1) }
    ]
  },
  {
    id: 'TKT03', kind: 'query', category: 'policy', subject: 'Work from home rules',
    status: 'inprogress', employeeId: 'EMP004', anonymous: false, confidential: false,
    createdOn: dayFromToday(-3), updatedOn: dayFromToday(-2),
    messages: [
      { id: 'MSG0301', byId: 'EMP004', byRole: 'employee',
        text: 'How many WFH days are allowed per month?', on: dayFromToday(-3) },
      { id: 'MSG0302', byId: 'ADM001', byRole: 'admin',
        text: 'Let me confirm the latest policy and get back to you shortly.', on: dayFromToday(-2) }
    ]
  },
  {
    id: 'TKT04', kind: 'grievance', category: 'against_person', subject: 'Unfair workload',
    status: 'open', employeeId: 'EMP003', anonymous: false, confidential: true,
    createdOn: dayFromToday(-2), updatedOn: dayFromToday(-2),
    messages: [
      { id: 'MSG0401', byId: 'EMP003', byRole: 'employee',
        text: 'I feel my workload is much heavier than the rest of the team and I would like this reviewed.', on: dayFromToday(-2) }
    ]
  },
  {
    id: 'TKT05', kind: 'grievance', category: 'posh', subject: 'Inappropriate behaviour complaint',
    status: 'open', employeeId: 'EMP002', anonymous: true, confidential: true,
    createdOn: dayFromToday(-1), updatedOn: dayFromToday(-1),
    messages: [
      { id: 'MSG0501', byId: 'EMP002', byRole: 'employee',
        text: 'I want to report inappropriate behaviour by a colleague. I would prefer to stay anonymous for now.', on: dayFromToday(-1) }
    ]
  },
  {
    id: 'TKT06', kind: 'query', category: 'leave', subject: 'Casual leave balance check',
    status: 'open', employeeId: 'EMP002', anonymous: false, confidential: false,
    createdOn: dayFromToday(0), updatedOn: dayFromToday(0),
    messages: [
      { id: 'MSG0601', byId: 'EMP002', byRole: 'employee',
        text: 'How many casual days do I still have after my recent applications?', on: dayFromToday(0) }
    ]
  },
  {
    id: 'TKT07', kind: 'query', category: 'itasset', subject: 'Request second monitor',
    status: 'inprogress', employeeId: 'EMP002', anonymous: false, confidential: false,
    createdOn: dayFromToday(-4), updatedOn: dayFromToday(-2),
    messages: [
      { id: 'MSG0701', byId: 'EMP002', byRole: 'employee',
        text: 'I need a second monitor for the design work. Current screen is too small.', on: dayFromToday(-4) },
      { id: 'MSG0702', byId: 'ADM001', byRole: 'admin',
        text: 'IT will check stock and confirm by tomorrow.', on: dayFromToday(-2) }
    ]
  }
]

// ---- cab management ----
// Company vehicles (master list).
export const SAMPLE_VEHICLES = [
  { id: 'VEH01', number: 'DL 01 AB 1234', label: 'Sedan / White' },
  { id: 'VEH02', number: 'HR 26 CD 5678', label: 'SUV / Silver' }
]

// Company drivers (master list). Each driver has a PIN for WorkBuddy login.
export const SAMPLE_DRIVERS = [
  { id: 'DRV01', name: 'Ramesh Kumar', mobile: '9811012345', pin: '1234' },
  { id: 'DRV02', name: 'Suresh Yadav', mobile: '9822067890', pin: '5678' }
]

// Cab trips. Each trip = one vehicle + driver + direction + time.
// Different shifts have different trips. officeGate is set on drop trips
// (tells employees which office gate the cab waits at).
export const SAMPLE_TRIPS = [
  { id: 'TRP01', vehicleId: 'VEH01', driverId: 'DRV01', direction: 'pickup', time: '08:30', shiftStart: '10:00', officeGate: '',
    supervisorName: 'Anil Singh', supervisorMobile: '9810055555' },
  { id: 'TRP02', vehicleId: 'VEH01', driverId: 'DRV01', direction: 'drop',   time: '18:30', shiftEnd: '18:00', officeGate: 'Gate 2',
    supervisorName: 'Anil Singh', supervisorMobile: '9810055555' },
  { id: 'TRP03', vehicleId: 'VEH02', driverId: 'DRV02', direction: 'pickup', time: '14:00', shiftStart: '15:00', officeGate: '',
    supervisorName: 'Meena Joshi', supervisorMobile: '9822077777' },
  { id: 'TRP04', vehicleId: 'VEH02', driverId: 'DRV02', direction: 'drop',   time: '23:00', shiftEnd: '22:30', officeGate: 'Gate 1',
    supervisorName: 'Meena Joshi', supervisorMobile: '9822077777' }
]

// Which employee is on which trips. All 10 sample employees have opted in
// to the cab service: the day shift rides TRP01/TRP02, the evening shift
// rides TRP03/TRP04.
export const SAMPLE_CAB_ASSIGNMENTS = [
  { employeeId: 'EMP001', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP002', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP003', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP004', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP005', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP006', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP007', pickupTripId: 'TRP03', dropTripId: 'TRP04' },
  { employeeId: 'EMP008', pickupTripId: 'TRP03', dropTripId: 'TRP04' },
  { employeeId: 'EMP009', pickupTripId: 'TRP03', dropTripId: 'TRP04' },
  { employeeId: 'EMP010', pickupTripId: 'TRP03', dropTripId: 'TRP04' }
]

// Temporary change requests (employee asks for a one-off change).
export const SAMPLE_CAB_REQUESTS = [
  {
    id: 'CABREQ01', employeeId: 'EMP004',
    forDates: [dayFromToday(1)],
    newLocation: '221B Baker Street, Sector 15, Gurgaon',
    newGate: 'Gate 5', newTime: '08:00',
    reason: 'Staying at my parents\u2019 place for two days.',
    status: 'pending', adminNote: '', raisedOn: dayFromToday(0)
  }
]

// Chat messages between an employee and the transport desk (one ongoing
// thread per employee). `on` is an ISO date-time so we can show the time.
export const SAMPLE_CAB_MESSAGES = [
  {
    id: 'CABMSG01', employeeId: 'EMP004', byRole: 'employee',
    text: 'Where is my cab? It is usually here by 8:30.',
    on: new Date(Date.now() - 40 * 60000).toISOString(),
    readByAdmin: true
  },
  {
    id: 'CABMSG02', employeeId: 'EMP004', byRole: 'admin',
    text: 'Driver is 5 minutes away, there was traffic. Sorry for the wait.',
    on: new Date(Date.now() - 35 * 60000).toISOString(),
    readByAdmin: true
  },
  {
    id: 'CABMSG03', employeeId: 'EMP004', byRole: 'employee',
    text: 'Cab is here but the driver is not answering my call.',
    on: new Date(Date.now() - 5 * 60000).toISOString(),
    readByAdmin: false
  }
]
