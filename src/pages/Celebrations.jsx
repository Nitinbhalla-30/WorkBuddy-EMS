import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarHeart, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getCelebrationEvents,
  getEmployees,
  getProfiles,
  getSettings,
  refreshStoreFromSupabase,
  STORE_KEYS
} from '../data/store.js'
import { supabaseEnabled } from '../data/supabaseClient.js'
import {
  CELEBRATION_FUTURE_DAYS,
  CELEBRATION_LOOKAHEAD_DAYS,
  CELEBRATION_PAST_DAYS
} from '../data/celebrationsData.js'
import {
  buildCelebrations,
  canManageCelebrations,
  celebrationKindLabel,
  celebrationToneClass,
  daysBetweenKeys,
  findNextCelebration,
  groupCelebrationsByWhen
} from '../utils/celebrations.js'
import { formatDate, todayDateKey } from '../utils/attendance.js'
import Avatar from '../components/Avatar.jsx'
import CelebrationCard, { KIND_ICONS } from '../components/CelebrationCard.jsx'
import CelebrationAdminPanel from '../components/CelebrationAdminPanel.jsx'

// Tabs are the celebration types plus the HR/Admin calendar. `kinds` decides
// which built events a tab keeps, and doubles as the definition the empty state
// uses to name the next occasion of that type. `adminOnly` tabs are dropped
// entirely for everyone else, so no management control can leak into an
// employee's view.
const TABS = [
  { slug: 'all', label: 'All', emptyTitle: 'Nothing to celebrate this week' },
  { slug: 'birthdays', label: 'Birthdays', kinds: ['birthday'], emptyTitle: 'No birthdays this week' },
  { slug: 'new-joiners', label: 'New joiners', kinds: ['newJoiner'], emptyTitle: 'No new joiners this week' },
  { slug: 'anniversaries', label: 'Work anniversaries', kinds: ['anniversary'], emptyTitle: 'No work anniversaries this week' },
  { slug: 'special-days', label: 'Festivals & national days', kinds: ['festival', 'national', 'occasion'], emptyTitle: 'No festivals or national days this week' },
  { slug: 'manage', label: 'Manage occasions', adminOnly: true }
]
const TAB_SLUGS = TABS.map((t) => t.slug)

// The whole dataset this page reads, grabbed in one go so the derived list is
// always built from a matching set rather than three separate reads.
function readSnapshot() {
  return {
    employees: getEmployees(),
    profiles: getProfiles(),
    events: getCelebrationEvents(),
    settings: getSettings()
  }
}

// Everything anyone needs to know about the people and occasions in the company,
// in one place. Read-only for employees; HR/Admin get the Manage tab.
export default function Celebrations() {
  const { user } = useAuth()
  const canManage = canManageCelebrations(user)
  const tabs = canManage ? TABS : TABS.filter((t) => !t.adminOnly)

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState(() => Math.max(0, TAB_SLUGS.indexOf(tabParam)))

  // Writing the tab back to the URL keeps a reload on the same place.
  const selectTab = useCallback((i) => {
    setTab(i)
    setSearchParams({ tab: TAB_SLUGS[i] }, { replace: true })
  }, [setSearchParams])

  // A tab picked in the URL — a reload, the back button, or a link pasted into
  // chat — has to win over the local tab state, same as the other tabbed pages.
  const prevTabParam = useRef(tabParam)
  useEffect(() => {
    if (tabParam !== prevTabParam.current) {
      setTab(Math.max(0, TAB_SLUGS.indexOf(tabParam)))
      prevTabParam.current = tabParam
    }
  }, [tabParam])

  const [snapshot, setSnapshot] = useState(readSnapshot)
  const [refreshState, setRefreshState] = useState('idle')
  const [bump, setBump] = useState(0)

  // Pull the latest shared data on arrival, the same way the other screens do.
  // The page paints from the store immediately either way, so a slow or failed
  // read shows a note instead of an empty screen.
  useEffect(() => {
    let cancelled = false
    async function load() {
      setRefreshState('refreshing')
      const ok = await refreshStoreFromSupabase([
        STORE_KEYS.employees,
        STORE_KEYS.profiles,
        STORE_KEYS.settings,
        STORE_KEYS.celebrationEvents
      ])
      if (cancelled) return
      setSnapshot(readSnapshot())
      setRefreshState(ok ? 'ready' : supabaseEnabled ? 'failed' : 'ready')
    }
    load()
    return () => { cancelled = true }
  }, [bump])

  const today = todayDateKey()

  // Kept as one object so the list on the page and the empty state's lookahead
  // are always built from exactly the same inputs.
  const buildArgs = useMemo(() => ({
    employees: snapshot.employees,
    profiles: snapshot.profiles,
    events: snapshot.events,
    hiddenSystemIds: snapshot.settings.celebrationsHiddenSlots,
    newJoinerDays: snapshot.settings.newJoinerWindowDays,
    today
  }), [snapshot, today])

  const celebrations = useMemo(() => buildCelebrations(buildArgs), [buildArgs])

  // An employee never gets the manage tab, so a hand-typed ?tab=manage has to
  // fall back to a tab they do have rather than highlighting one they cannot see.
  const activeIndex = tab < tabs.length ? tab : 0
  const activeTab = tabs[activeIndex] || tabs[0]
  const visible = useMemo(
    () => (activeTab.kinds ? celebrations.filter((e) => activeTab.kinds.includes(e.kind)) : celebrations),
    [celebrations, activeTab]
  )
  const groups = useMemo(() => groupCelebrationsByWhen(visible, today), [visible, today])
  const tabIsEmpty = visible.length === 0
  // An empty week is not a dead end. Naming the next occasion answers the
  // question the empty list raises - nothing is missing, this week is just
  // quiet - so the lookup only runs when there is nothing to show.
  const nextUp = useMemo(
    () => (tabIsEmpty ? findNextCelebration(buildArgs, activeTab.kinds || null) : null),
    [tabIsEmpty, buildArgs, activeTab]
  )

  function afterWrite() {
    setSnapshot(readSnapshot())
    setBump((n) => n + 1)
  }

  return (
    <div className="celebrations-page">
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <CalendarHeart size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Celebrations
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            Birthdays, work anniversaries, new beginnings and special occasions across our organization
          </p>
        </div>
        {/* A bare "0 celebrations" next to an empty page reads like a fault, so
            the count only appears when there is a count to give. */}
        {visible.length > 0 && (
          <span className="muted">{visible.length} celebration{visible.length === 1 ? '' : 's'}</span>
        )}
      </div>

      <div className="tabs">
        {tabs.map((t, i) => (
          <button
            key={t.slug}
            type="button"
            className={`tab ${i === activeIndex ? 'tab-active' : ''}`}
            onClick={() => selectTab(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab.slug === 'manage' ? (
        <CelebrationAdminPanel
          user={user}
          settings={snapshot.settings}
          events={snapshot.events}
          onChanged={afterWrite}
        />
      ) : (
        <>
          {refreshState === 'failed' && (
            <p className="error-box" role="status">
              Could not reach the server just now, so this page may be a little behind.
            </p>
          )}
          {refreshState === 'refreshing' && (
            <p className="muted small" style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Checking for new celebrations…
            </p>
          )}

          {/* One panel for a whole empty tab, rather than three empty bands
              competing for attention. The range is printed from the window
              constants so a heading cannot drift from what is collected. */}
          {tabIsEmpty ? (
            <CelebrationEmptyTab tab={activeTab} nextUp={nextUp} today={today} />
          ) : (
            <>
              <CelebrationSection
                title="Today"
                events={groups.today}
                today={today}
                emptyNote="No celebrations today."
              />
              <CelebrationSection
                title="Upcoming"
                range={`next ${CELEBRATION_FUTURE_DAYS} days`}
                events={groups.upcoming}
                today={today}
                emptyNote={`Nothing in the next ${CELEBRATION_FUTURE_DAYS} days.`}
              />
              <CelebrationSection
                title="Recently celebrated"
                range={`past ${CELEBRATION_PAST_DAYS} days`}
                events={groups.recent}
                today={today}
                emptyNote={`Nothing in the past ${CELEBRATION_PAST_DAYS} days.`}
              />
            </>
          )}
        </>
      )}

      <p className="hint">
        Birthdays, new joiners and work anniversaries are built automatically from the employee
        records HR already keeps, so there is nothing to enter here. Festivals and national days
        come from the company calendar.
      </p>
    </div>
  )
}

// One band of the page: a heading and its cards. An empty band says so in a
// single quiet line — a full panel for each of them turned a normal week into a
// page of boxes that all said the same thing.
function CelebrationSection({ title, range, events, today, emptyNote }) {
  return (
    <div className="celebration-section">
      <div className="section-head-row">
        <h3 className="section-title">
          {title}
          {range && <span className="celebration-range">{range}</span>}
        </h3>
        {events.length > 0 && <span className="muted small">{events.length}</span>}
      </div>

      {events.length === 0 ? (
        <p className="celebration-band-empty">{emptyNote}</p>
      ) : (
        <div className="celebration-grid">
          {events.map((ev) => (
            <CelebrationCard key={ev.id} event={ev} today={today} />
          ))}
        </div>
      )}
    </div>
  )
}

// Nothing at all inside the window. One composed panel that says what is
// missing, how wide the page looks, and - the part that turns a dead end into
// an answer - when the next occasion of this type falls.
function CelebrationEmptyTab({ tab, nextUp, today }) {
  const Icon = nextUp ? KIND_ICONS[nextUp.kind] || CalendarHeart : CalendarHeart
  const days = nextUp ? daysBetweenKeys(today, nextUp.date) : 0
  const name = nextUp ? nextUp.person?.name || nextUp.name : ''

  // The panel borrows the accent of whatever comes next, so the chip, the label
  // and the cards all speak the same colour language.
  return (
    <div className={`celebration-empty-card ${nextUp ? celebrationToneClass(nextUp.kind) : ''}`}>
      <span className="table-empty-icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <p className="celebration-empty-title">{tab.emptyTitle}</p>
      <p className="celebration-empty-text">
        This page covers {CELEBRATION_PAST_DAYS} days back and {CELEBRATION_FUTURE_DAYS} days ahead of today.
      </p>

      {nextUp ? (
        <div className="celebration-next">
          <span className="celebration-next-label">Next up</span>
          {nextUp.person ? (
            <Avatar src={nextUp.person.photoUrl} name={nextUp.person.name} size={28} />
          ) : (
            <span className="celebration-next-icon" aria-hidden="true">
              <Icon size={15} />
            </span>
          )}
          <span className="celebration-next-text">
            {/* The name is the whole point of the line, so it gets the title
                attribute the cards use too - long names clip, never wrap. */}
            <strong className="celebration-next-name" title={name}>{name}</strong>
            <span className="celebration-next-when">
              {celebrationKindLabel(nextUp.kind)} · {formatDate(nextUp.date)} · in {days} day{days === 1 ? '' : 's'}
            </span>
          </span>
        </div>
      ) : (
        <p className="celebration-empty-text">
          Nothing coming up in the next {CELEBRATION_LOOKAHEAD_DAYS} days either.
        </p>
      )}
    </div>
  )
}
