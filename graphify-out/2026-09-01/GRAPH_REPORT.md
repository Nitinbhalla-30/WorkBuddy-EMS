# Graph Report - WorkBuddy EMS  (2026-09-01)

## Corpus Check
- 110 files · ~101,058 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1258 nodes · 3971 edges · 67 communities (56 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f496cec4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- leaves.js
- getSettings
- EmployeeTickets
- writeLocal
- App.jsx
- EmployeeReimbursements.jsx
- refreshStoreFromSupabase
- store.js
- NotificationBell
- AdminTasks
- getEmployeeById
- EmployeeTasks
- ChatSection
- TeamChat.jsx
- getOvertimeRequests
- TaskStatusChart.tsx
- compilerOptions
- TripsTab
- bump
- write
- MyCab
- AdminAnnouncements
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- todayKey
- lucide-react
- TeamTasksPanel
- origin-button.tsx
- components.json
- tasks.js
- next-themes
- EmployeeITHelpDesk.jsx
- package.json
- AttendanceRecords.jsx
- attendance.js
- Product
- leaflet
- notifications.js
- check-leaves.mjs
- CabManagement.jsx
- tailwind-merge
- DriversTab
- vite.config.js
- scripts
- read
- VehiclesTab
- WorkBuddy EMS — Agent Instructions
- EmployeeDashboard
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- AttendanceRecords
- getDriverRunSheet
- EmployeeDashboard.jsx
- downloadExcelXlsx
- tasks
- public.attendance_corrections

## God Nodes (most connected - your core abstractions)
1. `write()` - 91 edges
2. `formatDate()` - 65 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 53 edges
8. `read()` - 41 edges
9. `AttendanceRecords()` - 40 edges
10. `MyCab()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployees()`  [EXTRACTED]
  src/pages/CabManagement.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeLeaves.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (67 total, 11 thin omitted)

### Community 0 - "leaves.js"
Cohesion: 0.06
Nodes (57): LeaveForm(), changeType(), addLeaveMessage(), applyLeave(), getLeaveById(), getLeaves(), getLeavesForEmployee(), setLeaveStatus() (+49 more)

### Community 1 - "getSettings"
Cohesion: 0.11
Nodes (12): TimeInput(), ATTENDANCE_CORRECTION_ISSUES, getEmployeeShiftStartTime(), getSettings(), getShiftForEmployee(), saveSettings(), Settings(), detectIp() (+4 more)

### Community 2 - "EmployeeTickets"
Cohesion: 0.08
Nodes (28): TicketForm(), TICKET_CATEGORIES, addTicketMessage(), createTicket(), getTicketsForHR(), updateTicket(), withdrawTicket(), AdminTickets() (+20 more)

### Community 3 - "writeLocal"
Cohesion: 0.24
Nodes (12): retrySyncReimbursementClaim(), savePendingWrites(), submitReimbursementClaimSynced(), syncClaimRow(), updateReimbursementClaim(), withdrawReimbursementClaim(), writeLocal(), confirmWithdraw() (+4 more)

### Community 4 - "App.jsx"
Cohesion: 0.05
Nodes (94): App(), Home(), Protected(), Avatar(), LeaveThread(), getFocusableElements(), Modal(), focusables() (+86 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.09
Nodes (32): ReimbursementClaimDetail(), ReimbursementForm(), ReimbursementThread(), REIMBURSEMENT_CATEGORIES, REIMBURSEMENT_STATUSES, addReimbursementMessage(), approveReimbursementClaim(), markReimbursementPaid() (+24 more)

### Community 6 - "refreshStoreFromSupabase"
Cohesion: 0.17
Nodes (23): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceForDate(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow() (+15 more)

### Community 7 - "store.js"
Cohesion: 0.05
Nodes (45): DEFAULT_SETTINGS, DEFAULT_SHIFTS, APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake() (+37 more)

### Community 8 - "NotificationBell"
Cohesion: 0.23
Nodes (14): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh() (+6 more)

### Community 9 - "AdminTasks"
Cohesion: 0.19
Nodes (12): addTaskMessageByAdmin(), updateTaskByAdmin(), AdminTasks(), bump(), closeMenu(), confirmDelete(), handleCreate(), handleEdit() (+4 more)

### Community 10 - "getEmployeeById"
Cohesion: 0.09
Nodes (33): handleLogout(), ThemeProvider(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory() (+25 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.15
Nodes (14): EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside(), handleCreate(), handleEdit() (+6 more)

### Community 12 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 13 - "TeamChat.jsx"
Cohesion: 0.25
Nodes (13): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+5 more)

### Community 14 - "getOvertimeRequests"
Cohesion: 0.08
Nodes (43): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getOvertimeRequests(), getOvertimeRequestsByMonth(), otStage(), rejectOvertime(), requestOvertime() (+35 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.17
Nodes (15): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+7 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "TripsTab"
Cohesion: 0.22
Nodes (10): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+2 more)

### Community 18 - "bump"
Cohesion: 0.20
Nodes (15): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), CabManagement() (+7 more)

### Community 19 - "write"
Cohesion: 0.08
Nodes (40): addShift(), approveShiftChange(), assignEmployeeShift(), deleteShift(), getEmployees(), getMyTeammates(), getShiftChangeRequests(), getShifts() (+32 more)

### Community 20 - "MyCab"
Cohesion: 0.11
Nodes (27): clearCabChat(), createCabRequest(), deleteCabRequest(), getCabClearedAt(), getCabRequests(), getCabRequestsForEmployee(), updateCabRequest(), StopCard() (+19 more)

### Community 21 - "AdminAnnouncements"
Cohesion: 0.20
Nodes (5): createAnnouncement(), AdminAnnouncements(), closeMenu(), handleClickOutside(), handleSubmit()

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, dependencies, clsx, framer-motion, html2pdf.js (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "todayKey"
Cohesion: 0.05
Nodes (56): FileField(), handlePick(), todayStr(), Layout(), readNavCollapsed(), LeaveDocumentList(), DEFAULT_CENTER, MapPicker() (+48 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.14
Nodes (15): addTaskMessage(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete(), handleApproveClosure(), handleClickOutside() (+7 more)

### Community 28 - "origin-button.tsx"
Cohesion: 0.36
Nodes (7): assignRef(), ButtonHTMLAttributesForMotion, FILL_EASE, getCoverDiameter(), hasTextContent(), OriginButton, OriginButtonProps

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.16
Nodes (23): TaskBoard(), canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), canManagerChangeStatus(), chartBucketKey(), closureNotice() (+15 more)

### Community 32 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.07
Nodes (29): ITIssueThread(), addITIssueComment(), createITIssue(), getITStaff(), getITStaffById(), reopenITIssue(), updateITIssue(), withdrawITIssue() (+21 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 36 - "AttendanceRecords.jsx"
Cohesion: 0.17
Nodes (19): attendanceMonthsLoaded(), CORRECTION_STATUS_FILTER_OPTS, monthFilterOptions(), PERIOD_FILTER_OPTS, STATUS_FILTER_OPTS, VALID_TABS, filterRecordsForStatsPeriod(), lastMonthKey() (+11 more)

### Community 38 - "attendance.js"
Cohesion: 0.28
Nodes (18): getAttendance(), AdminDashboard(), todayKey(), clockMinutesFromIso(), computeAttendanceAverages(), computeMonthAverages(), computeMonthRawAverages(), currentState() (+10 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "notifications.js"
Cohesion: 0.14
Nodes (33): assignITIssue(), getAnnouncementsForEmployee(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getOvertimeRequestsForEmployee(), getProfiles(), getReadNotificationIds() (+25 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 43 - "CabManagement.jsx"
Cohesion: 0.26
Nodes (9): DropdownSelect(), setCabRequestStatus(), EMPTY_TRIP_FORM, RequestsTab(), decide(), handleApprove(), handleReject(), TABS (+1 more)

### Community 45 - "DriversTab"
Cohesion: 0.22
Nodes (10): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), DriversTab(), confirmDelete(), savePin() (+2 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "read"
Cohesion: 0.22
Nodes (10): deleteAnnouncement(), getAnnouncements(), getDeletedTasks(), getReadAnnouncements(), healDeletedTaskRows(), markAnnouncementAsRead(), read(), readLocal() (+2 more)

### Community 53 - "VehiclesTab"
Cohesion: 0.13
Nodes (17): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), handleClickOutside(), TodayTab(), closeMenu(), handleClickOutside() (+9 more)

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "EmployeeDashboard"
Cohesion: 0.13
Nodes (20): addAttendanceCorrectionMessage(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), upsertRecord(), withdrawAttendanceCorrection(), EmployeeDashboard() (+12 more)

### Community 62 - "AttendanceRecords"
Cohesion: 0.15
Nodes (14): applyCorrectionToAttendance(), findOrCreateAttendanceRecord(), resolveAttendanceCorrection(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove() (+6 more)

### Community 63 - "getDriverRunSheet"
Cohesion: 0.28
Nodes (8): getCabAssignmentForEmployee(), getCabAssignments(), getDriverRunSheet(), buildStops(), personInfo(), setCabAssignment(), AssignTab(), save()

### Community 64 - "EmployeeDashboard.jsx"
Cohesion: 0.18
Nodes (7): AttendanceCorrectionForm(), AttendanceCorrectionThread(), getAttendanceForEmployee(), getTodayRecord(), TAB_SLUGS, TABS, ATTENDANCE_STATS_PERIODS

### Community 67 - "downloadExcelXlsx"
Cohesion: 0.28
Nodes (6): exportSalariesExcel(), exportAttendanceExcel(), recordStatus(), dateToExcelSerial(), displayValue(), downloadExcelXlsx()

## Knowledge Gaps
- **193 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `App.jsx` to `leaves.js`, `EmployeeTickets`, `EmployeeReimbursements.jsx`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `write`, `MyCab`, `AdminAnnouncements`, `todayKey`, `TeamTasksPanel`, `tasks.js`, `EmployeeITHelpDesk.jsx`, `AttendanceRecords.jsx`, `attendance.js`, `CabManagement.jsx`, `EmployeeDashboard`, `AttendanceRecords`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `App.jsx` to `leaves.js`, `EmployeeTickets`, `EmployeeReimbursements.jsx`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `getOvertimeRequests`, `TripsTab`, `write`, `MyCab`, `AdminAnnouncements`, `todayKey`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `AttendanceRecords.jsx`, `attendance.js`, `CabManagement.jsx`, `DriversTab`, `VehiclesTab`, `EmployeeDashboard`, `AttendanceRecords`, `getDriverRunSheet`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `App.jsx` to `leaves.js`, `EmployeeTickets`, `EmployeeReimbursements.jsx`, `AdminTasks`, `getEmployeeById`, `EmployeeTasks`, `getOvertimeRequests`, `TripsTab`, `write`, `MyCab`, `AdminAnnouncements`, `todayKey`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `AttendanceRecords.jsx`, `attendance.js`, `CabManagement.jsx`, `DriversTab`, `VehiclesTab`, `EmployeeDashboard`, `AttendanceRecords`, `getDriverRunSheet`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `leaves.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0636523266022827 - nodes in this community are weakly interconnected._
- **Should `getSettings` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._