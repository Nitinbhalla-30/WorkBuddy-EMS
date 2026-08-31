// The app's data store. When Supabase is configured (.env) it is the source
// of truth: everything is loaded from Supabase at startup and every change
// is written back to it. localStorage doubles as an offline cache. Without
// Supabase the app falls back to the old localStorage-only mode.

import { supabase } from './supabaseClient.js'
import { DEFAULT_SETTINGS, DEFAULT_SHIFTS } from './sampleData.js'
import { blankProfile } from '../utils/profile.js'
import { combineDateAndTime, monthKeysBetween, monthKeyOffset } from '../utils/attendance.js'
import { isManagerLeaveExpired } from '../utils/leaves.js'

// Sample employee data used as fallback when Supabase is not configured or empty.
const SAMPLE_EMPLOYEES = [
  {"id":"EMP001","name":"Arjun Mehta","pin":"1111","role":"employee","department":"Sales","isManager":true,"managerId":null,"email":"arjun.mehta@company.com","designation":"Sales Manager","dateJoined":"2024-06-10","salary":{"basic":45000,"hra":20000,"other":8000,"tdsMonthly":3000}},
  {"id":"EMP002","name":"Kavya Reddy","pin":"2222","role":"employee","department":"Design","isManager":false,"managerId":"EMP001","email":"kavya.reddy@company.com","designation":"UI Designer","dateJoined":"2025-03-15","salary":{"basic":22000,"hra":10000,"other":4000,"tdsMonthly":0}},
  {"id":"EMP003","name":"Sameer Joshi","pin":"3333","role":"employee","department":"Support","isManager":false,"managerId":"EMP001","email":"sameer.joshi@company.com","designation":"Support Executive","dateJoined":"2025-01-10","salary":{"basic":12000,"hra":5000,"other":2000,"tdsMonthly":0}},
  {"id":"EMP004","name":"Divya Menon","pin":"4444","role":"employee","department":"Sales","isManager":false,"managerId":"EMP001","email":"divya.menon@company.com","designation":"Sales Executive","dateJoined":"2024-11-01","salary":{"basic":16000,"hra":7000,"other":3000,"tdsMonthly":0}},
  {"id":"EMP005","name":"Rahul Verma","pin":"8888","role":"employee","department":"Marketing","isManager":false,"managerId":"EMP001","email":"rahul.verma@company.com","designation":"Marketing Associate","dateJoined":"2025-05-02","salary":{"basic":14000,"hra":6000,"other":2500,"tdsMonthly":0}},
  {"id":"EMP006","name":"Neha Kulkarni","pin":"9999","role":"employee","department":"Operations","isManager":true,"managerId":null,"email":"neha.kulkarni@company.com","designation":"Operations Manager","dateJoined":"2024-04-18","salary":{"basic":40000,"hra":18000,"other":7000,"tdsMonthly":2500}},
  {"id":"EMP007","name":"Aditya Rao","pin":"1010","role":"employee","department":"Operations","isManager":false,"managerId":"EMP006","email":"aditya.rao@company.com","designation":"Operations Executive","dateJoined":"2025-02-20","salary":{"basic":13000,"hra":5500,"other":2000,"tdsMonthly":0}},
  {"id":"EMP008","name":"Ishita Bose","pin":"2020","role":"employee","department":"Marketing","isManager":false,"managerId":"EMP001","email":"ishita.bose@company.com","designation":"Content Writer","dateJoined":"2025-06-09","salary":{"basic":15000,"hra":6500,"other":2500,"tdsMonthly":0}},
  {"id":"EMP009","name":"Karan Malhotra","pin":"3030","role":"employee","department":"Quality","isManager":false,"managerId":"EMP006","email":"karan.malhotra@company.com","designation":"QA Analyst","dateJoined":"2025-04-07","salary":{"basic":17000,"hra":7500,"other":3000,"tdsMonthly":0}},
  {"id":"EMP010","name":"Pooja Hegde","pin":"4040","role":"employee","department":"Human Resources","isManager":false,"managerId":"EMP006","email":"pooja.hegde@company.com","designation":"HR Executive","dateJoined":"2025-07-01","salary":{"basic":18000,"hra":8000,"other":3500,"tdsMonthly":0}},
  {"id":"ADM001","name":"Meera Kapoor","pin":"0000","role":"admin","department":"Human Resources","isManager":false,"managerId":null,"salary":{"basic":0,"hra":0,"other":0,"tdsMonthly":0}},
  {"id":"IT001","name":"Rajesh Kumar","pin":"5555","role":"it","department":"IT Support","isManager":false,"managerId":null,"salary":{"basic":20000,"hra":8000,"other":5000,"tdsMonthly":1000}},
  {"id":"IT002","name":"Anita Desai","pin":"6666","role":"it","department":"IT Support","isManager":false,"managerId":null,"salary":{"basic":18000,"hra":7000,"other":4000,"tdsMonthly":800}},
  {"id":"IT003","name":"Vikram Singh","pin":"7777","role":"it","department":"IT Support","isManager":true,"managerId":null,"salary":{"basic":25000,"hra":10000,"other":6000,"tdsMonthly":1500}}
]

const SAMPLE_DRIVERS = [
  {"id":"DRV01","name":"Suresh Yadav","pin":"1234","phone":"9876543210","vehicleId":"VH001","licenseNumber":"DL-0420110012345"},
  {"id":"DRV02","name":"Ramesh Kumar","pin":"1234","phone":"9876543211","vehicleId":"VH002","licenseNumber":"DL-0420110012346"}
]

const KEYS = {
  employees: 'hr_employees',
  attendance: 'hr_attendance',
  leaves: 'hr_leaves',
  settings: 'hr_settings',
  tasks: 'hr_tasks',
  profiles: 'hr_profiles',
  tickets: 'hr_tickets',
  vehicles: 'hr_vehicles',
  drivers: 'hr_drivers',
  trips: 'hr_trips',
  cabAssignments: 'hr_cab_assignments',
  cabRequests: 'hr_cab_requests',
  cabMessages: 'hr_cab_messages',
  cabCancellations: 'hr_cab_cancellations',
  cabClearedChats: 'hr_cab_cleared_chats',
  cabClearedChatsAdmin: 'hr_cab_cleared_chats_admin',
  itIssues: 'hr_it_issues',
  itStaff: 'hr_it_staff',
  announcements: 'hr_announcements',
  readAnnouncements: 'hr_read_announcements',
  reimbursements: 'hr_reimbursements',
  attendanceCorrections: 'hr_attendance_corrections',
  notificationReads: 'hr_notification_reads',
  notificationDismissed: 'hr_notification_dismissed',
  teamConversations: 'hr_team_conversations',
  teamClearedChats: 'hr_team_cleared_chats',
  shifts: 'hr_shifts',
  shiftChangeRequests: 'hr_shift_change_requests',
  shiftHistory: 'hr_shift_history',
  overtimeRequests: 'hr_overtime_requests'
}

// Exposed so a screen can tell refreshStoreFromSupabase exactly which
// collections it reads, instead of forcing a full-store re-download.
export const STORE_KEYS = KEYS

// In-memory cache of every collection; reads hit this first.
const mem = {}
let remoteReady = false
let initPromise = null
const pendingPush = {}
// Keys with an in-flight Supabase write. refreshStoreFromSupabase skips
// these so a concurrent refresh never overwrites local data with stale
// remote data before the push completes.
const pendingWrites = new Set()
const PENDING_WRITES_KEY = 'hr_pending_writes'

// Persist pending writes to localStorage so they survive logout/login cycles.
// This ensures that when an employee applies for leave and logs out before the
// push completes, the manager will see the request after logging in.
function savePendingWrites() {
  try {
    localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify([...pendingWrites]))
  } catch {
    // Ignore storage errors; pending writes are an optimization.
  }
}
function loadPendingWrites() {
  try {
    const raw = localStorage.getItem(PENDING_WRITES_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      arr.forEach((key) => pendingWrites.add(key))
    }
  } catch {
    // Ignore parse errors.
  }
}
function clearPendingWrites() {
  pendingWrites.clear()
  try {
    localStorage.removeItem(PENDING_WRITES_KEY)
  } catch {
    // Ignore.
  }
}

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeLocal(key, value) {
  mem[key] = value
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded (the load-test dataset is larger than the browser's
    // ~5 MB limit): keep working from the in-memory copy instead of failing.
  }
}

function read(key, fallback) {
  if (key in mem) return mem[key]
  return readLocal(key, fallback)
}

// True once this browser has successfully exchanged data with Supabase at
// least once. It lets a later session push local changes back even when the
// very first load hit a transient Supabase hiccup (which would otherwise
// strand writes in localStorage forever and hide them from other users).
const SUPABASE_SEEN_KEY = 'hr_supabase_seen'
function markSupabaseSeen() {
  try {
    localStorage.setItem(SUPABASE_SEEN_KEY, '1')
  } catch {
    // Ignore storage errors; the flag is an optimisation only.
  }
}
function supabaseSeen() {
  try {
    return localStorage.getItem(SUPABASE_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

// Push one collection to Supabase, retrying a few times with backoff so a
// temporary outage never silently drops the change.
async function pushKeyToSupabase(key, attempt) {
  pendingWrites.add(key)
  savePendingWrites()
  const tableName = OPTIMIZED_TABLES[key]
  
  if (tableName) {
    // Write to optimized table using upsert (not delete-all + insert) to
    // prevent data loss when memory holds only a partial snapshot.
    const records = mem[key]
    // Nothing to push. Release the pending flag, otherwise this key would be
    // stuck in `pendingWrites` and every later refresh would skip it.
    if (!Array.isArray(records) || records.length === 0) {
      pendingWrites.delete(key)
      savePendingWrites()
      return
    }
    try {
      const dbRecords = transformRowsToDb(records)
      // Upsert in batches to avoid hitting the server's max-rows limit
      for (let i = 0; i < dbRecords.length; i += 1000) {
        const batch = dbRecords.slice(i, i + 1000)
        const { error } = await supabase.from(tableName).upsert(batch, { onConflict: 'id' })
        if (error) {
          scheduleRetryPush(key, attempt, error.message)
          return
        }
      }
      pendingWrites.delete(key)
      savePendingWrites()
      remoteReady = true
      markSupabaseSeen()
    } catch (err) {
      scheduleRetryPush(key, attempt, err.message)
    }
  } else {
    // Write to app_store for non-optimized collections
    supabase
      .from('app_store')
      .upsert(
        { key, value: mem[key], updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .then(({ error }) => {
        if (error) {
          scheduleRetryPush(key, attempt, error.message)
        } else {
          pendingWrites.delete(key)
          savePendingWrites()
          remoteReady = true
          markSupabaseSeen()
        }
      })
      .catch(() => scheduleRetryPush(key, attempt, 'network error'))
  }
}

function scheduleRetryPush(key, attempt, message) {
  if (attempt < 5) {
    setTimeout(() => pushKeyToSupabase(key, attempt + 1), 1000 * 2 ** attempt)
  } else {
    console.warn(`Supabase write failed for ${key}:`, message)
    // Don't clear pendingWrites - keep trying on next page load
    // The data is still in localStorage and will be pushed on next init
  }
}

// Save a collection locally and sync it to Supabase (debounced per key so a
// burst of changes becomes one upsert).
function write(key, value) {
  writeLocal(key, value)
  if (!supabase) return
  // Only push once this browser is known to hold real Supabase data, so a
  // brand-new offline browser can't seed-and-clobber the shared store. A
  // transient init failure on an established browser must not block pushes.
  if (!remoteReady && !supabaseSeen()) return
  pendingWrites.add(key)
  savePendingWrites()
  clearTimeout(pendingPush[key])
  pendingPush[key] = setTimeout(() => pushKeyToSupabase(key, 0), 250)
}

// Save a collection locally and immediately push to Supabase (no debounce).
// Used for time-sensitive state like notification dismissals that must persist
// across logout/login cycles.
function writeImmediate(key, value) {
  writeLocal(key, value)
  if (!supabase) return
  if (!remoteReady && !supabaseSeen()) return
  pendingWrites.add(key)
  savePendingWrites()
  clearTimeout(pendingPush[key])
  pushKeyToSupabase(key, 0)
}

// Mapping of app_store keys to their optimized table names
const OPTIMIZED_TABLES = {
  [KEYS.attendance]: 'attendance_records',
  [KEYS.tasks]: 'tasks',
  [KEYS.leaves]: 'leaves',
  [KEYS.overtimeRequests]: 'overtime_requests',
  [KEYS.shiftChangeRequests]: 'shift_change_requests',
  [KEYS.reimbursements]: 'reimbursements',
  [KEYS.tickets]: 'tickets',
  [KEYS.itIssues]: 'it_issues',
  [KEYS.attendanceCorrections]: 'attendance_corrections'
}

// Convert snake_case to camelCase
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// Known field-name mismatches between app (camelCase) and database (snake_case).
// camelToSnake produces the wrong name for these, so we map them explicitly.
const APP_TO_DB_FIELD = {
  rejectReason: 'rejection_reason'
}
const DB_TO_APP_FIELD = {
  rejection_reason: 'rejectReason'
}

// Transform database row (snake_case) to app format (camelCase)
function transformRow(row) {
  if (!row || typeof row !== 'object') return row
  const transformed = {}
  for (const [key, value] of Object.entries(row)) {
    const appKey = DB_TO_APP_FIELD[key] || snakeToCamel(key)
    transformed[appKey] = value
  }
  return transformed
}

// Transform array of database rows
function transformRows(rows) {
  if (!Array.isArray(rows)) return rows
  return rows.map(transformRow)
}

// Transform app row (camelCase) to database format (snake_case)
function transformRowToDb(row) {
  if (!row || typeof row !== 'object') return row
  const transformed = {}
  for (const [key, value] of Object.entries(row)) {
    // Skip created_at and other DB-only fields
    if (key === 'createdAt' || key === 'created_at') continue
    const dbKey = APP_TO_DB_FIELD[key] || camelToSnake(key)
    transformed[dbKey] = value
  }
  return transformed
}

// Transform array of app rows to database format
function transformRowsToDb(rows) {
  if (!Array.isArray(rows)) return rows
  return rows.map(transformRowToDb)
}

// Supabase PostgREST has a server-side max-rows setting (default 1000) that
// caps the number of rows returned per request, regardless of the client-side
// .limit() value. When the table exceeds that limit, responses come back as
// 206 Partial Content with only the first N rows. This helper fetches ALL
// rows by paginating with Range headers in chunks.
//
// `filter` optionally narrows the query (used to keep attendance reads inside
// a date window). The first page asks PostgREST for an exact total count, so
// every remaining page can be fetched concurrently instead of one after
// another — a 40k-row table used to cost 44 serial round trips.
const PAGE_SIZE = 999 // PostgREST range is inclusive: 0-998 = 999 rows
const PAGE_CONCURRENCY = 8

// Run `worker` over `items` with at most `limit` in flight, keeping order.
async function mapLimited(items, limit, worker) {
  const out = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await worker(items[i])
    }
  })
  await Promise.all(runners)
  return out
}

async function fetchAllFromTable(tableName, filter) {
  const page = (from) => {
    let q = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(from, from + PAGE_SIZE - 1)
    return filter ? filter(q) : q
  }

  const first = await page(0)
  if (first.error) throw first.error
  const head = first.data || []
  if (head.length < PAGE_SIZE) return head

  const total = first.count ?? head.length
  const starts = []
  for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) starts.push(from)

  const rest = await mapLimited(starts, PAGE_CONCURRENCY, async (from) => {
    const res = await page(from)
    if (res.error) throw res.error
    return res.data || []
  })
  return head.concat(...rest)
}

// ---- attendance date window ----
// Attendance is the one collection that grows without limit (one row per
// employee per working day), so the browser no longer downloads all of it at
// startup. It keeps a rolling window of the current and previous month, and
// anything older is fetched a month at a time on demand by whoever needs it.
// Every query is bounded by `date`, which idx_attendance_date already covers.
export const ATTENDANCE_WINDOW_MONTHS = 2

// Inclusive first/last calendar date of a 'YYYY-MM' month.
function monthBounds(key) {
  const [y, m] = key.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return { from: `${key}-01`, to: `${key}-${String(last).padStart(2, '0')}` }
}

// Months the rolling window covers, newest first.
export function attendanceWindowMonths() {
  return Array.from({ length: ATTENDANCE_WINDOW_MONTHS }, (_, i) => monthKeyOffset(i))
}

// Which months are known to be present in the in-memory collection, so a
// screen asking for a month it can already see never touches the network.
const attendanceLoadedMonths = new Set()

export function attendanceMonthsLoaded() {
  return [...attendanceLoadedMonths]
}

// Merge server rows into the cached collection without triggering a write-back
// (these rows already live in Supabase; pushing them again would be pointless).
function mergeAttendanceRows(incoming) {
  if (!incoming || incoming.length === 0) return
  const all = read(KEYS.attendance, [])
  const indexById = new Map(all.map((r, i) => [r.id, i]))
  const indexByEmployeeDate = new Map(all.map((r, i) => [`${r.employeeId}|${r.date}`, i]))
  for (const rec of incoming) {
    const at = indexById.get(rec.id) ?? indexByEmployeeDate.get(`${rec.employeeId}|${rec.date}`)
    if (at !== undefined) {
      all[at] = rec
      indexById.set(rec.id, at)
    } else {
      all.push(rec)
      indexById.set(rec.id, all.length - 1)
      indexByEmployeeDate.set(`${rec.employeeId}|${rec.date}`, all.length - 1)
    }
  }
  all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  writeLocal(KEYS.attendance, all)
}

// Make sure the given 'YYYY-MM' months are in the cache, fetching any that are
// missing straight from Supabase (bounded by date, months fetched in parallel).
// Resolves true when every requested month is available, false on failure.
export async function ensureAttendanceMonths(months) {
  const wanted = [...new Set((months || []).filter(Boolean))]
  const missing = wanted.filter((m) => !attendanceLoadedMonths.has(m))
  if (missing.length === 0) return true
  if (!supabase) {
    // Local-only mode: the collection is whatever localStorage holds already.
    missing.forEach((m) => attendanceLoadedMonths.add(m))
    return true
  }
  try {
    const results = await mapLimited(missing, PAGE_CONCURRENCY, async (m) => {
      const { from, to } = monthBounds(m)
      const rows = await fetchAllFromTable('attendance_records', (q) =>
        q.gte('date', from).lte('date', to)
      )
      return { month: m, rows: transformRows(rows) }
    })
    mergeAttendanceRows(results.flatMap((r) => r.rows))
    results.forEach((r) => attendanceLoadedMonths.add(r.month))
    return true
  } catch {
    return false
  }
}

// Convenience wrappers used by screens that think in dates rather than months.
export function ensureAttendanceForDate(date) {
  return ensureAttendanceMonths([date ? date.slice(0, 7) : null])
}

export function ensureAttendanceRange(fromDate, toDate) {
  return ensureAttendanceMonths(monthKeysBetween(fromDate, toDate))
}

// Read the rolling window (current + previous month) straight from Supabase:
// one date-bounded query per month, run in parallel. Marks those months loaded
// only once the data is actually in hand, so a failed attempt is retried.
async function fetchAttendanceWindow() {
  const months = attendanceWindowMonths()
  const pages = await mapLimited(months, PAGE_CONCURRENCY, async (m) => {
    const { from, to } = monthBounds(m)
    const rows = await fetchAllFromTable('attendance_records', (q) =>
      q.gte('date', from).lte('date', to)
    )
    return rows
  })
  months.forEach((m) => attendanceLoadedMonths.add(m))
  return transformRows(pages.flat())
}

// Install window rows into the cache, keeping any older months a screen has
// already asked for so repeated refreshes never shrink the visible history.
function applyAttendanceWindow(rows) {
  const oldest = monthBounds(attendanceWindowMonths()[ATTENDANCE_WINDOW_MONTHS - 1]).from
  const kept = read(KEYS.attendance, []).filter((r) => r.date < oldest)
  const merged = kept.concat(rows)
  merged.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  writeLocal(KEYS.attendance, merged)
}

// Insert records in batches to avoid hitting the server's max-rows limit on
// a single INSERT statement.
async function batchedInsert(tableName, records) {
  const BATCH = 1000
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { error } = await supabase.from(tableName).insert(batch)
    if (error) throw error
  }
}

// Re-pull every collection from Supabase into memory and localStorage. Used
// before showing data that must reflect the latest shared state (e.g. a
// manager's approval queue) even if the initial load fell back to local.
// Pass `onlyKeys` to refresh just the collections a screen actually reads,
// instead of the whole store.
export async function refreshStoreFromSupabase(onlyKeys) {
  if (!supabase) return false
  const wants = onlyKeys && onlyKeys.length ? new Set(onlyKeys) : null
  try {
    // Keys that remain in app_store (not migrated to optimized tables)
    const appStoreKeys = APP_STORE_KEYS
    
    // Fetch small reference data from app_store using specific keys
    // Skip keys that have pending local writes to avoid overwriting
    // unpushed data with stale remote data.
    const fetchKeys = appStoreKeys.filter(
      (k) => !pendingWrites.has(k) && (!wants || wants.has(k))
    )
    let appStoreData = []
    if (fetchKeys.length > 0) {
      const res = await supabase
        .from('app_store')
        .select('key,value')
        .in('key', fetchKeys)
      if (res.error) return false
      appStoreData = res.data || []
    }
    
    // Load small collections from app_store
    if (appStoreData && appStoreData.some((row) => row.key === KEYS.employees)) {
      applyAppStoreRows(appStoreData)
    }
    
    // Fetch large collections from optimized tables
    // Skip keys with pending local writes to avoid overwriting unpushed data.
    const fetchPromises = Object.entries(OPTIMIZED_TABLES)
      .filter(([key]) => !pendingWrites.has(key) && (!wants || wants.has(key)))
      .map(async ([key, tableName]) => {
      try {
        // Attendance is windowed — refreshing it must not pull all history.
        if (key === KEYS.attendance) {
          applyAttendanceWindow(await fetchAttendanceWindow())
          return
        }
        const data = await fetchAllFromTable(tableName)
        if (data) {
          // Transform snake_case to camelCase
          const transformedData = transformRows(data)
          mem[key] = transformedData
          try {
            localStorage.setItem(key, JSON.stringify(transformedData))
          } catch {
            // Keep the in-memory copy if storage is full.
          }
        }
      } catch {
        // Table might not exist yet, fall back to app_store. Attendance is
        // never stored whole in app_store, so a failed window read just keeps
        // whatever is already cached rather than re-downloading everything.
        if (key === KEYS.attendance) return
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('app_store')
          .select('value')
          .eq('key', key)
          .single()
        if (!fallbackError && fallbackData) {
          mem[key] = fallbackData.value
        }
      }
    })
    
    await Promise.all(fetchPromises)
    
    migrateReimbursementTimestamps()
    
    if (mem[KEYS.employees]) {
      remoteReady = true
      markSupabaseSeen()
      return true
    }
    return false
  } catch {
    return false
  }
}

// Defaults used to seed a brand-new store (sample data for development; data comes from Supabase in production).
const DEFAULTS = {
  [KEYS.employees]: SAMPLE_EMPLOYEES,
  [KEYS.attendance]: [],
  [KEYS.leaves]: [],
  [KEYS.settings]: DEFAULT_SETTINGS,
  [KEYS.tasks]: [],
  [KEYS.profiles]: [],
  [KEYS.tickets]: [],
  [KEYS.vehicles]: [],
  [KEYS.drivers]: SAMPLE_DRIVERS,
  [KEYS.trips]: [],
  [KEYS.cabAssignments]: [],
  [KEYS.cabRequests]: [],
  [KEYS.cabMessages]: [],
  [KEYS.cabCancellations]: [],
  [KEYS.cabClearedChats]: {},
  [KEYS.cabClearedChatsAdmin]: {},
  [KEYS.itIssues]: [],
  [KEYS.itStaff]: [],
  [KEYS.announcements]: [],
  [KEYS.readAnnouncements]: {},
  [KEYS.reimbursements]: [],
  [KEYS.attendanceCorrections]: [],
  [KEYS.notificationReads]: {},
  [KEYS.notificationDismissed]: {},
  [KEYS.teamConversations]: [],
  [KEYS.teamClearedChats]: {},
  [KEYS.shifts]: DEFAULT_SHIFTS,
  [KEYS.shiftChangeRequests]: [],
  [KEYS.shiftHistory]: [],
  [KEYS.overtimeRequests]: []
}

// Keys that remain in app_store (not migrated to optimized tables)
const APP_STORE_KEYS = [
  KEYS.employees,
  KEYS.settings,
  KEYS.profiles,
  KEYS.vehicles,
  KEYS.drivers,
  KEYS.trips,
  KEYS.cabAssignments,
  KEYS.cabRequests,
  KEYS.cabMessages,
  KEYS.cabCancellations,
  KEYS.cabClearedChats,
  KEYS.cabClearedChatsAdmin,
  KEYS.itStaff,
  KEYS.announcements,
  KEYS.readAnnouncements,
  KEYS.notificationReads,
  KEYS.notificationDismissed,
  KEYS.teamConversations,
  KEYS.teamClearedChats,
  KEYS.shifts,
  KEYS.shiftHistory
]

// The minimum the login screen needs: the directory used to check an ID + PIN,
// plus the settings it renders from. Everything else can arrive afterwards.
const CRITICAL_KEYS = [KEYS.employees, KEYS.drivers, KEYS.settings]

// Read a chosen set of app_store rows, retrying a few times so a brief Supabase
// hiccup (a 500 while the project warms up, a flaky network) does not force the
// whole session into local-only mode and silently strand later writes.
async function selectAppStoreWithRetry(keys, attempt = 0) {
  const res = await supabase.from('app_store').select('key,value').in('key', keys)
  if (res.error && attempt < 3) {
    await new Promise((r) => setTimeout(r, 800 * 2 ** attempt))
    return selectAppStoreWithRetry(keys, attempt + 1)
  }
  return res
}

// Copy app_store rows into the memory + localStorage cache.
function applyAppStoreRows(rows) {
  for (const row of rows || []) {
    mem[row.key] = row.value
    try {
      localStorage.setItem(row.key, JSON.stringify(row.value))
    } catch {
      // Storage quota exceeded: keep the value in memory only.
    }
  }
}

// Phase 1 of startup: one small query that unblocks the login screen.
async function loadCriticalData() {
  const keys = CRITICAL_KEYS.filter((k) => !pendingWrites.has(k))
  if (keys.length === 0) return
  const { data, error } = await selectAppStoreWithRetry(keys)
  if (error) throw error
  // Without the employee directory this is not a usable remote snapshot, so
  // leave whatever localStorage already holds rather than clobbering it.
  if (!data || !data.some((row) => row.key === KEYS.employees)) return
  applyAppStoreRows(data)
}

// Phase 2 of startup: every remaining collection. Runs while the login page is
// already on screen, so none of it delays the first paint.
async function loadRemainingData() {
  try {
    // Push any writes left over from the previous session (e.g. an employee
    // applied for leave and logged out before the push completed) before
    // loading fresh data, so the manager sees the latest requests.
    if (pendingWrites.size > 0 && supabaseSeen()) {
      const keysToFlush = [...pendingWrites]
      // Wait for all pushes to complete before loading data
      await Promise.all(keysToFlush.map((key) =>
        new Promise((resolve) => {
          // Poll until the key is removed from pendingWrites (push succeeded)
          // or until timeout (push failed or taking too long)
          const startTime = Date.now()
          const checkInterval = setInterval(() => {
            if (!pendingWrites.has(key)) {
              clearInterval(checkInterval)
              resolve()
            } else if (Date.now() - startTime > 10000) {
              // Timeout after 10 seconds - continue anyway
              clearInterval(checkInterval)
              resolve()
            }
          }, 100)
          // Trigger the push
          pushKeyToSupabase(key, 0)
        })
      ))
    }

    // Remaining small collections from app_store. Critical keys are already
    // fresh from phase 1, and keys with unpushed local edits must stay local.
    const restKeys = APP_STORE_KEYS.filter(
      (k) => !CRITICAL_KEYS.includes(k) && !pendingWrites.has(k)
    )
    if (restKeys.length > 0) {
      const { data: appStoreData, error: appStoreError } = await selectAppStoreWithRetry(restKeys)
      if (appStoreError) throw appStoreError
      applyAppStoreRows(appStoreData)
    }

    // Large collections from the optimized tables, fetched concurrently.
    // Attendance is read for the rolling window only — its full history is no
    // longer ever shipped to the browser.
    const fetchPromises = Object.entries(OPTIMIZED_TABLES)
      .filter(([key]) => !pendingWrites.has(key))
      .map(async ([key, tableName]) => {
        try {
          if (key === KEYS.attendance) {
            applyAttendanceWindow(await fetchAttendanceWindow())
            return
          }
          const data = await fetchAllFromTable(tableName)
          if (data) {
            // Transform snake_case to camelCase
            const transformedData = transformRows(data)
            mem[key] = transformedData
            try {
              localStorage.setItem(key, JSON.stringify(transformedData))
            } catch {
              // Keep in memory only if storage is full
            }
          }
        } catch {
          // Table might not exist yet, try to load from app_store as fallback.
          // Attendance is never held whole in app_store, so a failed window
          // read simply keeps what is already cached.
          if (key === KEYS.attendance) return
          const { data: fallbackData } = await supabase
            .from('app_store')
            .select('value')
            .eq('key', key)
            .single()
          if (fallbackData) {
            mem[key] = fallbackData.value
          }
        }
      })

    await Promise.all(fetchPromises)

    remoteReady = true
    markSupabaseSeen()
    migrateReimbursementTimestamps()

    // Covers a fresh install (no employees found anywhere) and keys introduced
    // by newer versions of the app.
    seedIfEmpty()
  } catch (err) {
    console.warn('Supabase is not reachable; continuing with local storage.', err)
    remoteReady = false
    seedIfEmpty()
    // Try to reconnect shortly in case the outage was transient, so this
    // session does not stay stuck on stale local data.
    setTimeout(() => refreshStoreFromSupabase(), 5000)
  }
}

let resolveDataReady = null
const dataReadyPromise = new Promise((resolve) => { resolveDataReady = resolve })

// Resolves once the background load has settled, one way or the other. Screens
// that genuinely need the whole dataset can await this without holding up the
// login page.
export function whenDataReady() {
  return dataReadyPromise
}

// Bootstrap the store before the app renders. Resolves as soon as the small
// login-sized snapshot is in memory; the rest of the data keeps loading in the
// background. (Awaiting every collection first put the login page at ~13s.)
// Always resolves; on any failure the app keeps working from localStorage.
export function initStore() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    if (!supabase) {
      seedIfEmpty()
      migrateReimbursementTimestamps()
      attendanceWindowMonths().forEach((m) => attendanceLoadedMonths.add(m))
      resolveDataReady()
      return
    }
    // Restore the list of unpushed writes first: both phases skip those keys so
    // a local edit is never overwritten by stale remote data.
    loadPendingWrites()
    try {
      await loadCriticalData()
    } catch (err) {
      console.warn('Supabase is not reachable; continuing with local storage.', err)
      remoteReady = false
      seedIfEmpty()
    }
    // The login screen can render now — deliberately not awaited.
    loadRemainingData().finally(() => resolveDataReady())
  })()
  return initPromise
}

// Seed a brand-new store with empty collections (data comes from Supabase).
export function seedIfEmpty() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!(key in mem) && localStorage.getItem(key) === null) {
      writeLocal(key, value)
    }
  }
}

// Wipe everything and load fresh empty collections (data comes from Supabase).
export function resetToSampleData() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    write(key, value)
  }
}

// ---- employees ----
export function getEmployees() {
  return read(KEYS.employees, [])
}

export function getEmployeeById(id) {
  return getEmployees().find((e) => e.id === id) || null
}

// Update one employee's salary structure. `salary` = { basic, hra, other, tdsMonthly }.
export function updateEmployeeSalary(employeeId, salary) {
  const all = getEmployees()
  const idx = all.findIndex((e) => e.id === employeeId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], salary: { ...all[idx].salary, ...salary } }
  write(KEYS.employees, all)
  return all[idx]
}

// Update one employee's team info. `team` = { isManager, managerId }.
export function updateEmployeeTeam(employeeId, team) {
  const all = getEmployees()
  const idx = all.findIndex((e) => e.id === employeeId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...team }
  write(KEYS.employees, all)
  return all[idx]
}

// The people who report to a given manager (only real employees).
export function getTeamMembers(managerId) {
  return getEmployees().filter(
    (e) => e.role === 'employee' && e.managerId === managerId
  )
}

// Full team roster for the My Team screen: manager/lead plus everyone on the same team.
export function getMyTeammates(employeeId) {
  const emp = getEmployees().find((e) => e.id === employeeId)
  if (!emp || emp.role !== 'employee') return []

  if (emp.isManager) {
    const members = getTeamMembers(employeeId)
    return [emp, ...members]
  }

  if (!emp.managerId) return []

  const manager = getEmployeeById(emp.managerId)
  const peers = getEmployees().filter(
    (e) => e.role === 'employee' && e.managerId === emp.managerId
  )
  return manager ? [manager, ...peers] : peers
}

// Teammate rows with contact details for the My Team directory.
export function getMyTeamDirectory(employeeId) {
  return getMyTeammates(employeeId).map((e) => {
    const profile = getProfileForEmployee(e.id)
    const manager = e.managerId ? getEmployeeById(e.managerId) : null
    return {
      id: e.id,
      name: e.name,
      photoUrl: profile?.personal?.photo?.dataUrl || '',
      mobile: profile?.personal?.contactNumber || '',
      email: e.email || '',
      designation: e.designation || e.department || '',
      reportsTo: manager?.name || ''
    }
  })
}

// ---- settings ----
export function getSettings() {
  // Merge with defaults so new settings (added in later phases) always exist,
  // even for people who saved settings before those fields were added.
  const saved = read(KEYS.settings, {})
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    leaveAllowance: {
      ...DEFAULT_SETTINGS.leaveAllowance,
      ...(saved.leaveAllowance || {})
    },
    salary: {
      ...DEFAULT_SETTINGS.salary,
      ...(saved.salary || {})
    },
    lunchPolicy: {
      ...DEFAULT_SETTINGS.lunchPolicy,
      ...(saved.lunchPolicy || {})
    },
    companyHolidays: saved.companyHolidays ?? DEFAULT_SETTINGS.companyHolidays
  }
}

export function saveSettings(next) {
  write(KEYS.settings, next)
  return next
}

// ---- attendance ----
export function getAttendance() {
  return read(KEYS.attendance, [])
}

export function getAttendanceForEmployee(employeeId) {
  return getAttendance()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function todayKey() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Find today's record for an employee, or make a blank one.
export function getTodayRecord(employeeId) {
  const all = getAttendance()
  const today = todayKey()
  let rec = all.find((r) => r.employeeId === employeeId && r.date === today)
  if (!rec) {
    rec = {
      id: `ATT${Date.now()}`,
      employeeId,
      date: today,
      timeIn: null,
      timeOut: null,
      breaks: []
    }
  }
  return rec
}

// Save (insert or update) a record.
export function upsertRecord(record) {
  const all = getAttendance()
  const idx = all.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    all[idx] = record
  } else {
    all.push(record)
  }
  write(KEYS.attendance, all)
  return record
}

// ---- attendance correction requests ----
export function getAttendanceCorrections() {
  return read(KEYS.attendanceCorrections, [])
}

export function getAttendanceCorrectionsForEmployee(employeeId) {
  return getAttendanceCorrections()
    .filter((c) => c.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
}

export function submitAttendanceCorrection({
  employeeId,
  date,
  issueType,
  description,
  suggestedTimeIn = '',
  suggestedTimeOut = ''
}) {
  const all = getAttendanceCorrections()
  const request = {
    id: `ACR${Date.now()}`,
    employeeId,
    date,
    issueType,
    description: description || '',
    suggestedTimeIn: suggestedTimeIn || '',
    suggestedTimeOut: suggestedTimeOut || '',
    status: 'pending',
    appliedOn: todayKey(),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: []
  }
  all.push(request)
  write(KEYS.attendanceCorrections, all)
  return request
}

export function getAttendanceCorrectionById(id) {
  return getAttendanceCorrections().find((c) => c.id === id) || null
}

// Employee edits a pending correction request.
export function updateAttendanceCorrection(id, employeeId, {
  date,
  issueType,
  description,
  suggestedTimeIn = '',
  suggestedTimeOut = ''
}) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const correction = all[idx]
  if (correction.employeeId !== employeeId) return null
  if (correction.status !== 'pending') return null
  all[idx] = {
    ...correction,
    date,
    issueType,
    description: description || '',
    suggestedTimeIn: suggestedTimeIn || '',
    suggestedTimeOut: suggestedTimeOut || '',
    reviewNote: '',
    decidedBy: null,
    decidedOn: null
  }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// Employee withdraws a pending correction request.
export function withdrawAttendanceCorrection(id, employeeId) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const correction = all[idx]
  if (correction.employeeId !== employeeId) return null
  if (correction.status !== 'pending') return null
  all[idx] = { ...correction, status: 'withdrawn', withdrawnOn: todayKey() }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// Q&A on a pending correction (employee or HR/Admin).
export function addAttendanceCorrectionMessage(id, { byId, byRole, text }) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null

  const correction = all[idx]
  if (correction.status !== 'pending') return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  if (byRole === 'employee' && byId !== correction.employeeId) return null
  if (byRole !== 'employee' && byRole !== 'admin') return null

  all[idx] = {
    ...correction,
    messages: [
      ...(correction.messages || []),
      {
        id: `ACM${Date.now()}`,
        byId,
        byRole,
        text: trimmed,
        on: todayKey()
      }
    ]
  }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

function findOrCreateAttendanceRecord(employeeId, date) {
  const all = getAttendance()
  let rec = all.find((r) => r.employeeId === employeeId && r.date === date)
  if (rec) return rec
  rec = {
    id: `ATT${Date.now()}`,
    employeeId,
    date,
    timeIn: null,
    timeOut: null,
    breaks: []
  }
  all.push(rec)
  write(KEYS.attendance, all)
  return rec
}

function applyCorrectionToAttendance(correction) {
  const rec = findOrCreateAttendanceRecord(correction.employeeId, correction.date)
  let breaks = rec.breaks || []
  if (typeof breaks === 'string') { try { breaks = JSON.parse(breaks) } catch { breaks = [] } }
  const next = { ...rec, breaks }

  if (correction.suggestedTimeIn) {
    next.timeIn = combineDateAndTime(correction.date, correction.suggestedTimeIn) || next.timeIn
  }
  if (correction.suggestedTimeOut) {
    next.timeOut = combineDateAndTime(correction.date, correction.suggestedTimeOut) || next.timeOut
  }

  upsertRecord(next)
}

export async function resolveAttendanceCorrection(id, status, decidedBy, reviewNote = '') {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null

  const correction = all[idx]
  all[idx] = {
    ...correction,
    status,
    decidedBy: decidedBy || null,
    decidedOn: todayKey(),
    reviewNote: reviewNote || ''
  }

  if (status === 'approved') {
    // The day being corrected can sit well outside the rolling window. Load
    // that date from Supabase first, otherwise the existing row is not in
    // memory and approving would create a duplicate record for the same day.
    await ensureAttendanceForDate(correction.date)
    applyCorrectionToAttendance(correction)
  }

  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// ---- leaves ----
export function getLeaves() {
  const all = read(KEYS.leaves, [])
  // Auto-escalate manager-stage requests whose response window has passed.
  const settings = getSettings()
  const today = todayKey()
  let changed = false
  for (const lv of all) {
    if (lv.status === 'pending' && lv.stage === 'manager' && isManagerLeaveExpired(lv, settings)) {
      lv.stage = 'hr'
      lv.managerStatus = 'escalated'
      lv.escalatedOn = new Date().toISOString()
      changed = true
    }
  }
  if (changed) write(KEYS.leaves, all)
  return all
}

export function getLeavesForEmployee(employeeId) {
  return getLeaves()
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1))
}

// An employee applies for leave. Returns the saved request.
export function applyLeave({
  employeeId,
  type,
  fromDate,
  toDate,
  reason,
  supportingDocuments = [],
  halfDayPart = null
}) {
  const all = getLeaves()
  const employee = getEmployeeById(employeeId)
  const stage = employee?.managerId ? 'manager' : 'hr'
  const request = {
    id: `LV${Date.now()}`,
    employeeId,
    type,
    fromDate,
    toDate,
    halfDayPart: halfDayPart || null,
    reason: reason || '',
    supportingDocuments: Array.isArray(supportingDocuments) ? supportingDocuments : [],
    messages: [],
    rejectionReason: '',
    status: 'pending',
    stage,
    managerStatus: stage === 'manager' ? 'pending' : null,
    managerDecidedBy: null,
    managerDecidedOn: null,
    escalatedOn: null,
    appliedOn: todayKey(),
    createdAt: new Date().toISOString(),
    decidedBy: null,
    decidedOn: null
  }
  all.push(request)
  write(KEYS.leaves, all)
  return request
}

// Employee withdraws a pending leave request.
export function withdrawLeave(leaveId, employeeId) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.employeeId !== employeeId) return null
  if (leave.status !== 'pending') return null
  all[idx] = { ...leave, status: 'withdrawn', withdrawnOn: todayKey() }
  write(KEYS.leaves, all)
  return all[idx]
}

// Employee edits a pending leave request.
export function updateLeave(leaveId, employeeId, {
  type,
  fromDate,
  toDate,
  reason,
  supportingDocuments = [],
  halfDayPart = null
}) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.employeeId !== employeeId) return null
  if (leave.status !== 'pending') return null
  // Block edits after manager approval (request is with HR).
  if (leave.managerStatus === 'approved') return null
  all[idx] = {
    ...leave,
    type,
    fromDate,
    toDate,
    halfDayPart: halfDayPart || null,
    reason: reason || '',
    supportingDocuments: Array.isArray(supportingDocuments) ? supportingDocuments : [],
    rejectionReason: '',
    decidedBy: null,
    decidedOn: null
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// The employee's manager approves or rejects a manager-stage leave request.
// Approval moves it to HR for final approval; rejection ends it.
export function managerDecideLeave(leaveId, managerId, approve, rejectionReason = '') {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.status !== 'pending' || leave.stage !== 'manager') return null
  const employee = getEmployeeById(leave.employeeId)
  if (!employee || employee.managerId !== managerId) return null

  if (approve) {
    all[idx] = {
      ...leave,
      stage: 'hr',
      managerStatus: 'approved',
      managerDecidedBy: managerId,
      managerDecidedOn: new Date().toISOString()
    }
  } else {
    all[idx] = {
      ...leave,
      status: 'rejected',
      managerStatus: 'rejected',
      managerDecidedBy: managerId,
      managerDecidedOn: new Date().toISOString(),
      rejectionReason,
      decidedBy: managerId,
      decidedOn: new Date().toISOString()
    }
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// HR/Admin approves or rejects a request. status is 'approved' or 'rejected'.
export function setLeaveStatus(leaveId, status, decidedBy, rejectionReason = '') {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status,
    decidedBy: decidedBy || null,
    decidedOn: new Date().toISOString(),
    rejectionReason: status === 'rejected' ? (rejectionReason || '').trim() : ''
  }
  write(KEYS.leaves, all)
  return all[idx]
}

export function getLeaveById(leaveId) {
  return getLeaves().find((l) => l.id === leaveId) || null
}

// Add a message to a pending leave request thread.
export function addLeaveMessage(leaveId, { byId, byRole, text }) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null

  const leave = all[idx]
  if (leave.status !== 'pending') return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  if (byRole === 'employee' && byId !== leave.employeeId) return null
  if (byRole !== 'employee' && byRole !== 'admin') return null

  all[idx] = {
    ...leave,
    messages: [
      ...(leave.messages || []),
      {
        id: `LVM${Date.now()}`,
        byId,
        byRole,
        text: trimmed,
        on: todayKey()
      }
    ]
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// ---- reimbursements ----
export function getReimbursements() {
  return read(KEYS.reimbursements, [])
}

export function getReimbursementsForEmployee(employeeId) {
  return getReimbursements()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
}

// ── Single-row save for a new reimbursement claim ──────────────────
// The old path re-uploaded the ENTIRE reimbursements list (≈3000 rows) on
// every submit, which is slow and can silently drop the new claim if the tab
// closes or the network blips mid-upload. These helpers push ONLY the one new
// claim and report success/failure so the UI can confirm or offer a retry.
// The full-list upload is intentionally NOT triggered here.

function upsertSingleReimbursement(claim) {
  const tableName = OPTIMIZED_TABLES[KEYS.reimbursements]
  if (!supabase || !tableName) return Promise.resolve({ ok: false, error: 'No server connection' })
  return supabase
    .from(tableName)
    .upsert([transformRowToDb(claim)], { onConflict: 'id' })
    .then(({ error }) => (error ? { ok: false, error: error.message } : { ok: true }))
    .catch((err) => ({ ok: false, error: (err && err.message) || String(err) }))
}

// Push ONE already-local claim row to the server and track pending state so a
// reload can retry. Returns { ok, offline?, error? }. Shared by submit/edit/
// withdraw so they all behave the same way.
async function syncClaimRow(claim) {
  if (!supabase) return { ok: true, offline: true }
  pendingWrites.add(KEYS.reimbursements)
  savePendingWrites()
  const res = await upsertSingleReimbursement(claim)
  if (res.ok) {
    pendingWrites.delete(KEYS.reimbursements)
    savePendingWrites()
    return { ok: true }
  }
  return { ok: false, error: res.error }
}

// Persist locally (instant, works offline) then push ONLY this claim to the
// server. Returns { claim, ok, offline, error }. The caller shows a "Saved" or
// "Failed — tap to retry" message based on `ok`.
export async function submitReimbursementClaimSynced({
  employeeId,
  category,
  expenseDate,
  amount,
  description
}) {
  const all = getReimbursements()
  const claim = {
    id: `RMB${Date.now()}`,
    employeeId,
    category,
    expenseDate,
    amount,
    description: description || '',
    status: 'pending',
    appliedOn: new Date().toISOString(),
    decidedBy: null,
    decidedOn: null,
    paidOn: null,
    reviewNote: ''
  }
  all.push(claim)
  // Save to memory + browser storage only — no heavy full-list upload.
  writeLocal(KEYS.reimbursements, all)
  const sync = await syncClaimRow(claim)
  return { claim, ...sync }
}

// Re-attempt the server save for a claim that failed earlier. The claim id is
// stable, so the upsert is idempotent (no duplicates). Returns { ok, error }.
export async function retrySyncReimbursementClaim(claim) {
  if (!claim) return { ok: false, error: 'Nothing to retry' }
  return syncClaimRow(claim)
}

// Employee withdraws a pending reimbursement claim. Saves locally then pushes
// only that row to the server. Returns { claim, ok, offline?, error? }, or null
// if the claim isn't found / not owned / not pending.
export async function withdrawReimbursementClaim(claimId, employeeId) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  const claim = all[idx]
  if (claim.employeeId !== employeeId) return null
  if (claim.status !== 'pending') return null
  const updated = { ...claim, status: 'withdrawn', withdrawnOn: new Date().toISOString() }
  all[idx] = updated
  writeLocal(KEYS.reimbursements, all)
  const sync = await syncClaimRow(updated)
  return { claim: updated, ...sync }
}

// Employee edits a pending reimbursement claim. Saves locally then pushes only
// that row to the server. Returns { claim, ok, offline?, error? }, or null if
// the claim isn't found / not owned / not pending.
export async function updateReimbursementClaim(claimId, employeeId, {
  category,
  expenseDate,
  amount,
  description
}) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  const claim = all[idx]
  if (claim.employeeId !== employeeId) return null
  if (claim.status !== 'pending') return null
  const updated = {
    ...claim,
    category,
    expenseDate,
    amount,
    description: description || '',
    reviewNote: '',
    decidedBy: null,
    decidedOn: null
  }
  all[idx] = updated
  writeLocal(KEYS.reimbursements, all)
  const sync = await syncClaimRow(updated)
  return { claim: updated, ...sync }
}

export function approveReimbursementClaim(claimId, decidedBy) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status: 'approved_unpaid',
    decidedBy: decidedBy || null,
    decidedOn: new Date().toISOString(),
    reviewNote: ''
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

export function rejectReimbursementClaim(claimId, decidedBy, reviewNote = '') {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status: 'rejected',
    decidedBy: decidedBy || null,
    decidedOn: new Date().toISOString(),
    reviewNote: reviewNote || '',
    paidOn: null
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

export function markReimbursementPaid(claimId, decidedBy) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0 || all[idx].status !== 'approved_unpaid') return null
  all[idx] = {
    ...all[idx],
    status: 'paid',
    paidOn: new Date().toISOString(),
    decidedBy: decidedBy || all[idx].decidedBy
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

// Q&A message on a reimbursement claim between HR/Admin and the employee.
export function addReimbursementMessage(claimId, { byId, byRole, text }) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null

  const claim = all[idx]
  if (claim.status !== 'pending') return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  if (byRole === 'employee' && byId !== claim.employeeId) return null
  if (byRole !== 'employee' && byRole !== 'admin') return null

  const next = all.slice()
  next[idx] = {
    ...claim,
    messages: [
      ...(claim.messages || []),
      {
        id: `RMM${Date.now()}`,
        byId,
        byRole,
        text: trimmed,
        on: todayKey()
      }
    ]
  }
  write(KEYS.reimbursements, next)
  return next[idx]
}

// ---- tasks ----
export function getTasks() {
  return read(KEYS.tasks, [])
}

// Tasks assigned to one person, newest first.
export function getTasksForAssignee(employeeId) {
  return getTasks()
    .filter((t) => t.assigneeId === employeeId)
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

// Create a new task. Returns the saved task.
export function addTask({ title, description, assigneeId, createdById, dueDate, priority }) {
  const all = getTasks()
  const task = {
    id: `TSK${Date.now()}`,
    title,
    description: description || '',
    assigneeId,
    createdById,
    dueDate: dueDate || '',
    priority: priority || 'medium',
    status: 'todo',
    createdOn: todayKey(),
    messages: []
  }
  all.push(task)
  write(KEYS.tasks, all)
  return task
}

// Move a task to a new status (internal / admin use).
export function updateTaskStatus(taskId, status) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status }
  write(KEYS.tasks, all)
  return all[idx]
}

export function isSelfAssignedTask(task) {
  return task.createdById === task.assigneeId
}

// Edit a self-created task (assignee only).
export function updateTaskByAssignee(taskId, employeeId, { title, description, dueDate, priority }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  if (task.assigneeId !== employeeId) return null
  if (!isSelfAssignedTask(task)) return null
  if (task.status === 'closed') return null
  all[idx] = {
    ...task,
    title: title?.trim() || task.title,
    description: description !== undefined ? description : task.description,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    priority: priority || task.priority
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Edit any task (admin use).
export function updateTaskByAdmin(taskId, { title, description, assigneeId, dueDate, priority }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  all[idx] = {
    ...task,
    title: title?.trim() || task.title,
    description: description !== undefined ? description : task.description,
    assigneeId: assigneeId || task.assigneeId,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    priority: priority || task.priority
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Remove a task.
export function deleteTask(taskId) {
  const all = getTasks().filter((t) => t.id !== taskId)
  write(KEYS.tasks, all)
}

// Delete only self-created tasks for the assignee.
export function deleteTaskByAssignee(taskId, employeeId) {
  const task = getTaskById(taskId)
  if (!task || task.assigneeId !== employeeId) return false
  if (!isSelfAssignedTask(task)) return false
  deleteTask(taskId)
  return true
}

// Employee status change with self vs manager-assigned rules.
export function updateTaskStatusByEmployee(taskId, employeeId, status) {
  const task = getTaskById(taskId)
  if (!task || task.assigneeId !== employeeId) return null

  if (isSelfAssignedTask(task)) {
    if (!['todo', 'inprogress', 'done'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  if (task.status === 'closed') return null
  if (!['todo', 'inprogress', 'done'].includes(status)) return null

  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  all[idx] = {
    ...task,
    status,
    completedOn: status === 'done' ? todayKey() : ''
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Manager approves after the employee marked a team task as done.
export function approveTaskClosure(taskId, managerId) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  if (task.status !== 'done') return null
  if (isSelfAssignedTask(task)) return null
  if (task.createdById !== managerId) return null
  all[idx] = {
    ...task,
    status: 'closed',
    closedBy: managerId,
    closedOn: todayKey()
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Manager status change (team tasks they assigned, or their own self-tasks).
export function updateTaskStatusByManager(taskId, managerId, status) {
  const task = getTaskById(taskId)
  if (!task) return null

  if (isSelfAssignedTask(task) && task.assigneeId === managerId) {
    if (!['todo', 'inprogress', 'done'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  if (task.createdById === managerId && !isSelfAssignedTask(task)) {
    if (task.status === 'done' || task.status === 'closed') return null
    if (!['todo', 'inprogress'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  return null
}

// Admin follow-up message on any task (no participant restriction).
export function addTaskMessageByAdmin(taskId, { byId, text }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null

  const task = all[idx]
  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  all[idx] = {
    ...task,
    messages: [
      ...(task.messages || []),
      { id: `TSM${Date.now()}`, byId, text: trimmed, on: todayKey() }
    ]
  }
  write(KEYS.tasks, all)
  return all[idx]
}

export function getTaskById(taskId) {
  return getTasks().find((t) => t.id === taskId) || null
}

// Add a message to a task Q&A thread (assignee or task creator only).
export function addTaskMessage(taskId, { byId, text }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null

  const task = all[idx]
  if (byId !== task.assigneeId && byId !== task.createdById) return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  all[idx] = {
    ...task,
    messages: [
      ...(task.messages || []),
      { id: `TSM${Date.now()}`, byId, text: trimmed, on: todayKey() }
    ]
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// ---- onboarding profiles ----
export function getProfiles() {
  return read(KEYS.profiles, [])
}

// Get one employee's profile, or a fresh blank one if none exists yet.
export function getProfileForEmployee(employeeId) {
  const found = getProfiles().find((p) => p.employeeId === employeeId)
  return found || blankProfile(employeeId)
}

// Save or replace a profile in storage.
function upsertProfile(profile) {
  const all = getProfiles()
  const idx = all.findIndex((p) => p.employeeId === profile.employeeId)
  if (idx >= 0) all[idx] = profile
  else all.push(profile)
  write(KEYS.profiles, all)
  return profile
}

// Employee saves progress. Keeps the current editable status.
export function saveProfileDraft(employeeId, data) {
  const current = getProfileForEmployee(employeeId)
  const editableStatuses = ['draft', 'returned', 'update_approved']
  const profile = {
    ...current,
    ...data,
    employeeId,
    status: editableStatuses.includes(current.status) ? current.status : 'draft',
    updatedOn: todayKey()
  }
  return upsertProfile(profile)
}

// Employee submits for review. Becomes locked ('submitted').
export function submitProfile(employeeId, data) {
  const current = getProfileForEmployee(employeeId)
  const profile = {
    ...current,
    ...data,
    employeeId,
    status: 'submitted',
    updatedOn: todayKey(),
    submittedOn: todayKey(),
    reviewNote: '',
    updateRequestedOn: '',
    updateRequestNote: ''
  }
  return upsertProfile(profile)
}

// Verified employee asks HR for permission to update their details.
export function requestProfileUpdate(employeeId, note = '') {
  const current = getProfileForEmployee(employeeId)
  if (current.status !== 'verified') return null
  const profile = {
    ...current,
    status: 'update_requested',
    updateRequestedOn: todayKey(),
    updateRequestNote: String(note || '').trim(),
    reviewNote: ''
  }
  return upsertProfile(profile)
}

// HR approves or denies an employee's request to update their details.
export function reviewProfileUpdateRequest(employeeId, approved, reviewedBy, note = '') {
  const current = getProfileForEmployee(employeeId)
  if (current.status !== 'update_requested') return null
  if (approved) {
    return upsertProfile({
      ...current,
      status: 'update_approved',
      reviewedBy: reviewedBy || '',
      reviewedOn: todayKey(),
      reviewNote: String(note || '').trim()
    })
  }
  return upsertProfile({
    ...current,
    status: 'verified',
    updateRequestedOn: '',
    updateRequestNote: '',
    reviewedBy: reviewedBy || '',
    reviewedOn: todayKey(),
    reviewNote: String(note || '').trim()
  })
}

// HR verifies or returns a profile. decision = 'verified' | 'returned'.
export function reviewProfile(employeeId, decision, reviewedBy, note) {
  const current = getProfileForEmployee(employeeId)
  const profile = {
    ...current,
    status: decision,
    reviewedBy: reviewedBy || '',
    reviewedOn: todayKey(),
    reviewNote: decision === 'returned' ? (note || '') : ''
  }
  return upsertProfile(profile)
}

// ---- queries & grievances (help desk tickets) ----
export function getTickets() {
  return read(KEYS.tickets, [])
}

// One employee's own tickets, newest activity first.
export function getTicketsForEmployee(employeeId) {
  return getTickets()
    .filter((t) => t.employeeId === employeeId)
    .sort((a, b) => (a.updatedOn < b.updatedOn ? 1 : -1))
}

// Tickets HR can see. With a single admin login, HR sees everything.
// The `confidential` flag on grievances is kept so that, once real HR-staff
// vs Internal-Committee roles exist, sensitive tickets can be filtered here.
export function getTicketsForHR() {
  return getTickets().sort((a, b) => (a.updatedOn < b.updatedOn ? 1 : -1))
}

// An employee raises a new query or grievance. Returns the saved ticket.
export function createTicket({ employeeId, kind, category, subject, message, anonymous }) {
  const all = getTickets()
  const now = todayKey()
  const isGrievance = kind === 'grievance'
  const ticket = {
    id: `TKT${Date.now()}`,
    kind,
    category,
    subject: subject || '',
    status: 'open',
    employeeId,
    anonymous: isGrievance ? !!anonymous : false,
    confidential: isGrievance,
    createdOn: now,
    updatedOn: now,
    messages: [
      { id: `MSG${Date.now()}`, byId: employeeId, byRole: 'employee', text: message || '', on: now }
    ]
  }
  all.push(ticket)
  write(KEYS.tickets, all)
  return ticket
}

// Employee withdraws an open or in-progress ticket.
export function withdrawTicket(ticketId, employeeId) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.employeeId !== employeeId) return null
  if (!['open', 'inprogress'].includes(t.status)) return null
  all[idx] = { ...t, status: 'withdrawn', updatedOn: todayKey() }
  write(KEYS.tickets, all)
  return all[idx]
}

// Employee edits an open ticket before HR has started working on it.
export function updateTicket(ticketId, employeeId, { kind, category, subject, message, anonymous }) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.employeeId !== employeeId) return null
  if (t.status !== 'open') return null

  const isGrievance = kind === 'grievance'
  const messages = [...(t.messages || [])]
  if (messages.length > 0 && messages[0].byRole === 'employee') {
    messages[0] = { ...messages[0], text: message || '' }
  }

  all[idx] = {
    ...t,
    kind,
    category,
    subject: subject || '',
    anonymous: isGrievance ? !!anonymous : false,
    confidential: isGrievance,
    messages,
    updatedOn: todayKey()
  }
  write(KEYS.tickets, all)
  return all[idx]
}

// Add a reply to a ticket. byRole is 'employee' or 'admin'.
// A reply nudges the status forward: an HR reply on an open ticket makes it
// "in progress"; an employee reply on a resolved ticket reopens it.
export function addTicketMessage(ticketId, { byId, byRole, text }) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.status === 'withdrawn' || t.status === 'closed') return null
  let status = t.status
  if (byRole === 'admin' && status === 'open') status = 'inprogress'
  if (byRole === 'employee' && status === 'resolved') status = 'inprogress'
  all[idx] = {
    ...t,
    status,
    updatedOn: todayKey(),
    messages: [
      ...t.messages,
      { id: `MSG${Date.now()}`, byId, byRole, text: text || '', on: todayKey() }
    ]
  }
  write(KEYS.tickets, all)
  return all[idx]
}

// HR changes a ticket's status ('open' | 'inprogress' | 'resolved' | 'closed').
export function setTicketStatus(ticketId, status) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status, updatedOn: todayKey() }
  write(KEYS.tickets, all)
  return all[idx]
}

// ---- cab management ----

// Vehicles
export function getVehicles() { return read(KEYS.vehicles, []) }
export function addVehicle({ number, label }) {
  const all = getVehicles()
  const v = { id: `VEH${Date.now()}`, number: number || '', label: label || '' }
  all.push(v); write(KEYS.vehicles, all); return v
}
export function updateVehicle(id, data) {
  const all = getVehicles()
  const idx = all.findIndex((v) => v.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.vehicles, all); return all[idx]
}
export function deleteVehicle(id) {
  write(KEYS.vehicles, getVehicles().filter((v) => v.id !== id))
}

// Drivers
export function getDrivers() { return read(KEYS.drivers, []) }
export function getDriverById(id) {
  return getDrivers().find((d) => d.id === id) || null
}
export function addDriver({ name, mobile, pin }) {
  const all = getDrivers()
  const d = { id: `DRV${Date.now()}`, name: name || '', mobile: mobile || '', pin: pin || '' }
  all.push(d); write(KEYS.drivers, all); return d
}
export function updateDriver(id, data) {
  const all = getDrivers()
  const idx = all.findIndex((d) => d.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.drivers, all); return all[idx]
}
export function setDriverPin(id, pin) {
  return updateDriver(id, { pin: pin || '' })
}
export function deleteDriver(id) {
  write(KEYS.drivers, getDrivers().filter((d) => d.id !== id))
}

// Trips
export function getTrips() { return read(KEYS.trips, []) }
export function addTrip({ vehicleId, driverId, direction, time, officeGate, supervisorName, supervisorMobile, shiftStart, shiftEnd }) {
  const all = getTrips()
  const t = {
    id: `TRP${Date.now()}`,
    vehicleId: vehicleId || '', driverId: driverId || '',
    direction: direction || 'pickup', time: time || '',
    officeGate: officeGate || '',
    supervisorName: supervisorName || '', supervisorMobile: supervisorMobile || '',
    shiftStart: shiftStart || '', shiftEnd: shiftEnd || ''
  }
  all.push(t); write(KEYS.trips, all); return t
}
export function updateTrip(id, data) {
  const all = getTrips()
  const idx = all.findIndex((t) => t.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.trips, all); return all[idx]
}
export function deleteTrip(id) {
  write(KEYS.trips, getTrips().filter((t) => t.id !== id))
}

// Cab assignments (employee -> pickup trip + drop trip)
export function getCabAssignments() { return read(KEYS.cabAssignments, []) }
export function getCabAssignmentForEmployee(employeeId) {
  return getCabAssignments().find((a) => a.employeeId === employeeId) || null
}
export function setCabAssignment(employeeId, pickupTripId, dropTripId) {
  const all = getCabAssignments()
  const idx = all.findIndex((a) => a.employeeId === employeeId)
  const entry = { employeeId, pickupTripId: pickupTripId || '', dropTripId: dropTripId || '' }
  if (idx >= 0) all[idx] = entry
  else all.push(entry)
  write(KEYS.cabAssignments, all)
  return entry
}

// Temporary change requests
export function getCabRequests() { return read(KEYS.cabRequests, []) }
export function getCabRequestsForEmployee(employeeId) {
  return getCabRequests()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.raisedOn < b.raisedOn ? 1 : -1))
}
export function createCabRequest({ employeeId, forDates, newLocation, newGate, newTime, reason }) {
  const all = getCabRequests()
  const req = {
    id: `CABREQ${Date.now()}`,
    employeeId,
    forDates: forDates || [],
    newLocation: newLocation || '',
    newGate: newGate || '',
    newTime: newTime || '',
    reason: reason || '',
    status: 'pending',
    adminNote: '',
    raisedOn: todayKey()
  }
  all.push(req); write(KEYS.cabRequests, all); return req
}
export function setCabRequestStatus(requestId, status, adminNote) {
  const all = getCabRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status, adminNote: adminNote || '' }
  write(KEYS.cabRequests, all); return all[idx]
}
export function updateCabRequest(requestId, data) {
  const all = getCabRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.cabRequests, all); return all[idx]
}
export function deleteCabRequest(requestId) {
  const all = getCabRequests().filter((r) => r.id !== requestId)
  write(KEYS.cabRequests, all)
}

// Team chat messages (one thread per pair of employees).
// Conversation key is always sorted so both participants share the same thread.
export function getTeamConversations() { return read(KEYS.teamConversations, []) }

export function getTeamConversationKey(a, b) {
  return [a, b].sort().join('__')
}

export function getTeamMessages(employeeId, peerId) {
  const key = getTeamConversationKey(employeeId, peerId)
  // Check if this user has cleared the conversation and get the timestamp.
  const cleared = read(KEYS.teamClearedChats, {})
  const clearedAt = cleared[employeeId]?.[key]
  const messages = getTeamConversations()
    .filter((m) => m.conversationKey === key)
  // If cleared, only show messages sent after the clear timestamp.
  if (clearedAt) {
    return messages
      .filter((m) => m.on > clearedAt)
      .sort((a, b) => (a.on > b.on ? 1 : -1))
  }
  return messages.sort((a, b) => (a.on > b.on ? 1 : -1)) // oldest first (newest at bottom)
}

export function addTeamMessage({ fromId, toId, text, attachments }) {
  const all = getTeamConversations()
  const msg = {
    id: `TMSG${Date.now()}`,
    conversationKey: getTeamConversationKey(fromId, toId),
    fromId,
    toId,
    text: text || '',
    attachments: attachments || [],
    on: new Date().toISOString(),
    read: false
  }
  all.push(msg)
  write(KEYS.teamConversations, all)
  return msg
}

export function markTeamMessagesRead(employeeId, peerId) {
  const key = getTeamConversationKey(employeeId, peerId)
  const all = getTeamConversations()
  let changed = false
  for (let i = 0; i < all.length; i++) {
    if (all[i].conversationKey === key && all[i].toId === employeeId && !all[i].read) {
      all[i] = { ...all[i], read: true }
      changed = true
    }
  }
  if (changed) write(KEYS.teamConversations, all)
}

export function getTeamUnreadCount(employeeId) {
  const counts = {}
  const cleared = read(KEYS.teamClearedChats, {})
  const userCleared = cleared[employeeId] || {}
  for (const m of getTeamConversations()) {
    // Skip if this message was sent before the clear timestamp.
    const clearedAt = userCleared[m.conversationKey]
    if (clearedAt && m.on <= clearedAt) continue
    if (m.toId === employeeId && !m.read) {
      counts[m.fromId] = (counts[m.fromId] || 0) + 1
    }
  }
  return counts
}

export function clearTeamConversation(employeeId, peerId) {
  const key = getTeamConversationKey(employeeId, peerId)
  // Store the clear timestamp so only messages after this point are shown.
  const cleared = read(KEYS.teamClearedChats, {})
  if (!cleared[employeeId]) cleared[employeeId] = {}
  cleared[employeeId][key] = new Date().toISOString()
  write(KEYS.teamClearedChats, cleared)
}

// Cab chat messages (one ongoing thread per employee).
export function getCabMessages() { return read(KEYS.cabMessages, []) }
export function getCabMessagesForEmployee(employeeId) {
  return getCabMessages()
    .filter((m) => m.employeeId === employeeId)
    .sort((a, b) => (a.on > b.on ? 1 : -1)) // oldest first, like a chat
}
export function addCabMessage({ employeeId, byRole, text }) {
  const all = getCabMessages()
  const msg = {
    id: `CABMSG${Date.now()}`,
    employeeId,
    byRole: byRole || 'employee',
    text: text || '',
    on: new Date().toISOString(),
    readByAdmin: byRole === 'admin' // employee messages start unread
  }
  all.push(msg); write(KEYS.cabMessages, all); return msg
}

// Mark every employee message in one employee's thread as read by admin.
export function markCabThreadRead(employeeId) {
  const all = getCabMessages()
  let changed = false
  for (let i = 0; i < all.length; i++) {
    if (all[i].employeeId === employeeId && all[i].byRole === 'employee' && !all[i].readByAdmin) {
      all[i] = { ...all[i], readByAdmin: true }
      changed = true
    }
  }
  if (changed) write(KEYS.cabMessages, all)
}

// Employee-side "clear chat" for the cab thread: stores a timestamp so the
// employee only sees messages sent after it. The transport desk (admin) keeps
// the full history.
export function clearCabChat(employeeId) {
  const cleared = read(KEYS.cabClearedChats, {})
  cleared[employeeId] = new Date().toISOString()
  write(KEYS.cabClearedChats, cleared)
}
export function getCabClearedAt(employeeId) {
  return read(KEYS.cabClearedChats, {})[employeeId] || null
}

// Admin-side "clear chat" for the same cab thread: independent timestamp so the
// transport desk can clear their view without affecting the employee's copy.
export function clearCabChatAdmin(employeeId) {
  const cleared = read(KEYS.cabClearedChatsAdmin, {})
  cleared[employeeId] = new Date().toISOString()
  write(KEYS.cabClearedChatsAdmin, cleared)
}
export function getCabClearedAtAdmin(employeeId) {
  return read(KEYS.cabClearedChatsAdmin, {})[employeeId] || null
}

// Unread count per employee, e.g. { EMP004: 2 }. Only counts employee messages
// the admin has not read yet.
export function getCabUnreadByEmployee() {
  const counts = {}
  for (const m of getCabMessages()) {
    if (m.byRole === 'employee' && !m.readByAdmin) {
      counts[m.employeeId] = (counts[m.employeeId] || 0) + 1
    }
  }
  return counts
}

// ---- cab cancellations (skip pickup / drop for today) ----
// Stored as an array of { employeeId, date, skipPickup, skipDrop }.
// One record per employee per date; upserted on every save.
export function getCabCancellations() {
  return read(KEYS.cabCancellations, [])
}

export function getCabCancellationForEmployee(employeeId, date) {
  return getCabCancellations().find(
    (c) => c.employeeId === employeeId && c.date === date
  ) || null
}

// date is a YYYY-MM-DD string (today). skipPickup / skipDrop are booleans.
export function setCabCancellation(employeeId, date, skipPickup, skipDrop) {
  const all = getCabCancellations()
  const idx = all.findIndex((c) => c.employeeId === employeeId && c.date === date)
  const entry = { employeeId, date, skipPickup: !!skipPickup, skipDrop: !!skipDrop }
  if (idx >= 0) all[idx] = entry
  else all.push(entry)
  write(KEYS.cabCancellations, all)
  return entry
}

// All cancellations for a specific date (for the admin / driver view).
export function getCabCancellationsForDate(date) {
  return getCabCancellations().filter((c) => c.date === date)
}

// ---- driver run sheet ----
// Builds the complete pickup + drop list for a driver on a given date.
// Returns { driver, pickupStops, dropStops } where each stop is:
//   { employee, trip, vehicle, profile, cancelled }
// cancelled = true means the employee opted out for today.
export function getDriverRunSheet(driverId, date) {
  const drivers    = getDrivers()
  const driver     = drivers.find((d) => d.id === driverId) || null
  if (!driver) return null

  const trips       = getTrips()
  const vehicles    = getVehicles()
  const assignments = getCabAssignments()
  const employees   = getEmployees()
  const cancels     = getCabCancellationsForDate(date)

  // Helper: get profile personal data for an employee
  function personInfo(empId) {
    const profile = getProfileForEmployee(empId)
    const p = profile?.personal || {}
    return {
      address:      p.address       || '--',
      homeGate:     p.homeGate      || '--',
      mobile:       p.contactNumber || '--',
      pickupPoint:  p.pickupPoint   || null,
      dropPoint:    p.dropSameAsPickup !== false ? (p.pickupPoint || null) : (p.dropPoint || null)
    }
  }

  // All trips belonging to this driver
  const driverTrips = trips.filter((t) => t.driverId === driverId)
  const pickupTrips = driverTrips.filter((t) => t.direction === 'pickup')
  const dropTrips   = driverTrips.filter((t) => t.direction === 'drop')

  function buildStops(tripList, direction) {
    const stops = []
    for (const trip of tripList) {
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId) || null
      // Find all employees on this trip
      const assigned = assignments.filter((a) =>
        direction === 'pickup'
          ? a.pickupTripId === trip.id
          : a.dropTripId === trip.id
      )
      for (const a of assigned) {
        const emp = employees.find((e) => e.id === a.employeeId) || { id: a.employeeId, name: a.employeeId }
        const cancel = cancels.find((c) => c.employeeId === a.employeeId) || null
        const cancelled = direction === 'pickup'
          ? !!(cancel?.skipPickup)
          : !!(cancel?.skipDrop)
        stops.push({
          employee:  emp,
          trip,
          vehicle,
          info: personInfo(a.employeeId),
          cancelled
        })
      }
    }
    // Sort by trip time
    stops.sort((a, b) => (a.trip.time < b.trip.time ? -1 : 1))
    return stops
  }

  return {
    driver,
    pickupStops: buildStops(pickupTrips, 'pickup'),
    dropStops:   buildStops(dropTrips, 'drop'),
    allStops:    [...buildStops(pickupTrips, 'pickup'), ...buildStops(dropTrips, 'drop')]
                   .sort((a, b) => (a.trip.time < b.trip.time ? -1 : 1))
  }
}

// ---- IT Help Desk ----
export function getITIssues() {
  return read(KEYS.itIssues, [])
}

export function getITIssuesForEmployee(employeeId) {
  return getITIssues()
    .filter((i) => i.employeeId === employeeId)
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

export function getITStaff() {
  return read(KEYS.itStaff, [])
}

export function getITStaffById(id) {
  return getITStaff().find((s) => s.id === id) || null
}

// Create a new IT issue. Returns the saved issue.
export function createITIssue({ employeeId, issue, description, priority, category, attachment }) {
  const all = getITIssues()
  const newIssue = {
    id: `ITI${Date.now()}`,
    employeeId,
    issue,
    description: description || '',
    category: category || 'other',
    priority,
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    attachment: attachment || null,
    comments: [],
    createdOn: todayKey(),
    updatedOn: todayKey()
  }
  all.push(newIssue)
  write(KEYS.itIssues, all)
  return newIssue
}

// Employee withdraws an open or in-progress IT issue.
export function withdrawITIssue(issueId, employeeId) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  if (issue.employeeId !== employeeId) return null
  if (!['open', 'inprogress'].includes(issue.status)) return null
  all[idx] = { ...issue, status: 'withdrawn', updatedOn: todayKey() }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Employee edits an open IT issue that has not been assigned yet.
export function updateITIssue(issueId, employeeId, { issue, description, priority, category, attachment }) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const row = all[idx]
  if (row.employeeId !== employeeId) return null
  if (row.status !== 'open' || row.assignedTo) return null
  all[idx] = {
    ...row,
    issue,
    description: description || '',
    priority,
    category: category || row.category || 'other',
    attachment: attachment === undefined ? row.attachment || null : (attachment || null),
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Assign an IT issue to a staff member and set estimated time
export function assignITIssue(issueId, assignedTo, estimatedTime) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    assignedTo,
    estimatedTime,
    status: 'inprogress',
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Update IT issue status
export function setITIssueStatus(issueId, status) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status,
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Employee re-opens an issue that was marked resolved/closed but is not
// actually fixed. It goes back to open so IT picks it up again.
export function reopenITIssue(issueId, employeeId) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  if (issue.employeeId !== employeeId) return null
  if (!['resolved', 'closed'].includes(issue.status)) return null
  all[idx] = { ...issue, status: 'open', updatedOn: todayKey() }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Add a comment to an IT issue's thread. author = { byId, byName, byRole }
// where byRole is 'employee' or 'it'.
export function addITIssueComment(issueId, author, text) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  const comment = {
    id: `ITIC${Date.now()}`,
    byId: author.byId,
    byName: author.byName,
    byRole: author.byRole,
    text,
    on: todayKey()
  }
  all[idx] = {
    ...issue,
    comments: [...(issue.comments || []), comment],
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return comment
}

// ---- Company Announcements ----
export function getAnnouncements() {
  return read(KEYS.announcements, [])
}

// Get announcements for a specific employee (excludes those where employee is in excludedEmployees list)
export function getAnnouncementsForEmployee(employeeId) {
  const all = getAnnouncements()
  return all
    .filter((a) => !a.excludedEmployees.includes(employeeId))
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

// Create a new announcement. Returns the saved announcement.
export function createAnnouncement({ title, content, type, createdBy, excludedEmployees }) {
  const all = getAnnouncements()
  const announcement = {
    id: `ANN${Date.now()}`,
    title,
    content: content || '',
    type,
    createdBy,
    createdOn: todayKey(),
    excludedEmployees: excludedEmployees || []
  }
  all.push(announcement)
  write(KEYS.announcements, all)
  return announcement
}

// Delete an announcement
export function deleteAnnouncement(announcementId) {
  const all = getAnnouncements()
  const filtered = all.filter((a) => a.id !== announcementId)
  write(KEYS.announcements, filtered)
  return filtered
}

// Get read announcements tracking data
function getReadAnnouncements() {
  return read(KEYS.readAnnouncements, {})
}

// Count unread announcements for an employee
export function getUnreadAnnouncementCount(employeeId) {
  const readData = getReadAnnouncements()
  const readIds = readData[employeeId] || []
  const allAnnouncements = getAnnouncements()
  const availableToEmployee = allAnnouncements.filter((a) => 
    !a.excludedEmployees.includes(employeeId)
  )
  return availableToEmployee.filter((a) => !readIds.includes(a.id)).length
}

// Mark an announcement as read for an employee
export function markAnnouncementAsRead(employeeId, announcementId) {
  const readData = getReadAnnouncements()
  if (!readData[employeeId]) {
    readData[employeeId] = []
  }
  if (!readData[employeeId].includes(announcementId)) {
    readData[employeeId].push(announcementId)
    write(KEYS.readAnnouncements, readData)
  }
}

export function isAnnouncementRead(employeeId, announcementId) {
  const readData = getReadAnnouncements()
  return (readData[employeeId] || []).includes(announcementId)
}

// ---- employee notification reads ----
function getNotificationReadsMap() {
  return read(KEYS.notificationReads, {})
}

export function getReadNotificationIds(employeeId) {
  return getNotificationReadsMap()[employeeId] || []
}

export function markNotificationRead(employeeId, notificationId) {
  const all = getNotificationReadsMap()
  const list = all[employeeId] || []
  if (list.includes(notificationId)) return
  all[employeeId] = [...list, notificationId]
  writeImmediate(KEYS.notificationReads, all)
}

export function markAllNotificationsRead(employeeId, notificationIds) {
  const all = getNotificationReadsMap()
  const existing = new Set(all[employeeId] || [])
  for (const id of notificationIds) existing.add(id)
  all[employeeId] = [...existing]
  writeImmediate(KEYS.notificationReads, all)
}

// ---- employee notification dismissals ("clear all") ----
export function getDismissedNotificationIds(employeeId) {
  return read(KEYS.notificationDismissed, {})[employeeId] || []
}

export function dismissAllNotifications(employeeId, notificationIds) {
  const all = read(KEYS.notificationDismissed, {})
  const existing = new Set(all[employeeId] || [])
  for (const id of notificationIds) existing.add(id)
  all[employeeId] = [...existing]
  writeImmediate(KEYS.notificationDismissed, all)
}

// ---- shifts ----
// A shift defines a working time window (e.g. Morning 06:00–14:00).
// Every employee is assigned to one shift; attendance is calculated against it.

export function getShifts() {
  return read(KEYS.shifts, DEFAULT_SHIFTS)
}

export function getShiftById(shiftId) {
  return getShifts().find((s) => s.id === shiftId) || null
}

// Return the shift assigned to an employee, or null if none.
export function getShiftForEmployee(employeeId) {
  const emp = getEmployeeById(employeeId)
  if (!emp || !emp.shiftId) return null
  return getShiftById(emp.shiftId)
}

// Return the start time string (e.g. "09:30") for an employee's shift,
// or the global officeStartTime fallback when no shift is assigned.
export function getEmployeeShiftStartTime(employeeId) {
  const shift = getShiftForEmployee(employeeId)
  if (shift) return shift.startTime
  return getSettings().officeStartTime
}

export function addShift(shift) {
  const all = getShifts()
  const newShift = {
    id: shift.id || `SHIFT_${Date.now()}`,
    name: shift.name || '',
    startTime: shift.startTime || '',
    endTime: shift.endTime || ''
  }
  all.push(newShift)
  write(KEYS.shifts, all)
  return newShift
}

export function updateShift(shiftId, data) {
  const all = getShifts()
  const idx = all.findIndex((s) => s.id === shiftId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.shifts, all)
  return all[idx]
}

export function deleteShift(shiftId) {
  // Remove the shift definition and clear any employee assignments to it.
  write(KEYS.shifts, getShifts().filter((s) => s.id !== shiftId))
  const emps = getEmployees()
  let changed = false
  for (const e of emps) {
    if (e.shiftId === shiftId) {
      e.shiftId = null
      changed = true
    }
  }
  if (changed) write(KEYS.employees, emps)
}

// Assign (or change) an employee's shift. Logs the change in history.
export function assignEmployeeShift(employeeId, shiftId, changedBy) {
  const all = getEmployees()
  const idx = all.findIndex((e) => e.id === employeeId)
  if (idx < 0) return null
  const prevShiftId = all[idx].shiftId || null
  if (prevShiftId === shiftId) return all[idx]
  all[idx] = { ...all[idx], shiftId }
  write(KEYS.employees, all)
  // Log the change.
  const history = getShiftHistory()
  history.push({
    id: `SH${Date.now()}`,
    employeeId,
    fromShiftId: prevShiftId,
    toShiftId: shiftId,
    changedBy: changedBy || '',
    changedOn: todayKey()
  })
  write(KEYS.shiftHistory, history)
  return all[idx]
}

// ---- shift change requests ----
// An employee can ask to move to a different shift. Admin approves/rejects.

export function getShiftChangeRequests() {
  return read(KEYS.shiftChangeRequests, [])
}

export function getShiftChangeRequestsForEmployee(employeeId) {
  return getShiftChangeRequests()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
}

export function requestShiftChange(employeeId, toShiftId, reason) {
  const all = getShiftChangeRequests()
  const emp = getEmployeeById(employeeId)
  const req = {
    id: `SCR${Date.now()}`,
    employeeId,
    fromShiftId: emp?.shiftId || null,
    toShiftId,
    reason: reason || '',
    status: 'pending',
    requestedOn: new Date().toISOString(),
    decidedBy: null,
    decidedOn: null,
    rejectReason: ''
  }
  all.push(req)
  write(KEYS.shiftChangeRequests, all)
  return req
}

export function approveShiftChange(requestId, decidedBy) {
  const all = getShiftChangeRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  const req = all[idx]
  if (req.status !== 'pending') return null
  all[idx] = {
    ...req,
    status: 'approved',
    decidedBy,
    decidedOn: new Date().toISOString()
  }
  write(KEYS.shiftChangeRequests, all)
  // Actually apply the shift change.
  assignEmployeeShift(req.employeeId, req.toShiftId, decidedBy)
  return all[idx]
}

export function rejectShiftChange(requestId, decidedBy, rejectReason) {
  const all = getShiftChangeRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  const req = all[idx]
  if (req.status !== 'pending') return null
  all[idx] = {
    ...req,
    status: 'rejected',
    decidedBy,
    decidedOn: new Date().toISOString(),
    rejectReason: rejectReason || ''
  }
  write(KEYS.shiftChangeRequests, all)
  return all[idx]
}

export function withdrawShiftChangeRequest(requestId, employeeId) {
  const all = getShiftChangeRequests()
  const idx = all.findIndex((r) => r.id === requestId && r.employeeId === employeeId)
  if (idx < 0) return null
  if (all[idx].status !== 'pending') return null
  all[idx] = { ...all[idx], status: 'withdrawn' }
  write(KEYS.shiftChangeRequests, all)
  return all[idx]
}

export function updateShiftChangeRequest(requestId, employeeId, updates) {
  const all = getShiftChangeRequests()
  const idx = all.findIndex((r) => r.id === requestId && r.employeeId === employeeId)
  if (idx < 0) return null
  if (all[idx].status !== 'pending') return null
  all[idx] = { ...all[idx], ...updates }
  write(KEYS.shiftChangeRequests, all)
  return all[idx]
}

// ---- shift history ----
export function getShiftHistory() {
  return read(KEYS.shiftHistory, [])
}

export function getShiftHistoryForEmployee(employeeId) {
  return getShiftHistory()
    .filter((h) => h.employeeId === employeeId)
    .sort((a, b) => (a.changedOn < b.changedOn ? 1 : -1))
}

// ---- overtime requests ----
// An employee can log extra hours worked beyond their shift. Admin approves/rejects.

export function getOvertimeRequests() {
  return read(KEYS.overtimeRequests, [])
}

export function getOvertimeRequestsForEmployee(employeeId) {
  return getOvertimeRequests()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
}

export function getOvertimeRequestsByMonth(monthKey) {
  return getOvertimeRequests()
    .filter((r) => r.monthKey === monthKey)
    .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
}

// Normalize the approval stage. Requests created before the two-stage flow
// have no `stage` field; treat those as manager-stage so the manager can act.
function otStage(req) {
  return req.stage || 'manager'
}

export function requestOvertime(employeeId, monthKey, hours, reason) {
  const all = getOvertimeRequests()
  const req = {
    id: `OT${Date.now()}`,
    employeeId,
    monthKey,
    hours: Number(hours) || 0,
    reason: reason || '',
    status: 'pending',
    stage: 'manager',
    managerStatus: null,
    managerDecidedBy: null,
    managerDecidedOn: null,
    requestedOn: new Date().toISOString(),
    decidedBy: null,
    decidedOn: null,
    rejectReason: ''
  }
  all.push(req)
  write(KEYS.overtimeRequests, all)
  return req
}

// The employee's manager approves or rejects a manager-stage overtime request.
// Approval moves it to HR for final approval; rejection ends it.
export function managerDecideOvertime(requestId, managerId, approve, rejectionReason = '') {
  const all = getOvertimeRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  const req = all[idx]
  if (req.status !== 'pending' || otStage(req) !== 'manager') return null
  const employee = getEmployeeById(req.employeeId)
  if (!employee || employee.managerId !== managerId) return null

  if (approve) {
    all[idx] = {
      ...req,
      stage: 'hr',
      managerStatus: 'approved',
      managerDecidedBy: managerId,
      managerDecidedOn: new Date().toISOString()
    }
  } else {
    all[idx] = {
      ...req,
      status: 'rejected',
      managerStatus: 'rejected',
      managerDecidedBy: managerId,
      managerDecidedOn: new Date().toISOString(),
      rejectReason: rejectionReason,
      decidedBy: managerId,
      decidedOn: new Date().toISOString()
    }
  }
  write(KEYS.overtimeRequests, all)
  return all[idx]
}

// HR/Admin approves or rejects an HR-stage overtime request.
export function approveOvertime(requestId, decidedBy) {
  const all = getOvertimeRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  const req = all[idx]
  if (req.status !== 'pending' || otStage(req) !== 'hr') return null
  all[idx] = {
    ...req,
    status: 'approved',
    decidedBy,
    decidedOn: new Date().toISOString()
  }
  write(KEYS.overtimeRequests, all)
  return all[idx]
}

// HR/Admin rejects an HR-stage overtime request.
export function rejectOvertime(requestId, decidedBy, rejectReason) {
  const all = getOvertimeRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  const req = all[idx]
  if (req.status !== 'pending' || otStage(req) !== 'hr') return null
  all[idx] = {
    ...req,
    status: 'rejected',
    decidedBy,
    decidedOn: new Date().toISOString(),
    rejectReason: rejectReason || ''
  }
  write(KEYS.overtimeRequests, all)
  return all[idx]
}

export function withdrawOvertimeRequest(requestId, employeeId) {
  const all = getOvertimeRequests()
  const idx = all.findIndex((r) => r.id === requestId && r.employeeId === employeeId)
  if (idx < 0) return null
  // Can withdraw as long as the request hasn't been finally approved or rejected
  if (all[idx].status !== 'pending') return null
  all[idx] = { ...all[idx], status: 'withdrawn' }
  write(KEYS.overtimeRequests, all)
  return all[idx]
}

export function updateOvertimeRequest(requestId, employeeId, updates) {
  const all = getOvertimeRequests()
  const idx = all.findIndex((r) => r.id === requestId && r.employeeId === employeeId)
  if (idx < 0) return null
  // Can only update if still pending and at manager stage
  if (all[idx].status !== 'pending' || otStage(all[idx]) !== 'manager') return null
  all[idx] = { ...all[idx], ...updates }
  write(KEYS.overtimeRequests, all)
  return all[idx]
}

export function getApprovedOvertimeForMonth(employeeId, monthKey) {
  return getOvertimeRequests()
    .filter((r) => r.employeeId === employeeId && r.monthKey === monthKey && r.status === 'approved')
}

// Migration: update existing reimbursement claims to have proper datetime
// timestamps. The Supabase `reimbursements` table used to store applied_on /
// decided_on as plain DATE columns, so a full ISO datetime was truncated to a
// date-only string ("2026-09-06") on the round trip and showed as 12:00 AM in
// the notification list. Date-only values are rewritten as noon timestamps and
// pushed back, so the fix persists centrally. Runs after every store load.
function migrateReimbursementTimestamps() {
  const all = getReimbursements()
  let needsUpdate = false
  
  for (const claim of all) {
    // Convert date-only strings to ISO datetime strings at noon (12:00 PM)
    if (claim.appliedOn && /^\d{4}-\d{2}-\d{2}$/.test(claim.appliedOn)) {
      claim.appliedOn = new Date(`${claim.appliedOn}T12:00:00`).toISOString()
      needsUpdate = true
    }
    if (claim.decidedOn && /^\d{4}-\d{2}-\d{2}$/.test(claim.decidedOn)) {
      claim.decidedOn = new Date(`${claim.decidedOn}T12:00:00`).toISOString()
      needsUpdate = true
    }
    if (claim.paidOn && /^\d{4}-\d{2}-\d{2}$/.test(claim.paidOn)) {
      claim.paidOn = new Date(`${claim.paidOn}T12:00:00`).toISOString()
      needsUpdate = true
    }
    if (claim.withdrawnOn && /^\d{4}-\d{2}-\d{2}$/.test(claim.withdrawnOn)) {
      claim.withdrawnOn = new Date(`${claim.withdrawnOn}T12:00:00`).toISOString()
      needsUpdate = true
    }
  }
  
  if (needsUpdate) {
    write(KEYS.reimbursements, all)
  }
}
