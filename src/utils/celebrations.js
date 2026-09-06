// Everything the Celebrations module calculates, kept away from the UI.
//
// Birthdays, new joiners and work anniversaries are never stored. They are
// derived from the employee directory and the onboarding profile on every read,
// so a corrected joining date is reflected the same second and nothing has to be
// regenerated at the turn of a year. Festivals and national days come from the
// system calendar in data/celebrationsData.js, plus whatever HR adds.
//
// All dates here are date-only 'YYYY-MM-DD' keys, handled as whole numbers
// built by hand. `new Date('2026-09-04')` parses as UTC midnight and shows the
// previous evening west of Greenwich, which is exactly how a birthday ends up on
// the wrong day, so nothing in this file goes through the UTC parser.

import {
  CELEBRATION_FUTURE_DAYS,
  CELEBRATION_KINDS,
  CELEBRATION_LOOKAHEAD_DAYS,
  CELEBRATION_PAST_DAYS,
  DATED_CELEBRATIONS,
  DEFAULT_NEW_JOINER_WINDOW_DAYS,
  FIXED_DATE_CELEBRATIONS
} from '../data/celebrationsData.js'
import { formatDate, todayDateKey } from './attendance.js'

const DAY_MS = 86400000

// ---- date-key helpers (local, no UTC parsing) ----

// 'YYYY-MM-DD' -> { y, m, d }, or null when the string is not a real date.
export function splitDateKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''))
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  // Reject 31 June and friends: a garbage date in the directory should leave
  // the person off the page rather than throw while it renders.
  const check = new Date(y, m - 1, d)
  if (check.getFullYear() !== y || check.getMonth() !== m - 1 || check.getDate() !== d) return null
  return { y, m, d }
}

export function isDateKey(key) {
  return splitDateKey(key) !== null
}

// Some records carry a full timestamp where a date was intended.
function toDateKey(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const head = text.slice(0, 10)
  return isDateKey(head) ? head : ''
}

function keyFromParts(y, m, d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${y}-${p(m)}-${p(d)}`
}

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

// Whole days from `fromKey` to `toKey` (negative when toKey is earlier).
export function daysBetweenKeys(fromKey, toKey) {
  const a = splitDateKey(fromKey)
  const b = splitDateKey(toKey)
  if (!a || !b) return 0
  const utcA = Date.UTC(a.y, a.m - 1, a.d)
  const utcB = Date.UTC(b.y, b.m - 1, b.d)
  return Math.round((utcB - utcA) / DAY_MS)
}

// A date key moved by whole days.
export function shiftDateKey(key, days) {
  const p = splitDateKey(key)
  if (!p) return ''
  const d = new Date(p.y, p.m - 1, p.d + days)
  return keyFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

// 1 -> '1st', 2 -> '2nd', 3 -> '3rd', 11 -> '11th', 21 -> '21st'.
export function ordinal(n) {
  const teens = n % 100
  if (teens >= 11 && teens <= 13) return `${n}th`
  const last = n % 10
  if (last === 1) return `${n}st`
  if (last === 2) return `${n}nd`
  if (last === 3) return `${n}rd`
  return `${n}th`
}

export function celebrationKindLabel(kind) {
  return CELEBRATION_KINDS[kind]?.label || 'Celebration'
}

// The accent class for one celebration kind. Every kind has its own hue in
// styles.css (celebration-tone-*), so a card, or the empty state naming the
// next occasion, can be tinted by the same rule.
export function celebrationToneClass(kind) {
  return `celebration-tone-${kind}`
}

// First word of a name — the greeting reads "Happy birthday, Rahul!" while the
// identity line underneath keeps the full name.
function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there'
}

// Every date between the two keys (inclusive) that carries the given MM-DD.
// A '02-29' pair (a leap-year birthday) lands on 28 February in a common year,
// so those employees are still celebrated instead of silently disappearing.
function monthDayOccurrences(monthDay, fromKey, toKey) {
  const from = splitDateKey(fromKey)
  const to = splitDateKey(toKey)
  if (!from || !to || !monthDay) return []
  const [mm, dd] = monthDay.split('-').map(Number)
  const found = []
  for (let y = from.y; y <= to.y; y += 1) {
    let day = dd
    let month = mm
    if (month === 2 && day === 29 && !isLeapYear(y)) day = 28
    const key = keyFromParts(y, month, day)
    if (key >= fromKey && key <= toKey) found.push(key)
  }
  return found
}

// ---- people directory shaping ----

// Birth dates and photos live on the onboarding profile, not the employee row,
// so both are indexed once per build instead of searched per employee.
function indexProfiles(profiles) {
  const map = {}
  for (const p of profiles || []) {
    if (!p || !p.employeeId) continue
    const personal = p.personal || {}
    map[p.employeeId] = {
      dob: toDateKey(personal.dob),
      photoUrl: personal.photo?.dataUrl || ''
    }
  }
  return map
}

function personOf(employee, profileInfo) {
  return {
    id: employee.id,
    name: employee.name || employee.id,
    department: employee.department || '',
    designation: employee.designation || '',
    photoUrl: profileInfo?.photoUrl || ''
  }
}

// ---- calendar shaping ----

// The system calendar resolved to real dates for one year. Entries with no date
// for that year are left out rather than guessed at.
//
// `includeUndated` keeps those gaps in the result with an empty date instead.
// The management table asks for that, because an occasion silently missing from
// the list looks the same as one HR decided not to observe.
export function systemCalendarRowsForYear(year, { hiddenIds = [], includeUndated = false } = {}) {
  const hidden = new Set(hiddenIds || [])
  const fixed = FIXED_DATE_CELEBRATIONS.map((c) => ({
    ...c,
    source: 'system',
    known: true,
    date: keyFromParts(year, Number(c.monthDay.slice(0, 2)), Number(c.monthDay.slice(3, 5)))
  }))
  const dated = DATED_CELEBRATIONS.map((c) => {
    const date = toDateKey(c.dates?.[String(year)])
    return { ...c, source: 'system', known: isDateKey(date), date: isDateKey(date) ? date : '' }
  })
  return [...fixed, ...dated]
    .filter((c) => (includeUndated || c.known) && !hidden.has(c.id))
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.name.localeCompare(b.name))
}

export function systemCelebrationsForYear(year, { hiddenIds = [] } = {}) {
  return systemCalendarRowsForYear(year, { hiddenIds })
}

// Same list including the years the window touches, so a celebration near New
// Year does not vanish because it belongs to next January.
function systemCelebrationsInRange({ fromKey, toKey, hiddenIds }) {
  const fromYear = Number(fromKey.slice(0, 4))
  const toYear = Number(toKey.slice(0, 4))
  const all = []
  for (let y = fromYear; y <= toYear; y += 1) {
    all.push(...systemCelebrationsForYear(y, { hiddenIds }))
  }
  return all.filter((c) => c.date >= fromKey && c.date <= toKey)
}

// HR/Admin-added organisation-wide occasions. A recurring one repeats on its
// month and day every year; a dated one appears once.
function customCelebrationsInRange({ events, fromKey, toKey }) {
  const out = []
  for (const ev of events || []) {
    if (!ev || !isDateKey(toDateKey(ev.date))) continue
    const date = toDateKey(ev.date)
    const occurrences = ev.recurring
      ? monthDayOccurrences(date.slice(5), fromKey, toKey)
      : [date].filter((d) => d >= fromKey && d <= toKey)
    for (const day of occurrences) {
      out.push({
        id: ev.id,
        source: 'custom',
        kind: CELEBRATION_KINDS[ev.kind] ? ev.kind : 'occasion',
        name: ev.name || 'Special occasion',
        date: day,
        greeting: ev.greeting || '',
        wish: ev.message || ''
      })
    }
  }
  return out
}

// ---- the entry point ----

// Builds every celebration in the window, oldest first.
export function buildCelebrations({
  employees = [],
  profiles = [],
  events = [],
  hiddenSystemIds = [],
  newJoinerDays = DEFAULT_NEW_JOINER_WINDOW_DAYS,
  futureDays = CELEBRATION_FUTURE_DAYS,
  today = todayDateKey()
} = {}) {
  if (!isDateKey(today)) return []
  const fromKey = shiftDateKey(today, -CELEBRATION_PAST_DAYS)
  const toKey = shiftDateKey(today, futureDays)
  const profileInfo = indexProfiles(profiles)
  const out = []

  for (const emp of employees) {
    if (!emp || !emp.id) continue
    const person = personOf(emp, profileInfo[emp.id])
    const dob = profileInfo[emp.id]?.dob || ''
    const joined = toDateKey(emp.dateJoined)

    // Birthday — month and day only. The year of birth never leaves this
    // function: it is not stored on the event and the card has no field for it.
    if (dob && dob <= today) {
      for (const date of monthDayOccurrences(dob.slice(5), fromKey, toKey)) {
        out.push({
          id: `birthday-${emp.id}-${date}`,
          kind: 'birthday',
          source: 'employee',
          date,
          person,
          headline: `Happy birthday, ${firstName(person.name)}!`,
          message: 'Wishing you a great year ahead.'
        })
      }
    }

    if (joined) {
      const joinYear = Number(joined.slice(0, 4))

      // Work anniversary — completed years, counted from the joining date.
      for (const date of monthDayOccurrences(joined.slice(5), fromKey, toKey)) {
        const years = Number(date.slice(0, 4)) - joinYear
        if (years < 1) continue
        out.push({
          id: `anniversary-${emp.id}-${date}`,
          kind: 'anniversary',
          source: 'employee',
          date,
          person,
          years,
          headline: `Happy ${ordinal(years)} work anniversary, ${firstName(person.name)}!`,
          message: 'Thank you for everything you bring to the team.'
        })
      }

      // New joiner — the joining day itself, held on the page for as long as
      // the company's new-joiner window allows. A future date means someone who
      // has not started yet, which is worth showing as an upcoming occasion.
      const daysSinceJoining = daysBetweenKeys(joined, today)
      // The window reads both ways: this many days after joining someone is
      // still new, and this many days before it they are worth introducing as
      // an upcoming joiner. Without the far side, a contract starting in three
      // months would sit in the Upcoming band the whole time.
      if (Math.abs(daysSinceJoining) <= newJoinerDays) {
        const upcoming = daysSinceJoining < 0
        out.push({
          id: `new-joiner-${emp.id}-${joined}`,
          kind: 'newJoiner',
          source: 'employee',
          date: joined,
          person,
          headline: upcoming
            ? `${person.name} joins us on ${formatDate(joined)}`
            : `Welcome to the team, ${firstName(person.name)}!`,
          message: upcoming
            ? 'Looking forward to having you with us.'
            : 'Glad to have you with us.'
        })
      }
    }
  }

  for (const c of systemCelebrationsInRange({ fromKey, toKey, hiddenIds: hiddenSystemIds })) {
    out.push({
      id: `${c.id}-${c.date}`,
      kind: c.kind,
      source: 'system',
      date: c.date,
      person: null,
      name: c.name,
      headline: c.greeting || c.name,
      message: c.wish || ''
    })
  }

  for (const c of customCelebrationsInRange({ events, fromKey, toKey })) {
    out.push({
      id: `${c.id}-${c.date}`,
      kind: c.kind,
      source: 'custom',
      date: c.date,
      person: null,
      name: c.name,
      headline: c.greeting || c.name,
      message: c.wish || ''
    })
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
}

// Splits a built list into the three bands the page shows.
export function groupCelebrationsByWhen(events, today = todayDateKey()) {
  const groups = { today: [], upcoming: [], recent: [] }
  for (const ev of events || []) {
    if (ev.date === today) groups.today.push(ev)
    else if (ev.date > today) groups.upcoming.push(ev)
    else groups.recent.push(ev)
  }
  groups.recent.reverse() // built oldest-first; the recent band reads newest-first
  return groups
}

// The next occasion after today, searched further out than the page window.
// Takes the same arguments as buildCelebrations plus the kind(s) to look for
// (null for any), and returns one event or null.
//
// An empty week reads very differently with "next birthday: 14 Sep" underneath
// it: the page is between celebrations rather than broken. It reuses the full
// derivation instead of repeating it, so the hint obeys the same rules as the
// cards above it — leap-day birthdays, hidden calendar slots, recurring dates.
export function findNextCelebration(buildArgs = {}, kinds = null, withinDays = CELEBRATION_LOOKAHEAD_DAYS) {
  const today = buildArgs.today || todayDateKey()
  const wanted = kinds == null ? null : Array.isArray(kinds) ? kinds : [kinds]
  // The new-joiner window is stretched to the lookahead here: someone joining in
  // three weeks is well inside the joiner rule's own horizon but outside the
  // page's, and would otherwise never be named. Nothing rendered on the page
  // comes from this call, so the wider window cannot leak into a card.
  const joinerDays = Math.max(buildArgs.newJoinerDays ?? DEFAULT_NEW_JOINER_WINDOW_DAYS, withinDays)
  const ahead = buildCelebrations({
    ...buildArgs,
    today,
    newJoinerDays: joinerDays,
    futureDays: withinDays
  }).filter((ev) => ev.date > today && (!wanted || wanted.includes(ev.kind)))
  // buildCelebrations returns date-ascending, so the first hit is the nearest.
  return ahead[0] || null
}

// 'Today' / 'Tomorrow' / 'In 3 days' / 'Yesterday' / '4 days ago'. Anything
// further out is left to the date itself, which the card already prints.
export function relativeDayLabel(dateKey, today = todayDateKey()) {
  const diff = daysBetweenKeys(today, dateKey)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff <= 6) return `In ${diff} days`
  if (diff < -1 && diff >= -6) return `${Math.abs(diff)} days ago`
  return ''
}

// A short line under a person's name: when they joined, rather than a date the
// card already shows elsewhere.
export function newJoinerStageLabel(dateKey, today = todayDateKey()) {
  const diff = daysBetweenKeys(dateKey, today)
  if (diff < 0) return 'Upcoming joiner'
  if (diff === 0) return 'Joined today'
  if (diff === 1) return 'Joined yesterday'
  if (diff <= 7) return `Joined ${Math.abs(diff)} days ago`
  return `Joined ${formatDate(dateKey)}`
}

// Who may change the celebration calendar. Mirrors the announcements rule:
// IT staff carry the admin role only to run the help desk, so they are left out
// of HR-owned configuration here too.
export function canManageCelebrations(user) {
  return user?.role === 'admin' && user?.department !== 'IT Support'
}
