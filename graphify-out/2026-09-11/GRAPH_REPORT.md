# Graph Report - WorkBuddy EMS  (2026-09-11)

## Corpus Check
- 120 files · ~116,058 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1351 nodes · 4260 edges · 83 communities (66 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be906a62`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatDate
- EmployeeRecords
- sampleData.js
- refreshStoreFromSupabase
- profile.js
- EmployeeReimbursements
- MyTeam.jsx
- store.js
- write
- getTasks
- TeamChat.jsx
- EmployeeTasks
- Celebrations.jsx
- EmployeeTasks.jsx
- syncClaimRow
- TaskStatusChart.tsx
- compilerOptions
- App.jsx
- formatFileSize
- notifications.js
- MyCab
- getProfileForEmployee
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- writeImmediate
- read
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
- tailwind-merge
- getSettings
- vite.config.js
- ChatSection
- scripts
- ShiftFormModal
- usePagination
- WorkBuddy EMS — Agent Instructions
- attendance.js
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- ProfileWizard
- TaskBoard.jsx
- MapPicker.jsx
- getDriverRunSheet
- tasks
- AuthContext.jsx
- getAnnouncements
- public.attendance_corrections
- public.it_issues
- public.tickets
- public.it_issues
- NotificationBell
- MyCab.jsx
- CabManagement.jsx
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `write()` - 96 edges
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
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminReimbursements.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeReimbursements.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (83 total, 17 thin omitted)

### Community 0 - "formatDate"
Cohesion: 0.07
Nodes (65): LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves(), getLeavesForEmployee() (+57 more)

### Community 1 - "EmployeeRecords"
Cohesion: 0.14
Nodes (19): addEmployee(), reviewProfile(), reviewProfileUpdateRequest(), updateEmployeeTeam(), EmployeeRecords(), approveUpdateRequest(), changeReportsTo(), closeAddEmployee() (+11 more)

### Community 2 - "sampleData.js"
Cohesion: 0.09
Nodes (29): TicketForm(), TicketThread(), SHIFT_CHANGE_STATUSES, TICKET_CATEGORIES, TICKET_STATUSES, addTicketMessage(), getTicketsForHR(), AdminTickets() (+21 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.18
Nodes (22): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), fetchAllFromTable(), fetchAttendanceWindow(), flushQueuedRowDeletes(), healDeletedTaskRows(), initStore() (+14 more)

### Community 4 - "profile.js"
Cohesion: 0.27
Nodes (10): ProfileView(), STEPS, DOCUMENT_TYPES, docCount(), isValidAadhaar(), isValidIfsc(), isValidPan(), isValidPhone() (+2 more)

### Community 5 - "EmployeeReimbursements"
Cohesion: 0.12
Nodes (18): ReimbursementClaimDetail(), ReimbursementThread(), REIMBURSEMENT_STATUSES, AdminReimbursements(), closeMenu(), handleClickOutside(), nameOf(), EmployeeReimbursements() (+10 more)

### Community 6 - "MyTeam.jsx"
Cohesion: 0.14
Nodes (27): Avatar(), BLANK_FORM, KIND_OPTS, getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination() (+19 more)

### Community 7 - "store.js"
Cohesion: 0.06
Nodes (34): DEFAULT_SETTINGS, DEFAULT_SHIFTS, APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths (+26 more)

### Community 8 - "write"
Cohesion: 0.08
Nodes (31): addReimbursementMessage(), approveReimbursementClaim(), createCabRequest(), createTicket(), deleteCabRequest(), getCabRequests(), markReimbursementPaid(), rejectReimbursementClaim() (+23 more)

### Community 9 - "getTasks"
Cohesion: 0.23
Nodes (15): addTaskMessageByAdmin(), approveTaskClosure(), deleteTask(), deleteTaskByAssignee(), deleteTaskByManager(), getTaskById(), getTasks(), isSelfAssignedTask() (+7 more)

### Community 10 - "TeamChat.jsx"
Cohesion: 0.27
Nodes (12): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+4 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.15
Nodes (15): EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside(), handleEdit(), move() (+7 more)

### Community 12 - "Celebrations.jsx"
Cohesion: 0.07
Nodes (53): CelebrationAdminPanel(), closeForm(), confirmDelete(), handleSubmit(), toggleVisible(), CelebrationCard(), KIND_ICONS, CELEBRATION_EVENT_TYPES (+45 more)

### Community 13 - "EmployeeTasks.jsx"
Cohesion: 0.17
Nodes (13): TaskForm(), TaskThread(), TASK_PRIORITIES, TASK_STATUSES, STORE_KEYS, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, ASSIGNED_DURING_FILTER_OPTS (+5 more)

### Community 14 - "syncClaimRow"
Cohesion: 0.24
Nodes (11): retrySyncReimbursementClaim(), savePendingWrites(), submitReimbursementClaimSynced(), syncClaimRow(), updateReimbursementClaim(), withdrawReimbursementClaim(), confirmWithdraw(), handleEdit() (+3 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.12
Nodes (22): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+14 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.17
Nodes (14): App(), Home(), Protected(), Layout(), readNavCollapsed(), AnimatedThemeToggle(), SPRING, SUN_PATHS (+6 more)

### Community 18 - "formatFileSize"
Cohesion: 0.22
Nodes (8): FileField(), handlePick(), todayStr(), LeaveDocumentList(), PhotoField(), handlePick(), todayStr(), formatFileSize()

### Community 19 - "notifications.js"
Cohesion: 0.06
Nodes (63): addShift(), approveShiftChange(), deleteShift(), getAnnouncementsForEmployee(), getAttendanceCorrectionsForEmployee(), getCabRequestsForEmployee(), getDeletedTasks(), getDismissedNotificationIds() (+55 more)

### Community 20 - "MyCab"
Cohesion: 0.20
Nodes (11): getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), setCabCancellation(), MyCab(), closeMenu(), handleClickOutside(), handleEditRequest() (+3 more)

### Community 21 - "getProfileForEmployee"
Cohesion: 0.22
Nodes (16): getProfileForEmployee(), getProfiles(), requestProfileUpdate(), saveProfileDraft(), submitProfile(), upsertProfile(), profileOf(), EmployeeProfile() (+8 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, dependencies, clsx, framer-motion, html2pdf.js (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "writeImmediate"
Cohesion: 0.20
Nodes (12): flushRowDeletes(), getNotificationReadsMap(), getReadNotificationIds(), markAllNotificationsRead(), markNotificationRead(), pushKeyToSupabase(), queueRowDelete(), runPush() (+4 more)

### Community 26 - "read"
Cohesion: 0.19
Nodes (14): addCabMessage(), clearCabChat(), clearCabChatAdmin(), getCabClearedAt(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), markCabThreadRead() (+6 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (14): addTask(), addTaskMessage(), handleCreate(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete() (+6 more)

### Community 28 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (36): DropdownSelect(), ITIssueThread(), addITIssueComment(), assignITIssue(), createITIssue(), getITStaff(), getITStaffById(), reopenITIssue() (+28 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.21
Nodes (16): canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), canManagerChangeStatus(), chartBucketKey(), closureNotice(), EMPLOYEE_ASSIGNED_STATUSES (+8 more)

### Community 31 - "DriversTab"
Cohesion: 0.22
Nodes (10): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), DriversTab(), confirmDelete(), savePin() (+2 more)

### Community 32 - "TripsTab"
Cohesion: 0.24
Nodes (10): addTrip(), deleteTrip(), getTrips(), updateTrip(), bump(), TripsTab(), confirmDelete(), normalize() (+2 more)

### Community 33 - "VehiclesTab"
Cohesion: 0.22
Nodes (9): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), submitAdd() (+1 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getEmployeeById"
Cohesion: 0.07
Nodes (40): handleLogout(), ThemeProvider(), AuthProvider(), login(), logout(), assignEmployeeShift(), getDriverById(), getEmployeeById() (+32 more)

### Community 36 - "useTableControls"
Cohesion: 0.22
Nodes (6): ReimbursementForm(), REIMBURSEMENT_CATEGORIES, useTableControls(), CATEGORY_FILTERS, STATUS_FILTERS, compareValues()

### Community 38 - "AdminTasks"
Cohesion: 0.25
Nodes (8): AdminTasks(), bump(), closeMenu(), confirmDelete(), handleCreate(), handleMenuOutside(), move(), nameOf()

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "RequestsTab"
Cohesion: 0.15
Nodes (16): handleClickOutside(), RequestsTab(), changesParts(), decide(), handleApprove(), handleClickOutside(), handleReject(), TodayTab() (+8 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 45 - "getSettings"
Cohesion: 0.05
Nodes (55): Payslip(), approveOvertime(), ensureAttendanceMonths(), ensureAttendanceRange(), getApprovedOvertimeForMonth(), getEmployeeShiftStartTime(), getOvertimeRequests(), getOvertimeRequestsByMonth() (+47 more)

### Community 50 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 53 - "usePagination"
Cohesion: 0.36
Nodes (6): usePagination(), MyShiftTab(), TAB_SLUGS, TABS, DEFAULT_PAGE_SIZE, paginate()

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "attendance.js"
Cohesion: 0.05
Nodes (85): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), attendanceMonthsLoaded(), ensureAttendanceForDate(), getAttendance(), getAttendanceCorrectionById() (+77 more)

### Community 63 - "TaskBoard.jsx"
Cohesion: 0.46
Nodes (7): TaskBoard(), groupByStatus(), isOverdue(), nextStatus(), prevStatus(), priorityLabel(), priorityTagClass()

### Community 67 - "getDriverRunSheet"
Cohesion: 0.67
Nodes (4): getDriverRunSheet(), buildStops(), personInfo(), DriverView()

### Community 70 - "AuthContext.jsx"
Cohesion: 0.17
Nodes (9): AuthContext, ANNOUNCEMENT_TYPES, AdminAnnouncements(), closeMenu(), handleClickOutside(), ANNOUNCEMENT_TYPE_OPTS, ANNOUNCEMENT_TYPE_OPTS, READ_FILTER_OPTS (+1 more)

### Community 71 - "getAnnouncements"
Cohesion: 0.22
Nodes (9): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), getReadAnnouncements(), getUnreadAnnouncementCount(), markAnnouncementAsRead(), confirmDelete(), handleSubmit() (+1 more)

### Community 78 - "NotificationBell"
Cohesion: 0.39
Nodes (8): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh()

### Community 80 - "MyCab.jsx"
Cohesion: 0.16
Nodes (20): dismissAllNotifications(), StopCard(), CabLegCard(), REQUEST_STATUS_FILTER_OPTS, requestChangeSummary(), RequestForm(), submit(), TAB_SLUGS (+12 more)

### Community 81 - "CabManagement.jsx"
Cohesion: 0.16
Nodes (11): TimeInput(), getCabAssignmentForEmployee(), getCabAssignments(), getCabUnreadByEmployee(), setCabAssignment(), AssignTab(), save(), CabManagement() (+3 more)

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `EmployeeRecords`, `sampleData.js`, `profile.js`, `EmployeeReimbursements`, `MyTeam.jsx`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `notifications.js`, `MyCab`, `getProfileForEmployee`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `tasks.js`, `getEmployeeById`, `AdminTasks`, `RequestsTab`, `usePagination`, `attendance.js`, `TaskBoard.jsx`, `AuthContext.jsx`, `MyCab.jsx`, `CabManagement.jsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `formatDate`, `EmployeeRecords`, `sampleData.js`, `EmployeeReimbursements`, `MyTeam.jsx`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `notifications.js`, `MyCab`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `AdminTasks`, `RequestsTab`, `getSettings`, `usePagination`, `attendance.js`, `AuthContext.jsx`, `MyCab.jsx`, `CabManagement.jsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `usePagination` to `formatDate`, `EmployeeRecords`, `sampleData.js`, `EmployeeReimbursements`, `MyTeam.jsx`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `notifications.js`, `MyCab`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `useTableControls`, `AdminTasks`, `RequestsTab`, `getSettings`, `attendance.js`, `AuthContext.jsx`, `MyCab.jsx`, `CabManagement.jsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatDate` be split into smaller, more focused modules?**
  _Cohesion score 0.06759259259259259 - nodes in this community are weakly interconnected._
- **Should `EmployeeRecords` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._