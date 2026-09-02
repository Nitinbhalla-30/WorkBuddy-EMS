# Graph Report - WorkBuddy EMS  (2026-09-02)

## Corpus Check
- 114 files · ~105,549 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1282 nodes · 4020 edges · 88 communities (71 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5eec80a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- leaves.js
- EmployeeITHelpDesk.jsx
- EmployeeTickets
- refreshStoreFromSupabase
- MyTeam.jsx
- EmployeeReimbursements.jsx
- EmployeeDashboard.jsx
- store.js
- monthKey
- AdminTasks
- AttendanceRecords
- EmployeeTasks
- RequestsTab
- EmployeeRecords
- deleteTask
- TaskStatusChart.tsx
- compilerOptions
- App.jsx
- write
- notifications.js
- MyCab
- formatDate
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- AttendanceRecords.jsx
- MessagesTab
- TeamTasksPanel
- ChatSection
- components.json
- EmployeeTasks.jsx
- next-themes
- EmployeeITHelpDesk
- ProfileWizard.jsx
- package.json
- getEmployeeById
- attendance.js
- getProfileForEmployee
- getEmployees
- Product
- leaflet
- DriversTab
- check-leaves.mjs
- tailwind-merge
- getOvertimeRequests
- vite.config.js
- CabManagement.jsx
- scripts
- read
- Settings
- WorkBuddy EMS — Agent Instructions
- EmployeeDashboard
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- profile.js
- ProfileWizard
- TripsTab
- lucide-react
- tasks
- ShiftsTab
- useTableControls
- public.attendance_corrections
- public.it_issues
- public.tickets
- public.it_issues
- NotificationBell
- VehiclesTab
- EmployeeTickets.jsx
- Layout.jsx
- getAttendanceCorrections
- usePagination
- origin-button.tsx
- getReimbursements
- AssignTab
- ShiftFormModal

## God Nodes (most connected - your core abstractions)
1. `write()` - 92 edges
2. `useTableControls()` - 65 edges
3. `formatDate()` - 65 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 60 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 53 edges
8. `read()` - 41 edges
9. `AttendanceRecords()` - 40 edges
10. `MyCab()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `validateForSubmit()`  [EXTRACTED]
  src/components/ProfileWizard.jsx → src/utils/profile.js
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeLeaves.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (88 total, 17 thin omitted)

### Community 0 - "leaves.js"
Cohesion: 0.07
Nodes (53): LeaveForm(), changeType(), addLeaveMessage(), getLeavesForEmployee(), setLeaveStatus(), updateLeave(), AdminLeaves(), closeMenu() (+45 more)

### Community 1 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.14
Nodes (12): ITIssueThread(), IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, IT_CATEGORY_FILTER_OPTS, IT_PRIORITY_FILTER_OPTS, IT_STATUS_FILTER_OPTS, BLANK_FORM (+4 more)

### Community 2 - "EmployeeTickets"
Cohesion: 0.09
Nodes (22): TicketForm(), TICKET_CATEGORIES, addTicketMessage(), getTicketsForHR(), AdminTickets(), closeMenu(), handleClickOutside(), handleReply() (+14 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.16
Nodes (25): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceForDate(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow() (+17 more)

### Community 4 - "MyTeam.jsx"
Cohesion: 0.19
Nodes (21): Avatar(), Pagination(), SortableTh(), TableEmpty(), TableToolbar(), STORE_KEYS, TAB_SLUGS, TABS (+13 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.09
Nodes (32): ReimbursementClaimDetail(), ReimbursementForm(), ReimbursementThread(), REIMBURSEMENT_CATEGORIES, REIMBURSEMENT_STATUSES, addReimbursementMessage(), retrySyncReimbursementClaim(), submitReimbursementClaimSynced() (+24 more)

### Community 6 - "EmployeeDashboard.jsx"
Cohesion: 0.20
Nodes (11): AttendanceCorrectionForm(), ATTENDANCE_CORRECTION_ISSUES, getEmployeeShiftStartTime(), getLeaves(), getSettings(), TAB_SLUGS, TABS, detectIp() (+3 more)

### Community 7 - "store.js"
Cohesion: 0.05
Nodes (48): DEFAULT_SETTINGS, DEFAULT_SHIFTS, APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths (+40 more)

### Community 8 - "monthKey"
Cohesion: 0.29
Nodes (11): filterRecordsForStatsPeriod(), lastMonthKey(), monthKey(), monthKeysBetween(), monthsForStatsPeriod(), pad(), recordInPeriod(), resolveJoinDate() (+3 more)

### Community 9 - "AdminTasks"
Cohesion: 0.22
Nodes (11): TaskBoard(), AdminTasks(), closeMenu(), handleMenuOutside(), nameOf(), groupByStatus(), isOverdue(), nextStatus() (+3 more)

### Community 10 - "AttendanceRecords"
Cohesion: 0.15
Nodes (13): attendanceMonthsLoaded(), resolveAttendanceCorrection(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove(), exportAttendanceExcel() (+5 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.14
Nodes (15): updateTaskStatusByEmployee(), EmployeeTasks(), assignerLabel(), bump(), closeMenu(), handleClickOutside(), handleCreate(), move() (+7 more)

### Community 12 - "RequestsTab"
Cohesion: 0.15
Nodes (16): setCabRequestStatus(), handleClickOutside(), RequestsTab(), decide(), handleApprove(), handleClickOutside(), handleReject(), TodayTab() (+8 more)

### Community 13 - "EmployeeRecords"
Cohesion: 0.25
Nodes (8): updateEmployeeTeam(), EmployeeRecords(), closeEdit(), closeMenu(), handleClickOutside(), openReview(), saveEdit(), startEdit()

### Community 14 - "deleteTask"
Cohesion: 0.11
Nodes (21): addTaskMessageByAdmin(), approveTaskClosure(), deleteTask(), deleteTaskByAssignee(), deleteTaskByManager(), getDeletedTasks(), getTaskById(), isSelfAssignedTask() (+13 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.17
Nodes (15): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+7 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.21
Nodes (11): App(), Home(), Protected(), AnimatedThemeToggle(), SPRING, SUN_PATHS, AuthContext, useAuth() (+3 more)

### Community 18 - "write"
Cohesion: 0.07
Nodes (32): createAnnouncement(), createCabRequest(), createITIssue(), createTicket(), deleteAnnouncement(), deleteCabRequest(), getAnnouncements(), getCabRequests() (+24 more)

### Community 19 - "notifications.js"
Cohesion: 0.16
Nodes (34): getAnnouncementsForEmployee(), getCabRequestsForEmployee(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getProfiles(), getReadNotificationIds(), getReimbursementsForEmployee() (+26 more)

### Community 20 - "MyCab"
Cohesion: 0.12
Nodes (23): clearCabChat(), getCabClearedAt(), changesParts(), CabLegCard(), MyCab(), closeMenu(), confirmWithdraw(), handleClickOutside() (+15 more)

### Community 21 - "formatDate"
Cohesion: 0.17
Nodes (10): LeaveThread(), TaskThread(), LEAVE_TYPES, STATUS_FILTER_OPTS, TYPE_FILTER_OPTS, BALANCE_ICONS, LEAVE_STATUS_FILTERS, LEAVE_TYPE_FILTERS (+2 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, dependencies, clsx, framer-motion, html2pdf.js (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "AttendanceRecords.jsx"
Cohesion: 0.15
Nodes (13): AttendanceCorrectionThread(), exportSalariesExcel(), CORRECTION_STATUS_FILTER_OPTS, monthFilterOptions(), PERIOD_FILTER_OPTS, STATUS_FILTER_OPTS, VALID_TABS, correctionIssueLabel() (+5 more)

### Community 26 - "MessagesTab"
Cohesion: 0.23
Nodes (12): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), MessagesTab() (+4 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (13): addTask(), addTaskMessage(), handleCreate(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), handleApproveClosure() (+5 more)

### Community 28 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "EmployeeTasks.jsx"
Cohesion: 0.14
Nodes (23): TaskForm(), TASK_PRIORITIES, TASK_STATUSES, ASSIGNED_DURING_FILTER_OPTS, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, canEmployeeAskQuestion(), canEmployeeDeleteTask() (+15 more)

### Community 32 - "EmployeeITHelpDesk"
Cohesion: 0.08
Nodes (20): addITIssueComment(), assignITIssue(), getITStaff(), getITStaffById(), AdminITHelpDesk(), closeMenu(), handleAssigneeChange(), handleClickOutside() (+12 more)

### Community 33 - "ProfileWizard.jsx"
Cohesion: 0.13
Nodes (15): FileField(), handlePick(), todayStr(), LeaveDocumentList(), DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick() (+7 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getEmployeeById"
Cohesion: 0.08
Nodes (34): handleLogout(), ThemeProvider(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), managerDecideLeave() (+26 more)

### Community 36 - "attendance.js"
Cohesion: 0.27
Nodes (19): getShiftForEmployee(), AdminDashboard(), todayKey(), clockMinutesFromIso(), computeAttendanceAverages(), computeMonthAverages(), computeMonthRawAverages(), currentState() (+11 more)

### Community 37 - "getProfileForEmployee"
Cohesion: 0.15
Nodes (19): applyLeave(), getProfileForEmployee(), requestProfileUpdate(), reviewProfile(), reviewProfileUpdateRequest(), saveProfileDraft(), submitProfile(), todayKey() (+11 more)

### Community 38 - "getEmployees"
Cohesion: 0.17
Nodes (14): assignEmployeeShift(), getCabAssignmentForEmployee(), getCabAssignments(), getDriverRunSheet(), buildStops(), personInfo(), getEmployees(), getMyTeamDirectory() (+6 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "DriversTab"
Cohesion: 0.23
Nodes (11): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+3 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 45 - "getOvertimeRequests"
Cohesion: 0.07
Nodes (45): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getOvertimeRequestsForEmployee(), otStage(), rejectOvertime() (+37 more)

### Community 50 - "CabManagement.jsx"
Cohesion: 0.15
Nodes (12): DropdownSelect(), getFocusableElements(), Modal(), focusables(), onKeyDown(), TimeInput(), EMPTY_TRIP_FORM, TAB_SLUGS (+4 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "read"
Cohesion: 0.18
Nodes (17): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+9 more)

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "EmployeeDashboard"
Cohesion: 0.18
Nodes (12): getAttendance(), getAttendanceForEmployee(), getTodayRecord(), upsertRecord(), EmployeeDashboard(), closeMenu(), endBreak(), guard() (+4 more)

### Community 62 - "profile.js"
Cohesion: 0.32
Nodes (11): EmployeeProfile(), canRequestProfileUpdate(), docCount(), isEditable(), isValidAadhaar(), isValidIfsc(), isValidPan(), isValidPhone() (+3 more)

### Community 64 - "TripsTab"
Cohesion: 0.24
Nodes (9): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+1 more)

### Community 70 - "ShiftsTab"
Cohesion: 0.10
Nodes (29): addShift(), approveShiftChange(), deleteShift(), getShiftChangeRequests(), getShifts(), rejectShiftChange(), requestShiftChange(), updateShift() (+21 more)

### Community 71 - "useTableControls"
Cohesion: 0.12
Nodes (14): ANNOUNCEMENT_TYPES, SHIFT_CHANGE_STATUSES, useTableControls(), AdminAnnouncements(), closeMenu(), handleClickOutside(), ANNOUNCEMENT_TYPE_OPTS, ANNOUNCEMENT_TYPE_OPTS (+6 more)

### Community 78 - "NotificationBell"
Cohesion: 0.21
Nodes (15): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh() (+7 more)

### Community 79 - "VehiclesTab"
Cohesion: 0.22
Nodes (9): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), submitAdd() (+1 more)

### Community 80 - "EmployeeTickets.jsx"
Cohesion: 0.25
Nodes (6): TicketThread(), TICKET_STATUSES, TICKET_KIND_OPTS, TICKET_STATUS_OPTS, TICKET_KIND_OPTS, TICKET_STATUS_OPTS

### Community 81 - "Layout.jsx"
Cohesion: 0.60
Nodes (5): Layout(), readNavCollapsed(), getTeamUnreadCount(), getUnreadAnnouncementCount(), profilePhotoUrl()

### Community 82 - "getAttendanceCorrections"
Cohesion: 0.25
Nodes (11): addAttendanceCorrectionMessage(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), withdrawAttendanceCorrection(), confirmCorrectionWithdraw(), handleCorrectionEdit() (+3 more)

### Community 83 - "usePagination"
Cohesion: 0.36
Nodes (6): usePagination(), MyShiftTab(), TAB_SLUGS, TABS, DEFAULT_PAGE_SIZE, paginate()

### Community 84 - "origin-button.tsx"
Cohesion: 0.36
Nodes (7): assignRef(), ButtonHTMLAttributesForMotion, FILL_EASE, getCoverDiameter(), hasTextContent(), OriginButton, OriginButtonProps

### Community 85 - "getReimbursements"
Cohesion: 0.36
Nodes (8): approveReimbursementClaim(), getReimbursements(), markReimbursementPaid(), rejectReimbursementClaim(), handleApprove(), handleMarkPaid(), handleReject(), refresh()

### Community 86 - "AssignTab"
Cohesion: 0.67
Nodes (3): setCabAssignment(), AssignTab(), save()

## Knowledge Gaps
- **195 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets`, `MyTeam.jsx`, `EmployeeReimbursements.jsx`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeRecords`, `MyCab`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeTasks.jsx`, `EmployeeITHelpDesk`, `ProfileWizard.jsx`, `getEmployeeById`, `attendance.js`, `CabManagement.jsx`, `EmployeeDashboard`, `profile.js`, `ShiftsTab`, `useTableControls`, `EmployeeTickets.jsx`, `usePagination`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets`, `MyTeam.jsx`, `EmployeeReimbursements.jsx`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeRecords`, `MyCab`, `formatDate`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeTasks.jsx`, `EmployeeITHelpDesk`, `getEmployeeById`, `attendance.js`, `getEmployees`, `DriversTab`, `getOvertimeRequests`, `CabManagement.jsx`, `EmployeeDashboard`, `TripsTab`, `ShiftsTab`, `VehiclesTab`, `EmployeeTickets.jsx`, `usePagination`, `AssignTab`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `usePagination` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets`, `MyTeam.jsx`, `EmployeeReimbursements.jsx`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeRecords`, `MyCab`, `formatDate`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeTasks.jsx`, `EmployeeITHelpDesk`, `getEmployeeById`, `attendance.js`, `getEmployees`, `DriversTab`, `getOvertimeRequests`, `CabManagement.jsx`, `EmployeeDashboard`, `TripsTab`, `ShiftsTab`, `useTableControls`, `VehiclesTab`, `EmployeeTickets.jsx`, `AssignTab`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `leaves.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06597222222222222 - nodes in this community are weakly interconnected._
- **Should `EmployeeITHelpDesk.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._