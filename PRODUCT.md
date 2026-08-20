# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Internal teams at a micro/small company — employees, managers, HR/admin, IT support staff, and cab drivers. The product is built by a senior data analyst for their own company, targeting the operational reality of micro and small-sized businesses.

- **Employees** — self-service for attendance, leave, salary, tasks, reimbursements, cab booking, queries, and announcements. Non-technical; use the app daily for routine transactions.
- **Admin / HR** — approve leaves, manage salaries, assign tasks, oversee cab operations, handle queries & grievances, manage employee profiles, send announcements. Power users who need scanability and efficiency across large tables.
- **IT Support staff** — manage IT help desk tickets. Specialist role with a focused workflow.
- **Drivers** — view their daily run sheet (pickups and drops in chronological order). Mobile-first, glanceable, usable while on the road.

## Product Purpose

WorkBuddy EMS is a unified employee management system that replaces scattered spreadsheets, WhatsApp groups, and disconnected tools with a single, coherent platform. It covers the full employee lifecycle: attendance tracking, leave management (with India-specific probation rules), salary computation (PF/ESI), task management, cab coordination, reimbursements, queries & grievances, IT help desk, and company announcements.

Success means: employees can self-serve without asking HR; admins can process payroll, approve leaves, and manage cabs in one place; drivers get a clear daily run sheet; and the company has a single source of truth for all employee operations.

## Positioning

An all-in-one employee management platform purpose-built for micro and small companies in India. Unlike enterprise HR suites (SAP SuccessFactors, Darwinbox) that are expensive and over-engineered for small teams, WorkBuddy EMS is lightweight, opinionated, and includes India-specific compliance (PF, ESI, professional tax rules, Indian holidays) and unique operational modules like cab management with driver run sheets that generic HR tools do not cover.

## Operating Context

- **India-based company** — statutory compliance (Provident Fund 12%, ESI 0.75% with threshold), Indian public holidays, IST time zone.
- **Desktop + mobile** — admin/HR primarily on desktop; employees increasingly on mobile; drivers exclusively on mobile.
- **Internal intranet tool** — accessed within the company network (IP-check option for attendance), simple ID + PIN authentication (test phase; secure auth planned for later).
- **Dev server** — `npm run dev` on port 5174; test logins: EMP001/1111, ADM001/0000, IT001/5555, DRV01/1234.
- **Data layer** — Supabase (PostgreSQL) with localStorage fallback; sample data for development.

## Capabilities and Constraints

**Modules:**
- Attendance tracking with late marking, holiday awareness, and lunch break policy
- Leave management with 5 types (casual, sick, earned, half-day, short, unpaid), probation-based eligibility, manager→HR auto-escalation workflow
- Salary computation with India-specific deductions (PF, ESI), payslip PDF export
- Task management with status tracking, assignment, and Kanban board
- Cab management with vehicles, drivers, trips (pickup/drop), employee assignment, and driver run sheets
- Reimbursement claims with approval workflow
- Queries & Grievances (ticket system) with threading
- IT Help Desk for IT support ticket management
- Company announcements with read tracking
- Employee profiles with document management
- Team attendance overview for managers

**Technical constraints:**
- React 18 + Vite 5 + Tailwind CSS 3 + Supabase
- Framer Motion for animation, Leaflet for maps, html2pdf.js for PDF export, XLSX for Excel export
- Light/dark theme system with CSS custom properties
- lucide-react for icons (strictly no emoji in UI)
- Plus Jakarta Sans as the typeface

## Brand Commitments

- **Name:** WorkBuddy
- **Primary color:** Trust Teal (#0F766E light / #2DD4BF dark)
- **Typeface:** Plus Jakarta Sans (400–800 weights)
- **Icon style:** lucide-react SVG icons only — no emoji anywhere in UI
- **Theme:** Light/dark dual theme with CSS variables
- **Accent palette:** Teal primary, amber for pickup/warmth, ocean blue for drop/cool, semantic green/amber/red for status tones

## Evidence on Hand

- Fully functional application with 30+ pages/components across employee and admin views
- Sample dataset with realistic Indian employee names, departments, and operational data
- Established design token system in `src/styles.css` with CSS custom properties
- Supabase schema in `supabase-setup.sql` and load test data in `supabase-load-test-data.sql`

## Product Principles

1. **Scanability over decoration** — Admin and HR users process hundreds of rows daily; tables, status chips, and stat cards must be immediately scannable with clear visual hierarchy.
2. **Self-service first** — Every employee-facing flow should be completable without contacting HR; clear labels, inline validation, and progressive disclosure reduce support burden.
3. **Operational reality over theoretical UX** — Drivers read run sheets on mobile while on the road; employees check attendance during commute; the design must work in real-world, glance-and-go contexts.
4. **India-native by default** — Statutory compliance (PF, ESI, holidays), Indian naming conventions, and local operational patterns (cab pooling, lunch break policies) are first-class, not afterthoughts.
5. **Consistency builds trust** — A unified design language across all modules (tokens, spacing, interaction patterns) makes the system feel like one product, not a collection of pages.

## Accessibility & Inclusion

Standard web accessibility for an internal corporate tool: keyboard navigable, sufficient color contrast (WCAG AA), screen reader compatible form labels and icon aria-labels. Mobile-responsive for employees and drivers who primarily use phones.
