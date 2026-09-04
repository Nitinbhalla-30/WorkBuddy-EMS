# Graph Report - WorkBuddy EMS  (2026-09-03)

## Corpus Check
- 120 files · ~114,460 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1346 nodes · 4252 edges · 87 communities (71 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea1a3747`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EmployeeLeaves.jsx
- getSettings
- sampleData.js
- refreshStoreFromSupabase
- ProfileWizard.jsx
- EmployeeReimbursements.jsx
- EmployeeReimbursements
- store.js
- attendance.js
- AdminTasks
- AttendanceRecords
- EmployeeTasks
- Celebrations.jsx
- TeamTasks.jsx
- AdminReimbursements
- origin-button.tsx
- compilerOptions
- App.jsx
- EmployeeRecords
- notifications.js
- write
- getProfileForEmployee
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- AttendanceRecords.jsx
- bump
- TeamTasksPanel
- EmployeeITHelpDesk.jsx
- components.json
- EmployeeTasks.jsx
- CabManagement.jsx
- TripsTab
- VehiclesTab
- package.json
- getEmployeeById
- AdminDashboard
- next-themes
- getShiftChangeRequests
- Product
- leaflet
- RequestsTab
- check-leaves.mjs
- tailwind-merge
- useTableControls
- vite.config.js
- profile.js
- scripts
- TeamChat.jsx
- ensureAttendanceMonths
- WorkBuddy EMS — Agent Instructions
- EmployeeDashboard
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- ProfileWizard
- pushKeyToSupabase
- ShiftsTab
- ReimbursementThread
- tasks
- AuthContext.jsx
- EmployeeAnnouncements
- public.attendance_corrections
- public.it_issues
- public.tickets
- public.it_issues
- NotificationBell
- formatDate
- MyCab.jsx
- getDriverRunSheet
- AdminAnnouncements
- getTasks
- EmployeeDashboard.jsx
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `write()` - 95 edges
2. `formatDate()` - 74 edges
3. `useTableControls()` - 67 edges
4. `usePagination()` - 65 edges
5. `getEmployeeById()` - 60 edges
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
  src/pages/TeamTasks.jsx → src/data/store.js
- `handleSave()` --calls--> `saveSettings()`  [EXTRACTED]
  src/pages/Settings.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (87 total, 16 thin omitted)

### Community 0 - "EmployeeLeaves.jsx"
Cohesion: 0.07
Nodes (64): LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves(), getLeavesForEmployee() (+56 more)

### Community 1 - "getSettings"
Cohesion: 0.12
Nodes (11): TimeInput(), ATTENDANCE_CORRECTION_ISSUES, getEmployeeShiftStartTime(), getSettings(), getShiftForEmployee(), Settings(), detectIp(), handleSave() (+3 more)

### Community 2 - "sampleData.js"
Cohesion: 0.07
Nodes (40): TicketForm(), TicketThread(), DEFAULT_SETTINGS, DEFAULT_SHIFTS, REIMBURSEMENT_STATUSES, SHIFT_CHANGE_STATUSES, TICKET_CATEGORIES, TICKET_STATUSES (+32 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.21
Nodes (17): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), flushQueuedRowDeletes(), healDeletedTaskRows(), initStore(), loadCriticalData(), loadPendingDeletes() (+9 more)

### Community 4 - "ProfileWizard.jsx"
Cohesion: 0.16
Nodes (11): FileField(), handlePick(), todayStr(), LeaveDocumentList(), DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick() (+3 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.22
Nodes (14): ReimbursementClaimDetail(), ReimbursementForm(), REIMBURSEMENT_CATEGORIES, CATEGORY_FILTER_OPTS, STATUS_FILTER_OPTS, CATEGORY_FILTERS, STATUS_FILTERS, formatDateDDMMYYYY() (+6 more)

### Community 6 - "EmployeeReimbursements"
Cohesion: 0.18
Nodes (14): getReimbursementsForEmployee(), retrySyncReimbursementClaim(), submitReimbursementClaimSynced(), syncClaimRow(), updateReimbursementClaim(), withdrawReimbursementClaim(), EmployeeReimbursements(), closeMenu() (+6 more)

### Community 7 - "store.js"
Cohesion: 0.07
Nodes (32): APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS (+24 more)

### Community 8 - "attendance.js"
Cohesion: 0.26
Nodes (16): monthFilterOptions(), currentState(), filterRecordsForStatsPeriod(), lastMonthKey(), monthKey(), monthKeyOffset(), monthKeysBetween(), monthLabel() (+8 more)

### Community 9 - "AdminTasks"
Cohesion: 0.26
Nodes (9): AdminTasks(), bump(), closeMenu(), confirmDelete(), handleCreate(), handleEdit(), handleFollowUpReply(), handleMenuOutside() (+1 more)

### Community 10 - "AttendanceRecords"
Cohesion: 0.18
Nodes (12): ensureAttendanceForDate(), resolveAttendanceCorrection(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove(), handleClickOutside() (+4 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.16
Nodes (13): addTask(), EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside(), handleCreate() (+5 more)

### Community 12 - "Celebrations.jsx"
Cohesion: 0.07
Nodes (54): CelebrationAdminPanel(), closeForm(), confirmDelete(), handleSubmit(), toggleVisible(), CelebrationCard(), KIND_ICONS, CELEBRATION_EVENT_TYPES (+46 more)

### Community 13 - "TeamTasks.jsx"
Cohesion: 0.15
Nodes (18): TaskForm(), STATUS_COLORS, TaskForChart, TaskStatusChart(), TaskStatusKey, TASK_PRIORITIES, TASK_STATUSES, addTaskMessageByAdmin() (+10 more)

### Community 14 - "AdminReimbursements"
Cohesion: 0.23
Nodes (14): addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), markReimbursementPaid(), rejectReimbursementClaim(), AdminReimbursements(), closeMenu(), handleApprove() (+6 more)

### Community 15 - "origin-button.tsx"
Cohesion: 0.16
Nodes (16): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, DonutChart, DonutChartProps, DonutChartSegment (+8 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.15
Nodes (17): App(), Home(), Protected(), Layout(), handleLogout(), readNavCollapsed(), AnimatedThemeToggle(), SPRING (+9 more)

### Community 18 - "EmployeeRecords"
Cohesion: 0.20
Nodes (11): reviewProfile(), EmployeeRecords(), closeEdit(), closeMenu(), handleClickOutside(), openReview(), profileOf(), returnForFix() (+3 more)

### Community 19 - "notifications.js"
Cohesion: 0.22
Nodes (25): getAnnouncementsForEmployee(), getDeletedTasks(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getReadNotificationIds(), getTasksForAssignee(), getTickets() (+17 more)

### Community 20 - "write"
Cohesion: 0.13
Nodes (23): clearCabChat(), createCabRequest(), deleteCabRequest(), getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), getCabClearedAt(), getCabClearedAtAdmin() (+15 more)

### Community 21 - "getProfileForEmployee"
Cohesion: 0.21
Nodes (18): getProfileForEmployee(), getProfiles(), requestProfileUpdate(), reviewProfileUpdateRequest(), saveProfileDraft(), submitProfile(), todayKey(), upsertProfile() (+10 more)

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
Cohesion: 0.17
Nodes (10): AttendanceCorrectionThread(), attendanceMonthsLoaded(), exportSalariesExcel(), CORRECTION_STATUS_FILTER_OPTS, PERIOD_FILTER_OPTS, STATUS_FILTER_OPTS, VALID_TABS, dateToExcelSerial() (+2 more)

### Community 26 - "bump"
Cohesion: 0.20
Nodes (14): addCabMessage(), clearCabChatAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), CabManagement(), bump() (+6 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.14
Nodes (12): addTaskMessage(), getTeamMembers(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete(), handleApproveClosure() (+4 more)

### Community 28 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (43): DropdownSelect(), ITIssueThread(), IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, addITIssueComment(), assignITIssue(), createITIssue() (+35 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "EmployeeTasks.jsx"
Cohesion: 0.15
Nodes (24): ASSIGNED_DURING_FILTER_OPTS, statusCell(), inAssignedDuring(), TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, statusCell(), canEmployeeAskQuestion(), canEmployeeDeleteTask() (+16 more)

### Community 31 - "CabManagement.jsx"
Cohesion: 0.18
Nodes (13): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), DriversTab(), confirmDelete(), savePin() (+5 more)

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
Cohesion: 0.10
Nodes (30): getEmployeeById(), getMyTeamDirectory(), getMyTeammates(), managerDecideLeave(), managerDecideOvertime(), nameOf(), nameOf(), nameOf() (+22 more)

### Community 36 - "AdminDashboard"
Cohesion: 0.18
Nodes (17): AdminDashboard(), todayKey(), exportAttendanceExcel(), recordStatus(), clockMinutesFromIso(), computeAttendanceAverages(), computeMonthAverages(), computeMonthRawAverages() (+9 more)

### Community 38 - "getShiftChangeRequests"
Cohesion: 0.17
Nodes (18): approveShiftChange(), getShiftChangeRequests(), getShiftChangeRequestsForEmployee(), rejectShiftChange(), requestShiftChange(), updateShiftChangeRequest(), withdrawShiftChangeRequest(), AdminShifts() (+10 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "RequestsTab"
Cohesion: 0.18
Nodes (14): setCabRequestStatus(), handleClickOutside(), RequestsTab(), decide(), handleApprove(), handleClickOutside(), handleReject(), TodayTab() (+6 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 45 - "useTableControls"
Cohesion: 0.06
Nodes (81): Avatar(), BLANK_FORM, KIND_OPTS, getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination() (+73 more)

### Community 50 - "profile.js"
Cohesion: 0.26
Nodes (10): ProfileView(), DOCUMENT_TYPES, blankProfile(), docCount(), isValidAadhaar(), isValidIfsc(), isValidPan(), isValidPhone() (+2 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "TeamChat.jsx"
Cohesion: 0.27
Nodes (12): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+4 more)

### Community 53 - "ensureAttendanceMonths"
Cohesion: 0.33
Nodes (9): ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow(), mapLimited(), monthBounds(), snakeToCamel(), transformRow() (+1 more)

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "EmployeeDashboard"
Cohesion: 0.12
Nodes (21): addAttendanceCorrectionMessage(), getAttendanceCorrectionById(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), upsertRecord(), withdrawAttendanceCorrection() (+13 more)

### Community 63 - "pushKeyToSupabase"
Cohesion: 0.40
Nodes (6): flushRowDeletes(), pushKeyToSupabase(), queueRowDelete(), runPush(), savePendingDeletes(), scheduleRetryPush()

### Community 64 - "ShiftsTab"
Cohesion: 0.23
Nodes (13): addShift(), deleteShift(), getShiftById(), getShifts(), updateShift(), closeMenu(), handleClickOutside(), ShiftsTab() (+5 more)

### Community 70 - "AuthContext.jsx"
Cohesion: 0.31
Nodes (7): ThemeProvider(), AuthContext, AuthProvider(), login(), getDriverById(), whenDataReady(), handleSubmit()

### Community 71 - "EmployeeAnnouncements"
Cohesion: 0.19
Nodes (10): getReadAnnouncements(), getUnreadAnnouncementCount(), isAnnouncementRead(), markAnnouncementAsRead(), EmployeeAnnouncements(), closeMenu(), handleClickOutside(), handleOpen() (+2 more)

### Community 78 - "NotificationBell"
Cohesion: 0.21
Nodes (15): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh() (+7 more)

### Community 79 - "formatDate"
Cohesion: 0.27
Nodes (8): TaskBoard(), TaskThread(), formatDate(), groupByStatus(), nextStatus(), prevStatus(), priorityLabel(), priorityTagClass()

### Community 80 - "MyCab.jsx"
Cohesion: 0.12
Nodes (25): changesParts(), StopCard(), CabLegCard(), ChatSection(), handleKeyDown(), send(), REQUEST_STATUS_FILTER_OPTS, requestChangeSummary() (+17 more)

### Community 81 - "getDriverRunSheet"
Cohesion: 0.28
Nodes (8): getCabAssignmentForEmployee(), getCabAssignments(), getDriverRunSheet(), buildStops(), personInfo(), setCabAssignment(), AssignTab(), save()

### Community 82 - "AdminAnnouncements"
Cohesion: 0.21
Nodes (8): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), AdminAnnouncements(), closeMenu(), confirmDelete(), handleClickOutside(), handleSubmit()

### Community 83 - "getTasks"
Cohesion: 0.36
Nodes (11): approveTaskClosure(), deleteTask(), deleteTaskByAssignee(), deleteTaskByManager(), getTaskById(), getTasks(), isSelfAssignedTask(), updateTaskByAssignee() (+3 more)

### Community 84 - "EmployeeDashboard.jsx"
Cohesion: 0.25
Nodes (7): AttendanceCorrectionForm(), getAttendance(), getAttendanceForEmployee(), getTodayRecord(), TAB_SLUGS, TABS, ATTENDANCE_STATS_PERIODS

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `EmployeeLeaves.jsx`, `sampleData.js`, `attendance.js`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `Celebrations.jsx`, `TeamTasks.jsx`, `EmployeeRecords`, `write`, `getProfileForEmployee`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `EmployeeTasks.jsx`, `CabManagement.jsx`, `getEmployeeById`, `AdminDashboard`, `getShiftChangeRequests`, `RequestsTab`, `useTableControls`, `profile.js`, `EmployeeDashboard`, `ReimbursementThread`, `EmployeeAnnouncements`, `MyCab.jsx`, `AdminAnnouncements`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `EmployeeLeaves.jsx`, `sampleData.js`, `EmployeeReimbursements.jsx`, `EmployeeReimbursements`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `Celebrations.jsx`, `TeamTasks.jsx`, `AdminReimbursements`, `EmployeeRecords`, `write`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `EmployeeTasks.jsx`, `CabManagement.jsx`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `AdminDashboard`, `getShiftChangeRequests`, `RequestsTab`, `EmployeeDashboard`, `ShiftsTab`, `EmployeeAnnouncements`, `MyCab.jsx`, `getDriverRunSheet`, `AdminAnnouncements`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `useTableControls` to `EmployeeLeaves.jsx`, `sampleData.js`, `EmployeeReimbursements.jsx`, `EmployeeReimbursements`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `Celebrations.jsx`, `TeamTasks.jsx`, `AdminReimbursements`, `EmployeeRecords`, `write`, `AttendanceRecords.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `EmployeeTasks.jsx`, `CabManagement.jsx`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `AdminDashboard`, `getShiftChangeRequests`, `RequestsTab`, `EmployeeDashboard`, `ShiftsTab`, `EmployeeAnnouncements`, `MyCab.jsx`, `getDriverRunSheet`, `AdminAnnouncements`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EmployeeLeaves.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06550632911392405 - nodes in this community are weakly interconnected._
- **Should `getSettings` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._