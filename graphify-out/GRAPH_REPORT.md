# Graph Report - WorkBuddy EMS  (2026-09-11)

## Corpus Check
- 111 files · ~107,717 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1338 nodes · 4269 edges · 72 communities (61 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be906a62`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- write
- AdminProfiles.jsx
- sampleData.js
- refreshStoreFromSupabase
- profile.js
- EmployeeReimbursements.jsx
- usePagination
- store.js
- Settings
- getTasks
- read
- EmployeeTasks
- formatDate
- EmployeeTasks.jsx
- getEmployees
- origin-button.tsx
- compilerOptions
- App.jsx
- EmployeeDashboard
- notifications.js
- getShiftChangeRequests
- getProfileForEmployee
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- AttendanceRecords
- MessagesTab
- TeamTasksPanel
- EmployeeITHelpDesk.jsx
- components.json
- tasks.js
- DriversTab
- TripsTab
- VehiclesTab
- package.json
- getEmployeeById
- useTableControls
- next-themes
- AdminTasks
- Product
- leaflet
- RequestsTab
- check-leaves.mjs
- AttendanceRecords.jsx
- tailwind-merge
- AdminOvertime.jsx
- vite.config.js
- ChatSection
- scripts
- ShiftFormModal
- EmployeeDashboard.jsx
- WorkBuddy EMS — Agent Instructions
- attendance.js
- @supabase/supabase-js
- supabase-setup.sql
- AuthContext.jsx
- getAttendanceCorrections
- downloadExcelXlsx
- monthKey
- ProfileWizard
- TaskBoard.jsx
- MapPicker.jsx
- getDriverRunSheet
- EmployeeAnnouncements
- getAnnouncements
- NotificationBell
- CabManagement.jsx
- CabManagement
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `write()` - 96 edges
2. `formatDate()` - 74 edges
3. `useTableControls()` - 67 edges
4. `usePagination()` - 65 edges
5. `getEmployeeById()` - 64 edges
6. `useAuth()` - 57 edges
7. `EmployeeDashboard()` - 53 edges
8. `read()` - 42 edges
9. `AttendanceRecords()` - 40 edges
10. `MyCab()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `validateForSubmit()`  [EXTRACTED]
  src/components/ProfileWizard.jsx → src/utils/profile.js
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployees()`  [EXTRACTED]
  src/pages/CabManagement.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeLeaves.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (72 total, 11 thin omitted)

### Community 0 - "write"
Cohesion: 0.06
Nodes (71): LeaveForm(), changeType(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), createCabRequest(), deleteCabRequest(), getLeaveById() (+63 more)

### Community 1 - "AdminProfiles.jsx"
Cohesion: 0.12
Nodes (22): addEmployee(), reviewProfile(), reviewProfileUpdateRequest(), updateEmployeeTeam(), EmployeeRecords(), approveUpdateRequest(), changeReportsTo(), closeAddEmployee() (+14 more)

### Community 2 - "sampleData.js"
Cohesion: 0.07
Nodes (36): TicketForm(), TicketThread(), DEFAULT_SETTINGS, DEFAULT_SHIFTS, REIMBURSEMENT_STATUSES, SHIFT_CHANGE_STATUSES, TICKET_CATEGORIES, TICKET_STATUSES (+28 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.16
Nodes (25): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceForDate(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow() (+17 more)

### Community 4 - "profile.js"
Cohesion: 0.13
Nodes (20): FileField(), handlePick(), todayStr(), LeaveDocumentList(), PhotoField(), handlePick(), todayStr(), ProfileView() (+12 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.08
Nodes (43): ReimbursementClaimDetail(), ReimbursementForm(), ReimbursementThread(), REIMBURSEMENT_CATEGORIES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), getReimbursementsForEmployee() (+35 more)

### Community 6 - "usePagination"
Cohesion: 0.16
Nodes (25): Avatar(), getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination(), SortableTh(), TableEmpty() (+17 more)

### Community 7 - "store.js"
Cohesion: 0.06
Nodes (43): APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS, dataReadyPromise (+35 more)

### Community 8 - "Settings"
Cohesion: 0.18
Nodes (3): saveSettings(), Settings(), handleSave()

### Community 9 - "getTasks"
Cohesion: 0.18
Nodes (17): deleteTask(), deleteTaskByAssignee(), deleteTaskByManager(), getTaskById(), getTasks(), getTasksForAssignee(), isSelfAssignedTask(), updateTaskByAssignee() (+9 more)

### Community 10 - "read"
Cohesion: 0.20
Nodes (16): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+8 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.15
Nodes (12): addTaskMessage(), EmployeeTasks(), assignerLabel(), bump(), closeMenu(), handleClickOutside(), handleCreate(), handleTaskReply() (+4 more)

### Community 12 - "formatDate"
Cohesion: 0.07
Nodes (59): BLANK_FORM, CelebrationAdminPanel(), closeForm(), confirmDelete(), handleSubmit(), toggleVisible(), KIND_OPTS, CelebrationCard() (+51 more)

### Community 13 - "EmployeeTasks.jsx"
Cohesion: 0.14
Nodes (19): TaskForm(), STATUS_COLORS, TaskForChart, TaskStatusChart(), TaskStatusKey, TaskThread(), TASK_PRIORITIES, TASK_STATUSES (+11 more)

### Community 14 - "getEmployees"
Cohesion: 0.15
Nodes (20): addShift(), assignEmployeeShift(), deleteShift(), getEmployees(), getMyTeammates(), getShifts(), getTeamMembers(), updateEmployeeSalary() (+12 more)

### Community 15 - "origin-button.tsx"
Cohesion: 0.16
Nodes (16): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, DonutChart, DonutChartProps, DonutChartSegment (+8 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.19
Nodes (15): App(), Home(), Protected(), Layout(), readNavCollapsed(), AnimatedThemeToggle(), SPRING, SUN_PATHS (+7 more)

### Community 18 - "EmployeeDashboard"
Cohesion: 0.15
Nodes (15): applyCorrectionToAttendance(), findOrCreateAttendanceRecord(), getAttendance(), getAttendanceForEmployee(), getTodayRecord(), upsertRecord(), EmployeeDashboard(), closeMenu() (+7 more)

### Community 19 - "notifications.js"
Cohesion: 0.19
Nodes (29): getAnnouncementsForEmployee(), getCabRequests(), getCabRequestsForEmployee(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getOvertimeRequestsForEmployee(), getProfiles() (+21 more)

### Community 20 - "getShiftChangeRequests"
Cohesion: 0.18
Nodes (17): approveShiftChange(), getShiftChangeRequests(), getShiftChangeRequestsForEmployee(), rejectShiftChange(), requestShiftChange(), updateShiftChangeRequest(), withdrawShiftChangeRequest(), AdminShifts() (+9 more)

### Community 21 - "getProfileForEmployee"
Cohesion: 0.29
Nodes (13): getProfileForEmployee(), requestProfileUpdate(), saveProfileDraft(), submitProfile(), upsertProfile(), EmployeeProfile(), handleRequestUpdate(), handleSaveDraft() (+5 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, dependencies, clsx, framer-motion, html2pdf.js (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "AttendanceRecords"
Cohesion: 0.18
Nodes (11): attendanceMonthsLoaded(), resolveAttendanceCorrection(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove(), handleClickOutside() (+3 more)

### Community 26 - "MessagesTab"
Cohesion: 0.22
Nodes (11): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabUnreadByEmployee(), markCabThreadRead(), MessagesTab(), chooseEmployee() (+3 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.16
Nodes (10): addTask(), approveTaskClosure(), TeamTasksPanel(), bump(), closeMenu(), handleApproveClosure(), handleClickOutside(), handleCreate() (+2 more)

### Community 28 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (43): DropdownSelect(), ITIssueThread(), IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, addITIssueComment(), assignITIssue(), createITIssue() (+35 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.17
Nodes (20): statusCell(), statusCell(), canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), canManagerChangeStatus(), chartBucketKey() (+12 more)

### Community 31 - "DriversTab"
Cohesion: 0.23
Nodes (11): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+3 more)

### Community 32 - "TripsTab"
Cohesion: 0.24
Nodes (9): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+1 more)

### Community 33 - "VehiclesTab"
Cohesion: 0.22
Nodes (9): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), submitAdd() (+1 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getEmployeeById"
Cohesion: 0.09
Nodes (29): getEmployeeById(), getMyTeamDirectory(), managerDecideLeave(), managerDecideOvertime(), AdminAnnouncements(), closeMenu(), handleClickOutside(), nameOf() (+21 more)

### Community 36 - "useTableControls"
Cohesion: 0.18
Nodes (10): withdrawOvertimeRequest(), useTableControls(), bump(), OvertimeTable(), closeMenu(), handleClickOutside(), handleWithdraw(), refreshRequests() (+2 more)

### Community 38 - "AdminTasks"
Cohesion: 0.20
Nodes (11): addTaskMessageByAdmin(), updateTaskByAdmin(), AdminTasks(), assignerLabel(), bump(), closeMenu(), handleCreate(), handleEdit() (+3 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "RequestsTab"
Cohesion: 0.16
Nodes (15): setCabRequestStatus(), handleClickOutside(), RequestsTab(), changesParts(), decide(), handleApprove(), handleClickOutside(), handleReject() (+7 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 43 - "AttendanceRecords.jsx"
Cohesion: 0.19
Nodes (9): AttendanceCorrectionThread(), CORRECTION_STATUS_FILTER_OPTS, monthFilterOptions(), PERIOD_FILTER_OPTS, STATUS_FILTER_OPTS, VALID_TABS, correctionIssueLabel(), monthKeyOffset() (+1 more)

### Community 45 - "AdminOvertime.jsx"
Cohesion: 0.10
Nodes (40): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getOvertimeRequests(), getOvertimeRequestsByMonth(), otStage(), rejectOvertime(), requestOvertime() (+32 more)

### Community 50 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 53 - "EmployeeDashboard.jsx"
Cohesion: 0.23
Nodes (8): AttendanceCorrectionForm(), ATTENDANCE_CORRECTION_ISSUES, TAB_SLUGS, TABS, detectIp(), ATTENDANCE_STATS_PERIODS, checkOfficeNetwork(), fetchPublicIp()

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "attendance.js"
Cohesion: 0.24
Nodes (19): AdminDashboard(), todayKey(), recordStatus(), clockMinutesFromIso(), computeAttendanceAverages(), computeMonthAverages(), computeMonthRawAverages(), currentState() (+11 more)

### Community 58 - "AuthContext.jsx"
Cohesion: 0.24
Nodes (9): handleLogout(), ThemeProvider(), AuthContext, AuthProvider(), login(), logout(), getDriverById(), whenDataReady() (+1 more)

### Community 59 - "getAttendanceCorrections"
Cohesion: 0.23
Nodes (12): addAttendanceCorrectionMessage(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), withdrawAttendanceCorrection(), handleReply(), confirmCorrectionWithdraw() (+4 more)

### Community 60 - "downloadExcelXlsx"
Cohesion: 0.32
Nodes (5): exportSalariesExcel(), exportAttendanceExcel(), dateToExcelSerial(), displayValue(), downloadExcelXlsx()

### Community 61 - "monthKey"
Cohesion: 0.43
Nodes (8): filterRecordsForStatsPeriod(), lastMonthKey(), monthKey(), monthKeysBetween(), monthsForStatsPeriod(), pad(), recordInPeriod(), statsPeriodLabel()

### Community 63 - "TaskBoard.jsx"
Cohesion: 0.46
Nodes (7): TaskBoard(), groupByStatus(), isOverdue(), nextStatus(), prevStatus(), priorityLabel(), priorityTagClass()

### Community 67 - "getDriverRunSheet"
Cohesion: 1.00
Nodes (3): getDriverRunSheet(), buildStops(), personInfo()

### Community 70 - "EmployeeAnnouncements"
Cohesion: 0.28
Nodes (6): ANNOUNCEMENT_TYPES, EmployeeAnnouncements(), closeMenu(), handleClickOutside(), announcementTypeLabel(), announcementTypeTagClass()

### Community 71 - "getAnnouncements"
Cohesion: 0.22
Nodes (9): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), getReadAnnouncements(), getUnreadAnnouncementCount(), markAnnouncementAsRead(), confirmDelete(), handleSubmit() (+1 more)

### Community 78 - "NotificationBell"
Cohesion: 0.21
Nodes (15): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh() (+7 more)

### Community 80 - "CabManagement.jsx"
Cohesion: 0.09
Nodes (38): clearCabChat(), getCabAssignmentForEmployee(), getCabAssignments(), getCabClearedAt(), getCabMessagesForEmployee(), setCabAssignment(), updateCabRequest(), AssignTab() (+30 more)

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `write`, `AdminProfiles.jsx`, `sampleData.js`, `profile.js`, `EmployeeReimbursements.jsx`, `usePagination`, `EmployeeTasks`, `EmployeeTasks.jsx`, `EmployeeDashboard`, `getShiftChangeRequests`, `getProfileForEmployee`, `AttendanceRecords`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `tasks.js`, `getEmployeeById`, `AdminTasks`, `RequestsTab`, `AttendanceRecords.jsx`, `AdminOvertime.jsx`, `EmployeeDashboard.jsx`, `attendance.js`, `TaskBoard.jsx`, `EmployeeAnnouncements`, `CabManagement.jsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `write`, `AdminProfiles.jsx`, `sampleData.js`, `EmployeeReimbursements.jsx`, `usePagination`, `EmployeeTasks`, `formatDate`, `EmployeeTasks.jsx`, `getEmployees`, `EmployeeDashboard`, `getShiftChangeRequests`, `AttendanceRecords`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `AdminTasks`, `RequestsTab`, `AttendanceRecords.jsx`, `AdminOvertime.jsx`, `EmployeeDashboard.jsx`, `attendance.js`, `EmployeeAnnouncements`, `CabManagement.jsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `usePagination` to `write`, `AdminProfiles.jsx`, `sampleData.js`, `EmployeeReimbursements.jsx`, `EmployeeTasks`, `formatDate`, `EmployeeTasks.jsx`, `getEmployees`, `EmployeeDashboard`, `getShiftChangeRequests`, `AttendanceRecords`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `useTableControls`, `AdminTasks`, `RequestsTab`, `AttendanceRecords.jsx`, `AdminOvertime.jsx`, `EmployeeDashboard.jsx`, `attendance.js`, `EmployeeAnnouncements`, `CabManagement.jsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `write` be split into smaller, more focused modules?**
  _Cohesion score 0.05823293172690763 - nodes in this community are weakly interconnected._
- **Should `AdminProfiles.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._