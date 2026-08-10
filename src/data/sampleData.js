// Sample data for testing. In a real system this comes from a database.
// Times are stored as ISO date-time strings. Dates are "YYYY-MM-DD".

// Login is kept very simple for this test phase: an ID and a PIN.
// (Real login/security will be added in a later phase.)

export const DEFAULT_SETTINGS = {
  companyName: 'Your Company',       // your company name (change in Settings)
  officeStartTime: '09:30',          // used to decide "Late"
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

// Each employee has a salary structure (basic, hra, other, tdsMonthly) and a
// team link:
//   isManager  -> true if this person is a Manager / Team Leader.
//   managerId  -> the id of the manager this person reports to (or null).
// A manager's team = everyone whose managerId is that manager's id.
export const SAMPLE_EMPLOYEES = [
  { id: 'EMP001', name: 'Aarav Sharma', pin: '1111', role: 'employee', department: 'Sales',
    isManager: true, managerId: null,
    email: 'aarav.sharma@company.com', designation: 'Sales Manager',
    salary: { basic: 18000, hra: 9000, other: 5000, tdsMonthly: 1500 } },
  { id: 'EMP002', name: 'Priya Nair', pin: '2222', role: 'employee', department: 'Design',
    isManager: false, managerId: 'EMP001',
    email: 'priya.nair@company.com', designation: 'UI Designer',
    salary: { basic: 12000, hra: 5000, other: 3000, tdsMonthly: 0 } },
  { id: 'EMP003', name: 'Rohan Gupta', pin: '3333', role: 'employee', department: 'Support',
    isManager: false, managerId: 'EMP001',
    email: 'rohan.gupta@company.com', designation: 'Support Executive',
    salary: { basic: 10000, hra: 4000, other: 2000, tdsMonthly: 0 } },
  { id: 'EMP004', name: 'Sneha Iyer', pin: '4444', role: 'employee', department: 'Sales',
    isManager: false, managerId: 'EMP001',
    email: 'sneha.iyer@company.com', designation: 'Sales Executive',
    salary: { basic: 15000, hra: 7000, other: 4000, tdsMonthly: 800 } },
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

// ---- sample leave requests ----
// Defined before attendance so attendance can skip approved-leave days.
export const SAMPLE_LEAVES = [
  {
    id: 'LV01', employeeId: 'EMP001', type: 'casual',
    fromDate: dayFromToday(-20), toDate: dayFromToday(-20),
    reason: 'Personal work', status: 'approved',
    appliedOn: dayFromToday(-25), decidedBy: 'ADM001', decidedOn: dayFromToday(-24)
  },
  {
    id: 'LV02', employeeId: 'EMP002', type: 'sick',
    fromDate: dayFromToday(-10), toDate: dayFromToday(-9),
    reason: 'Fever', status: 'approved',
    appliedOn: dayFromToday(-11), decidedBy: 'ADM001', decidedOn: dayFromToday(-11)
  },
  {
    id: 'LV03', employeeId: 'EMP003', type: 'earned',
    fromDate: dayFromToday(5), toDate: dayFromToday(9),
    reason: 'Family function', status: 'pending',
    appliedOn: dayFromToday(-1), decidedBy: null, decidedOn: null
  },
  {
    id: 'LV04', employeeId: 'EMP004', type: 'unpaid',
    fromDate: dayFromToday(3), toDate: dayFromToday(3),
    reason: 'Out of station', status: 'pending',
    appliedOn: dayFromToday(-1), decidedBy: null, decidedOn: null
  },
  {
    id: 'LV05', employeeId: 'EMP001', type: 'sick',
    fromDate: dayFromToday(-2), toDate: dayFromToday(-2),
    reason: 'Headache', status: 'rejected',
    appliedOn: dayFromToday(-3), decidedBy: 'ADM001', decidedOn: dayFromToday(-3)
  },
  {
    // Approved UNPAID leave in the past: this creates a real "loss of pay"
    // so the salary screen shows an absent-day cut.
    id: 'LV06', employeeId: 'EMP004', type: 'unpaid',
    fromDate: dayFromToday(-6), toDate: dayFromToday(-4),
    reason: 'Personal emergency', status: 'approved',
    appliedOn: dayFromToday(-8), decidedBy: 'ADM001', decidedOn: dayFromToday(-7)
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
    EMP004: { inH: 9, inM: 32, outH: 18, outM: 0,  bs: [13, 15], be: [13, 45] }
  }

  // ~35 calendar days back yields ~25 weekdays for pagination testing.
  const d = new Date(today)
  d.setDate(d.getDate() - 35)
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

// ---- tasks (Planner-style) ----
// The three board columns a task moves through.
export const TASK_STATUSES = [
  { key: 'todo',       label: 'To do' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'done',       label: 'Done' }
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
  { key: 'closed',     label: 'Closed' }
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
    dueDate: dayFromToday(0), priority: 'low', status: 'done', createdOn: dayFromToday(-2) }
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

// A couple of sample profiles so HR has something to review. Documents store
// only the file details (name/size), not the actual PDF, in this test phase.
export const SAMPLE_PROFILES = [
  {
    employeeId: 'EMP001', status: 'verified',
    updatedOn: dayFromToday(-30), submittedOn: dayFromToday(-32),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-30), reviewNote: '',
    personal: {
      fullName: 'Aarav Sharma', dob: '1990-04-12',
      address: '12 MG Road, New Delhi 110001', contactNumber: '9810012345',
      emergencyName: 'Ravi Sharma', emergencyRelation: 'Father', emergencyContact: '9810099999',
      aadhaar: '123456789012', pan: 'ABCPS1234K', homeGate: 'Gate 3',
      pickupPoint: { lat: 28.5921, lng: 77.229 }, dropPoint: null, dropSameAsPickup: true
    },
    bank: { accountNumber: '50100123456789', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
    statutory: {
      uan: '100200300400', esicApplicable: false, esic: '',
      nomineeName: 'Ravi Sharma', nomineeRelation: 'Father', nomineeShare: '100'
    },
    documents: {
      panCard: [{ name: 'aarav-pan.pdf', size: 120000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      aadhaarCard: [{ name: 'aarav-aadhaar.pdf', size: 200000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      educational: [{ name: 'aarav-degree.pdf', size: 300000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }],
      experience: [],
      form12b: [],
      bankProof: [{ name: 'aarav-cheque.pdf', size: 90000, type: 'application/pdf', uploadedOn: dayFromToday(-32) }]
    }
  },
  {
    employeeId: 'EMP002', status: 'submitted',
    updatedOn: dayFromToday(-2), submittedOn: dayFromToday(-2),
    reviewedBy: '', reviewedOn: '', reviewNote: '',
    personal: {
      fullName: 'Priya Nair', dob: '1994-09-03',
      address: '44 Residency Road, Bengaluru 560025', contactNumber: '9900011122',
      emergencyName: 'Anita Nair', emergencyRelation: 'Mother', emergencyContact: '9900099888',
      aadhaar: '987654321098', pan: 'AXNPN5678L', homeGate: 'Gate B',
      pickupPoint: { lat: 12.9716, lng: 77.5946 }, dropPoint: null, dropSameAsPickup: true
    },
    bank: { accountNumber: '000123456789', ifsc: 'ICIC0000456', bankName: 'ICICI Bank' },
    statutory: {
      uan: '555666777888', esicApplicable: true, esic: '3100456789',
      nomineeName: 'Anita Nair', nomineeRelation: 'Mother', nomineeShare: '100'
    },
    documents: {
      panCard: [{ name: 'priya-pan.pdf', size: 110000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      aadhaarCard: [{ name: 'priya-aadhaar.pdf', size: 210000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      educational: [
        { name: 'priya-btech.pdf', size: 280000, type: 'application/pdf', uploadedOn: dayFromToday(-2) },
        { name: 'priya-12th.pdf', size: 150000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }
      ],
      experience: [{ name: 'priya-relieving.pdf', size: 130000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      form12b: [{ name: 'priya-form12b.pdf', size: 95000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }],
      bankProof: [{ name: 'priya-cheque.pdf', size: 90000, type: 'application/pdf', uploadedOn: dayFromToday(-2) }]
    }
  },
  {
    employeeId: 'EMP003', status: 'verified',
    updatedOn: dayFromToday(-15), submittedOn: dayFromToday(-18),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-15), reviewNote: '',
    personal: {
      fullName: 'Rohan Gupta', dob: '1992-01-20',
      address: '8 Sector 18, Noida 201301', contactNumber: '9811122233',
      emergencyName: 'Kiran Gupta', emergencyRelation: 'Spouse', emergencyContact: '9811144455',
      aadhaar: '112233445566', pan: 'ROHPG1234M', homeGate: 'Gate 1',
      pickupPoint: { lat: 28.5355, lng: 77.3910 }, dropPoint: null, dropSameAsPickup: true
    },
    bank: { accountNumber: '30099887766', ifsc: 'SBIN0001234', bankName: 'State Bank of India' },
    statutory: {
      uan: '111222333444', esicApplicable: true, esic: '3100998877',
      nomineeName: 'Kiran Gupta', nomineeRelation: 'Spouse', nomineeShare: '100'
    },
    documents: {}
  },
  {
    employeeId: 'EMP004', status: 'verified',
    updatedOn: dayFromToday(-12), submittedOn: dayFromToday(-14),
    reviewedBy: 'ADM001', reviewedOn: dayFromToday(-12), reviewNote: '',
    personal: {
      fullName: 'Sneha Iyer', dob: '1993-07-08',
      address: '22 Anna Salai, Chennai 600002', contactNumber: '9840055666',
      emergencyName: 'Lakshmi Iyer', emergencyRelation: 'Mother', emergencyContact: '9840077888',
      aadhaar: '998877665544', pan: 'SNHPI5678N', homeGate: 'Gate 2',
      pickupPoint: { lat: 13.0827, lng: 80.2707 }, dropPoint: null, dropSameAsPickup: true
    },
    bank: { accountNumber: '40055667788', ifsc: 'AXIS0000456', bankName: 'Axis Bank' },
    statutory: {
      uan: '222333444555', esicApplicable: false, esic: '',
      nomineeName: 'Lakshmi Iyer', nomineeRelation: 'Mother', nomineeShare: '100'
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
  { key: 'closed',     label: 'Closed' }
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

// Which employee is on which trips.
export const SAMPLE_CAB_ASSIGNMENTS = [
  { employeeId: 'EMP001', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP002', pickupTripId: 'TRP01', dropTripId: 'TRP02' },
  { employeeId: 'EMP003', pickupTripId: 'TRP03', dropTripId: 'TRP04' },
  { employeeId: 'EMP004', pickupTripId: 'TRP01', dropTripId: 'TRP02' }
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
