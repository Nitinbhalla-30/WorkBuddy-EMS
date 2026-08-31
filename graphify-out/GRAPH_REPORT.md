# Graph Report - WorkBuddy EMS  (2026-08-31)

## Corpus Check
- 107 files · ~96,900 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1221 nodes · 3910 edges · 53 communities (44 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7291ec5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EmployeeLeaves.jsx
- AdminSalary.jsx
- attendance.js
- profile.js
- App.jsx
- EmployeeReimbursements.jsx
- sampleData.js
- store.js
- upsertProfile
- AdminTasks
- getEmployeeById
- EmployeeTasks
- ChatSection
- TeamChat
- notifications.js
- origin-button.tsx
- compilerOptions
- TripsTab
- read
- getEmployees
- AdminTasks.jsx
- statusLabel
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- getCabCancellations
- framer-motion
- TeamTasksPanel
- write
- components.json
- tasks.js
- next-themes
- EmployeeITHelpDesk.jsx
- package.json
- getCabRequests
- NotificationBell
- formatDate
- getAttendanceCorrections
- Product
- leaflet
- check-leaves.mjs
- tailwind-merge
- vite.config.js
- scripts
- WorkBuddy EMS — Agent Instructions
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements

## God Nodes (most connected - your core abstractions)
1. `write()` - 90 edges
2. `formatDate()` - 65 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 52 edges
8. `read()` - 39 edges
9. `MyCab()` - 39 edges
10. `AttendanceRecords()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployees()`  [EXTRACTED]
  src/pages/CabManagement.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AttendanceRecords.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeDashboard.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/TeamTasks.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (53 total, 9 thin omitted)

### Community 0 - "EmployeeLeaves.jsx"
Cohesion: 0.06
Nodes (67): FileField(), handlePick(), todayStr(), LeaveDocumentList(), LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES (+59 more)

### Community 1 - "AdminSalary.jsx"
Cohesion: 0.06
Nodes (52): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getAttendance(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getOvertimeRequestsForEmployee(), getSettings() (+44 more)

### Community 2 - "attendance.js"
Cohesion: 0.05
Nodes (70): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), attendanceMonthsLoaded(), getAttendanceForEmployee(), getEmployeeShiftStartTime(), getShiftForEmployee() (+62 more)

### Community 3 - "profile.js"
Cohesion: 0.07
Nodes (30): DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick(), todayStr(), ProfileWizard(), submit(), STEPS (+22 more)

### Community 4 - "App.jsx"
Cohesion: 0.05
Nodes (87): App(), Home(), Protected(), Avatar(), Layout(), readNavCollapsed(), getFocusableElements(), Modal() (+79 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.08
Nodes (43): ReimbursementClaimDetail(), ReimbursementForm(), ReimbursementThread(), REIMBURSEMENT_CATEGORIES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), getReimbursementsForEmployee() (+35 more)

### Community 6 - "sampleData.js"
Cohesion: 0.06
Nodes (45): TicketForm(), TicketThread(), DEFAULT_SETTINGS, DEFAULT_SHIFTS, IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, REIMBURSEMENT_STATUSES (+37 more)

### Community 7 - "store.js"
Cohesion: 0.08
Nodes (50): APP_STORE_KEYS, APP_TO_DB_FIELD, applyAppStoreRows(), applyAttendanceWindow(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, attendanceWindowMonths(), camelToSnake() (+42 more)

### Community 8 - "upsertProfile"
Cohesion: 0.15
Nodes (13): requestProfileUpdate(), reviewProfile(), reviewProfileUpdateRequest(), saveProfileDraft(), submitProfile(), upsertProfile(), approveUpdateRequest(), denyUpdateRequest() (+5 more)

### Community 9 - "AdminTasks"
Cohesion: 0.26
Nodes (9): AdminTasks(), bump(), closeMenu(), confirmDelete(), handleCreate(), handleEdit(), handleFollowUpReply(), handleMenuOutside() (+1 more)

### Community 10 - "getEmployeeById"
Cohesion: 0.07
Nodes (38): handleLogout(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory(), getMyTeammates() (+30 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.17
Nodes (12): EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside(), handleCreate(), handleEdit() (+4 more)

### Community 12 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 13 - "TeamChat"
Cohesion: 0.26
Nodes (11): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+3 more)

### Community 14 - "notifications.js"
Cohesion: 0.24
Nodes (21): getAnnouncementsForEmployee(), getAttendanceCorrectionsForEmployee(), getITIssuesForEmployee(), getProfileForEmployee(), getProfiles(), getShiftChangeRequestsForEmployee(), getTasksForAssignee(), getTeamConversations() (+13 more)

### Community 15 - "origin-button.tsx"
Cohesion: 0.16
Nodes (16): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, DonutChart, DonutChartProps, DonutChartSegment (+8 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "TripsTab"
Cohesion: 0.05
Nodes (53): addDriver(), addTrip(), addVehicle(), deleteDriver(), deleteTrip(), deleteVehicle(), getCabAssignmentForEmployee(), getCabAssignments() (+45 more)

### Community 18 - "read"
Cohesion: 0.12
Nodes (22): addCabMessage(), clearCabChatAdmin(), deleteAnnouncement(), getAnnouncements(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee() (+14 more)

### Community 19 - "getEmployees"
Cohesion: 0.10
Nodes (33): addShift(), approveShiftChange(), assignEmployeeShift(), deleteShift(), getEmployees(), getShiftById(), getShiftChangeRequests(), getShifts() (+25 more)

### Community 20 - "AdminTasks.jsx"
Cohesion: 0.31
Nodes (8): STATUS_COLORS, TaskForChart, TaskStatusChart(), TaskStatusKey, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, chartBucketKey(), isOverdue()

### Community 21 - "statusLabel"
Cohesion: 0.32
Nodes (8): statusCell(), statusCell(), canManagerChangeStatus(), employeeStatusOptions(), isEmployeeStatusLocked(), managerStatusOptions(), statusLabel(), statusTagClass()

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, html2pdf.js, jszip, lucide-react, dependencies, clsx, html2pdf.js, jszip (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "getCabCancellations"
Cohesion: 0.50
Nodes (4): getCabCancellationForEmployee(), getCabCancellations(), setCabCancellation(), toggleCancellation()

### Community 27 - "TeamTasksPanel"
Cohesion: 0.17
Nodes (10): TeamTasksPanel(), bump(), closeMenu(), confirmDelete(), handleApproveClosure(), handleClickOutside(), handleCreate(), handleTaskReply() (+2 more)

### Community 28 - "write"
Cohesion: 0.14
Nodes (31): addITIssueComment(), addTask(), addTaskMessage(), addTaskMessageByAdmin(), approveTaskClosure(), assignITIssue(), createAnnouncement(), createCabRequest() (+23 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.18
Nodes (18): TaskBoard(), canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), EMPLOYEE_ASSIGNED_STATUSES, EMPLOYEE_SELF_STATUSES, groupByStatus() (+10 more)

### Community 32 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (27): DropdownSelect(), ITIssueThread(), getITStaff(), getITStaffById(), AdminITHelpDesk(), handleSaveAssignment(), handleStatusChange(), handleViewReply() (+19 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getCabRequests"
Cohesion: 0.40
Nodes (5): deleteCabRequest(), getCabRequests(), getCabRequestsForEmployee(), updateCabRequest(), confirmWithdraw()

### Community 36 - "NotificationBell"
Cohesion: 0.20
Nodes (15): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onTeamMessage(), refresh(), dismissAllNotifications() (+7 more)

### Community 37 - "formatDate"
Cohesion: 0.18
Nodes (12): TaskForm(), TaskThread(), TASK_PRIORITIES, TASK_STATUSES, getTeamMembers(), ASSIGNED_DURING_FILTER_OPTS, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS (+4 more)

### Community 38 - "getAttendanceCorrections"
Cohesion: 0.24
Nodes (11): applyCorrectionToAttendance(), ensureAttendanceForDate(), findOrCreateAttendanceRecord(), getAttendanceCorrectionById(), getAttendanceCorrections(), resolveAttendanceCorrection(), approveCorrection(), closeReview() (+3 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

## Knowledge Gaps
- **183 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `EmployeeITHelpDesk.jsx`, `EmployeeLeaves.jsx`, `attendance.js`, `profile.js`, `App.jsx`, `EmployeeReimbursements.jsx`, `sampleData.js`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `TripsTab`, `getEmployees`, `AdminTasks.jsx`, `TeamTasksPanel`, `tasks.js`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `App.jsx` to `EmployeeITHelpDesk.jsx`, `EmployeeLeaves.jsx`, `attendance.js`, `AdminSalary.jsx`, `profile.js`, `EmployeeReimbursements.jsx`, `sampleData.js`, `formatDate`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `TripsTab`, `getEmployees`, `AdminTasks.jsx`, `TeamTasksPanel`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `App.jsx` to `EmployeeITHelpDesk.jsx`, `EmployeeLeaves.jsx`, `attendance.js`, `AdminSalary.jsx`, `profile.js`, `EmployeeReimbursements.jsx`, `sampleData.js`, `formatDate`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `TripsTab`, `getEmployees`, `AdminTasks.jsx`, `TeamTasksPanel`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EmployeeLeaves.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060191518467852256 - nodes in this community are weakly interconnected._
- **Should `AdminSalary.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057902973395931145 - nodes in this community are weakly interconnected._