---
name: WorkBuddy EMS
description: "A precision employee management cockpit — clean, efficient, trustworthy, with warm modern inviting details."
colors:
  trust-teal: "#0f766e"
  trust-teal-deep: "#115e59"
  trust-teal-bright: "#2dd4bf"
  surface-teal: "#e6f2f1"
  slate-ink: "#0f172a"
  slate-muted: "#64748b"
  slate-bg: "#f5f8fa"
  slate-card: "#ffffff"
  slate-line: "#e4e9ef"
  good-green: "#059669"
  warm-amber: "#d97706"
  alert-red: "#dc2626"
  ocean-blue: "#0369a1"
  pickup-amber: "#92400e"
  pickup-amber-bg: "#fef3c7"
  drop-blue: "#1e40af"
  drop-blue-bg: "#dbeafe"
  dark-ink: "#e6edf3"
  dark-bg: "#0e1417"
  dark-card: "#171e22"
  dark-line: "#273239"
  dark-surface-teal: "#123b37"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.trust-teal}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-primary-hover:
    backgroundColor: "{colors.trust-teal-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-default:
    backgroundColor: "{colors.slate-card}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-default-hover:
    backgroundColor: "#f1f5f7"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-danger:
    backgroundColor: "{colors.alert-red}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  card-default:
    backgroundColor: "{colors.slate-card}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-default:
    backgroundColor: "{colors.slate-card}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  tag-pill:
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.slate-muted}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
  nav-item-active:
    backgroundColor: "{colors.surface-teal}"
    textColor: "{colors.trust-teal}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
---

# Design System: WorkBuddy EMS

## Overview

**Creative North Star: "The Operations Cockpit"**

WorkBuddy EMS is a precision instrument for employee management — a cockpit where every gauge, switch, and indicator earns its place through utility. The visual language communicates calm authority: the admin who opens this system at 9 AM should immediately feel oriented, informed, and in control. Data-dense tables, status chips, and stat cards are scannable at a glance because every pixel has a job.

But precision does not mean cold. The modern & inviting mood lives in the details: the warm teal that greets you on the login brand panel, the confident weight of a primary button press, the gentle amber glow of a pickup card, the satisfying pill-shape of a status tab. Rounded corners (8–14px) keep surfaces friendly without feeling casual. The Plus Jakarta Sans typeface carries personality in its geometric curves while maintaining professional legibility at small sizes. The system sits between sterile enterprise and flashy consumer — it is neither a gray bureaucratic form nor a gradient-drenched startup toy. It is a well-crafted tool that respects the person using it.

**Key Characteristics:**

- **Scanability first** — tables, stat cards, and status chips designed for rapid visual parsing by power users
- **Tactile confidence** — buttons have weight, cards feel solid, inputs respond clearly to interaction
- **Flat & tonal depth** — surfaces layered through color tint and borders, not heavy shadows
- **Warm precision** — Trust Teal as a living presence, amber and ocean blue as functional accents, slate neutrals for calm structure
- **India-native details** — statutory labels, Indian naming conventions, and local operational patterns as first-class content

## Colors

A focused palette led by Trust Teal, supported by slate neutrals for structure, and accented with semantic green, warm amber, alert red, and ocean blue for information.

### Primary
- **Trust Teal** (#0f766e): The system's identity color. Used on primary buttons, active navigation, brand marks, links, focus rings, and any element that says "this is WorkBuddy." Deep variant (#115e59) for hover states. Bright variant (#2dd4bf) for dark mode.

### Secondary
- **Ocean Blue** (#0369a1): Informational tone for charts, task status (To Do), and cool-accent contexts. Harmonizes with teal without competing. Dark mode shifts to sky blue (#38bdf8).

### Neutral
- **Slate Ink** (#0f172a): Primary text color. Near-black with a cool blue undertone that keeps text sharp without the harshness of pure black.
- **Slate Muted** (#64748b): Secondary text — labels, hints, timestamps, table headers. Legible but clearly subordinate to ink.
- **Slate Background** (#f5f8fa): Page canvas. Cool off-white that reduces eye strain compared to pure white.
- **Slate Card** (#ffffff): Elevated surfaces — cards, modals, sidebar. White against the gray background creates tonal layering without shadows.
- **Slate Line** (#e4e9ef): Borders, dividers, table rules. Visible enough to define structure, subtle enough to disappear when not needed.

### Semantic
- **Good Green** (#059669): Success states, "Present" attendance, completed tasks, approved leaves. Background tints at 12% opacity.
- **Warm Amber** (#d97706): Warnings, "Late" attendance, in-progress states, caution notices. Background tints at 14% opacity.
- **Alert Red** (#dc2626): Errors, "Absent" status, destructive actions, overdue items. Used sparingly — its rarity is the point.

### Domain-Specific
- **Pickup Amber** (#92400e on #fef3c7): Driver run sheet pickup stops. Sunrise warmth that harmonizes with the teal topbar.
- **Drop Blue** (#1e40af on #dbeafe): Driver run sheet drop stops. Ocean cool that contrasts with amber for colorblind-safe distinction.

**The One Voice Rule.** Trust Teal appears on at most one primary action per viewport. Its rarity is what makes it powerful. When everything is teal, nothing is.

## Typography

**Display Font:** Plus Jakarta Sans (with Segoe UI, Roboto, Helvetica, Arial fallbacks)
**Body Font:** Plus Jakarta Sans (same family — single-family system for consistency)

**Character:** Plus Jakarta Sans is geometric yet warm — its rounded terminals and open counters give it personality at display sizes while maintaining excellent legibility at the 12–14px working sizes that dominate a data-dense management app. The single-family approach means no font-pairing cognitive load; hierarchy is expressed entirely through weight, size, and letter-spacing.

### Hierarchy
- **Display** (800, 36px, line-height 1.15, -0.03em): Login brand headline only. Maximum impact, used once.
- **Headline** (700, 22px, line-height 1.3, -0.02em): Page titles (h2). The anchor of every content view.
- **Title** (700, 15px, line-height 1.4, -0.02em): Section headings, card titles, modal headers.
- **Body** (400, 14px, line-height 1.5): Working text — table cells, form inputs, messages, descriptions. The workhorse.
- **Label** (600, 12.5px, line-height 1.2, 0.02em): Form field labels, table column headers (uppercased with 0.05em spacing), stat card labels when paired with color.

### Named Rules
**The Weight Ladder Rule.** Only three weights in the system: 400 (body), 600 (labels, emphasis), 700–800 (headlines, numbers). Never use 500 or 300 — the ladder has clear rungs and no ambiguity.

## Layout

The app shell is a fixed-viewport flex layout: 60px topbar + 235px sidebar + fluid content area. The sidebar collapses to a horizontal scroll bar on mobile (720px breakpoint). Content padding is 26px on desktop, reducing naturally on smaller viewports.

**Grid & density:** Stat cards use `auto-fit` grids (min 150px) that reflow from 4–5 columns on desktop to 2 columns on mobile. Tables are full-width with 11px × 12px cell padding — tight enough for data density, loose enough for readability. The spacing rhythm follows an 8px-based scale (4, 8, 12, 16, 20, 24, 32px) with occasional 10px and 14px for fine-tuning.

**Responsive behavior:** Single breakpoint at 720px flips sidebar to horizontal nav, stacks board columns vertically, and expands message bubbles to full width. The driver run sheet page is mobile-first by design (max-width 720px centered) with 44px minimum tap targets for phone use.

**The No-Scroll Shell Rule.** The app shell uses `height: 100vh` with `overflow: hidden` — only the content area scrolls. Sidebar and topbar stay fixed. This prevents the "double scrollbar" problem and keeps navigation always accessible.

## Elevation & Depth

This system is flat & tonal. Depth is conveyed through color tint and borders, not shadows. A card sits on the page not because it casts a shadow, but because it's white against a cool gray background — the contrast IS the elevation.

The one shadow token (`0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)`) is used sparingly on cards and modals as a subtle ambient lift, not as the primary depth mechanism. Dark mode deepens this shadow for contrast against darker backgrounds.

**The Ghost Border Rule.** When a surface needs separation but shadows feel too heavy, use a 1px border in `--line` color. It defines edges without adding visual weight. Every card, modal, and input in the system uses this approach.

## Shapes

Corner strategy follows a graduated scale: 4px for tiny elements (checkboxes, code snippets), 8px for interactive controls (buttons, inputs, nav items), 10–12px for containers (cards, task cards, board columns), 14px for prominent surfaces (modals, driver sections), and 999px for pills (tabs, tags, status indicators, wizard steps).

The overall feel is gently curved — never sharp or boxy, never overly rounded. The 8px default radius on buttons and inputs is the system's "handshake" — friendly enough to feel approachable, structured enough to feel professional.

**The Pill Doctrine.** Tags, status indicators, and tab controls always use fully rounded pills (999px). This creates a consistent visual language for "small classification elements" that is distinct from the rectangular containers they live within.

## Components

### Buttons
- **Shape:** Gently rounded corners (8px radius). Confident padding (9px 16px) that gives the button physical presence.
- **Primary:** Trust Teal background with white text. Hover deepens to #115e59. The system's single most important color — used once per action context.
- **Default:** White background with slate line border. Hover shifts to #f1f5f7. The workhorse button for secondary actions.
- **Danger:** Alert Red background with white text. Hover deepens. Used for destructive actions only.
- **Active/Pressed:** All buttons translate 1px down on `:active` — a tactile "push" feedback that confirms the click.
- **Disabled:** 50% opacity, not-allowed cursor. No color change — the same button, just unavailable.

### Cards / Containers
- **Corner Style:** 12px radius — the system's standard container shape.
- **Background:** White (light) / #171e22 (dark) — tonal lift against the gray page canvas.
- **Shadow Strategy:** Subtle ambient shadow (the one shadow token) for cards; no shadow for nested containers.
- **Border:** 1px slate line — the primary edge definition.
- **Internal Padding:** 20px standard; 12–14px for compact cards (task cards, board columns).

### Inputs / Fields
- **Style:** 1px slate line stroke, white background, 8px radius, 10px 12px padding. Height: 42px in toolbars.
- **Focus:** Border shifts to Trust Teal with a 3px teal glow ring (using `color-mix` at 18% opacity). Clear, accessible, on-brand.
- **Error:** Alert Red text in a red-tinted error box above the field. The field itself keeps its normal border — error context is in the message, not the input chrome.

### Chips / Tags
- **Style:** Pill-shaped (999px radius), 12px font, 600 weight, 3px 10px padding. Background tints at 12–14% of the semantic color.
- **Variants:** ok (green), late (amber), absent (gray), high (red), medium (amber), low (teal), pickup (amber), drop (blue), event (green), general (gray).
- **State:** Static classification — not interactive. Always paired with a colored background + matching text color.

### Navigation
- **Style:** 235px sidebar with 8px-radius items. 13.5px font, 500 weight default, 600 weight active.
- **Default:** Slate Muted text on transparent background.
- **Hover:** Subtle tinted background shift (#eef3f5 light / #1f2a30 dark) with text moving to slate ink.
- **Active:** Surface Teal background (#e6f2f1) with Trust Teal text — the active item is unmistakable.
- **Mobile:** Collapses to horizontal scroll bar at 720px breakpoint with nowrap labels.

### Stat Cards
- **Shape:** 12px radius card with a 34px rounded-10 icon chip (the "stat chip") above the number.
- **Color assignment:** The stat chip carries the semantic color — blue (info), amber (warn), red (bad), green (good), teal (default). The number itself takes the same color at 30px/800 weight for instant recognition.
- **Interaction:** When used as quick-filter toggles (task status), active cards get a teal border ring.

### Message Bubbles
- **Style:** 10px radius with a 3px corner on the sender's side (bottom-left for incoming, bottom-right for outgoing). Borderless — depth comes from background tint alone.
- **Incoming:** #f1f5f7 (light) / #1f2a30 (dark)
- **Outgoing/Mine:** #e6f2f1 (light teal tint) / #123b37 (dark teal tint)

## Do's and Don'ts

### Do:
- **Do** use Trust Teal as the single primary accent — one primary action per viewport, active navigation, brand marks, and focus rings.
- **Do** use 1px borders in `--line` color as the primary edge definition between surfaces — this is the system's depth language.
- **Do** use pill-shaped tags (999px radius) with semantic color tints for all status classification — green for success, amber for warning, red for error, gray for neutral.
- **Do** maintain the 44px minimum tap target on all interactive elements, especially on the driver run sheet where phone use is the primary context.
- **Do** use Plus Jakarta Sans exclusively — express hierarchy through weight (400/600/700/800) and size, never by introducing a second typeface.
- **Do** use `color-mix()` for tinted backgrounds — 12% for good/red, 14% for amber, 18% for focus rings. This keeps the palette consistent across light and dark themes.

### Don't:
- **Don't** use emoji anywhere in the UI — lucide-react SVG icons with aria-labels are the only graphical elements allowed.
- **Don't** use heavy drop shadows for depth — the system is flat & tonal. White-on-gray IS the elevation.
- **Don't** introduce additional border radii beyond the graduated scale (4/8/10/12/14/999px) — consistency in corner treatment is non-negotiable.
- **Don't** use more than three font weights in any context (400 body, 600 emphasis, 700–800 headlines) — the Weight Ladder has no in-between rungs.
- **Don't** make interactive elements rely on hover alone for state communication — always provide a visible default state that differs clearly from the surrounding chrome.
- **Don't** use raw hex colors in component styles — always reference CSS custom properties (`--brand`, `--good`, `--warn`, `--bad`, etc.) so dark mode works automatically.
- **Don't** create decorative gradients or glassmorphism effects — the login brand panel's subtle teal gradient is the system's maximum decorative expression.
