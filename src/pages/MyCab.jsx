import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addCabMessage,
  clearCabChat,
  createCabRequest,
  getCabAssignmentForEmployee,
  getCabClearedAt,
  getCabCancellationForEmployee,
  getCabMessagesForEmployee,
  getCabRequestsForEmployee,
  getDrivers,
  getProfileForEmployee,
  getSettings,
  getTrips,
  getVehicles,
  setCabCancellation,
  updateCabRequest,
  withdrawCabRequest
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import TimeInput from '../components/TimeInput.jsx'
import Avatar from '../components/Avatar.jsx'
import {
  driverById,
  formatDateTime,
  formatTime12,
  googleMapsUrl,
  isWithinDeadline,
  isTodayChangeOpen,
  requestStatusLabel,
  requestStatusTagClass,
  todayChangeDeadline,
  tripById,
  vehicleById
} from '../utils/cab.js'
import {
  ArrowRight, CarFront, Check, Clock, DoorClosed, Eye,
  MapPin, MessageCircle, MoreVertical, Navigation, Pencil, Phone, Plus, Send,
  Settings2, Sunrise, Sunset, Trash2, Undo2, User, X
} from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const TABS = ["Today's Cab", 'My Change Requests']
const TAB_SLUGS = ['today', 'change-requests']

const REQUEST_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]

function requestChangeSummary(r) {
  const parts = []
  if (r.newLocation) parts.push(`Location: ${r.newLocation}`)
  if (r.newGate) parts.push(`Gate: ${r.newGate}`)
  if (r.newTime) parts.push(`Time: ${formatTime12(r.newTime)}`)
  return parts
}

// Employee's "My Cab" page: two tabs — today's cab reference with
// pickup/drop cards, and change requests. Chat with the transport desk
// opens as a slide-over from the Today's Cab tab (same pattern as My Team).
export default function MyCab() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState(Math.max(0, TAB_SLUGS.indexOf(tabParam)))
  const [chatOpen, setChatOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openRequestId, setOpenRequestId] = useState(null)
  const [editRequestId, setEditRequestId] = useState(null)
  const [withdrawRequestId, setWithdrawRequestId] = useState(null)

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }
  function closeMenu() {
    setOpenMenuId(null)
  }

  function handleOpenRequest(id) {
    setOpenRequestId(id)
    closeMenu()
  }

  function handleEditRequest(id) {
    setEditRequestId(id)
    closeMenu()
  }

  function handleWithdrawRequest(id) {
    setWithdrawRequestId(id)
    closeMenu()
  }

  function confirmWithdraw() {
    if (withdrawRequestId) {
      withdrawCabRequest(withdrawRequestId)
      setRefresh((n) => n + 1)
      if (openRequestId === withdrawRequestId) setOpenRequestId(null)
      if (editRequestId === withdrawRequestId) setEditRequestId(null)
      setWithdrawRequestId(null)
    }
  }

  function cancelWithdraw() {
    setWithdrawRequestId(null)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  // React to URL tab changes (e.g. opening a "Cab change approved" notification
  // while already on My Cab) so the right tab is selected.
  const prevTabParam = useRef(tabParam)
  useEffect(() => {
    if (tabParam !== prevTabParam.current) {
      setTab(Math.max(0, TAB_SLUGS.indexOf(tabParam)))
      prevTabParam.current = tabParam
    }
  }, [tabParam])

  function selectTab(i) {
    setTab(i)
    setSearchParams({ tab: TAB_SLUGS[i] }, { replace: true })
  }

  // Today's date key, e.g. "2026-08-05"
  const todayKey = new Date().toISOString().slice(0, 10)

  const vehicles = useMemo(() => getVehicles(), [refresh])
  const drivers = useMemo(() => getDrivers(), [refresh])
  const trips = useMemo(() => getTrips(), [refresh])

  const assignment = useMemo(
    () => getCabAssignmentForEmployee(user.id),
    [user.id, refresh]
  )
  const profile = useMemo(() => getProfileForEmployee(user.id), [user.id, refresh])
  const requests = useMemo(
    () => getCabRequestsForEmployee(user.id),
    [user.id, refresh]
  )
  const openRequest = requests.find((r) => r.id === openRequestId) || null
  const editRequest = requests.find((r) => r.id === editRequestId) || null

  const requestsTable = useTableControls(requests, {
    getSearchText: (r) =>
      [
        r.forDates.join(' '), r.newLocation, r.newGate, r.newTime,
        r.reason, requestStatusLabel(r.status), r.adminNote
      ].join(' '),
    getSortValue: (r, key) => {
      if (key === 'dates') return r.forDates[0] || ''
      if (key === 'status') return r.status
      return r[key]
    },
    initialSortKey: 'dates',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => r.status === val
    }
  })
  const {
    items: requestsPage,
    page: requestsPageNum,
    totalPages: requestsTotalPages,
    total: requestsTotal,
    startIndex: requestsStart,
    endIndex: requestsEnd,
    setPage: setRequestsPage
  } = usePagination(requestsTable.rows)
  const messages = useMemo(() => {
    const clearedAt = getCabClearedAt(user.id)
    return getCabMessagesForEmployee(user.id).filter(
      (m) => !clearedAt || m.on > clearedAt
    )
  }, [user.id, refresh])

  // Today's cancellation preference for this employee
  const cancellation = useMemo(
    () => getCabCancellationForEmployee(user.id, todayKey),
    [user.id, refresh]
  )
  const skipPickup = cancellation?.skipPickup || false
  const skipDrop   = cancellation?.skipDrop   || false

  function toggleCancellation(field) {
    const newSkipPickup = field === 'pickup' ? !skipPickup : skipPickup
    const newSkipDrop   = field === 'drop'   ? !skipDrop   : skipDrop
    setCabCancellation(user.id, todayKey, newSkipPickup, newSkipDrop)
    setRefresh((n) => n + 1)
  }

  const pickupTrip = assignment ? tripById(trips, assignment.pickupTripId) : null
  const dropTrip = assignment ? tripById(trips, assignment.dropTripId) : null

  // Today-change cutoff from Settings: pickup changes lock `cutoffHours`
  // before shift start, drop changes lock before shift end.
  const settings = getSettings()
  const cutoffHours = settings.cabTodayCutoffHours ?? 3
  const pickupOpen = isTodayChangeOpen(pickupTrip?.shiftStart, cutoffHours)
  const dropOpen = isTodayChangeOpen(dropTrip?.shiftEnd, cutoffHours)

  const pickupVehicle = pickupTrip ? vehicleById(vehicles, pickupTrip.vehicleId) : null
  const pickupDriver = pickupTrip ? driverById(drivers, pickupTrip.driverId) : null
  const dropVehicle = dropTrip ? vehicleById(vehicles, dropTrip.vehicleId) : null
  const dropDriver = dropTrip ? driverById(drivers, dropTrip.driverId) : null

  const homeAddress = profile.personal.address || '--'
  const homeGate = profile.personal.homeGate || '--'

  // Map points the employee saved in My Details (used by the driver to navigate).
  const pickupPoint = profile.personal.pickupPoint
  const dropPoint =
    profile.personal.dropSameAsPickup !== false ? pickupPoint : profile.personal.dropPoint

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <CarFront size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Cab
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Track your cab assignment, pickup and drop preferences</p>
        </div>
        <button
          type="button"
          className="btn btn-light cab-chat-open-btn"
          onClick={() => setChatOpen(true)}
        >
          <MessageCircle size={15} aria-hidden="true" />
          Chat with Transport Desk
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${i === tab ? 'tab-active' : ''}`}
            onClick={() => selectTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          {!assignment && (
            <div className="info-box first">
              You have not been assigned a cab yet. Please check with HR.
            </div>
          )}

          {/* Today's cancellation panel — only shown when a cab is assigned */}
          {assignment && (
            <div className="cab-cancellation-panel">
              <div className="cab-pref-main">
                <div className="cab-pref-heading">
                  <span className="stat-chip"><Settings2 size={16} /></span>
                  <div>
                    <div className="cab-cancellation-title">Today&rsquo;s cab preference</div>
                    <p className="hint" style={{ margin: '2px 0 0' }}>
                      Let the driver know if you don&rsquo;t need a pickup or drop today — the driver&rsquo;s list updates automatically.
                    </p>
                  </div>
                </div>
                <div className="cab-cancellation-actions">
                  <button
                    id="btn-skip-pickup"
                    className={`btn cab-cancel-btn ${skipPickup ? 'cab-cancel-btn-active' : 'btn-light'}`}
                    aria-pressed={skipPickup}
                    disabled={!pickupOpen}
                    onClick={() => toggleCancellation('pickup')}
                  >
                    {skipPickup ? (<><Check size={14} /> Skipping pickup today</>) : 'Skip pickup today'}
                  </button>
                  <button
                    id="btn-skip-drop"
                    className={`btn cab-cancel-btn ${skipDrop ? 'cab-cancel-btn-active' : 'btn-light'}`}
                    aria-pressed={skipDrop}
                    disabled={!dropOpen}
                    onClick={() => toggleCancellation('drop')}
                  >
                    {skipDrop ? (<><Check size={14} /> Skipping drop today</>) : 'Skip drop today'}
                  </button>
                </div>
              </div>
              <div className="cab-pref-lock">
                <Clock size={13} aria-hidden="true" />
                <span>Changes lock {cutoffHours} hour{cutoffHours === 1 ? '' : 's'} before your shift starts (pickup) and ends (drop).</span>
              </div>
              {(!pickupOpen || !dropOpen || skipPickup || skipDrop) && (
                <div className="cab-cancellation-notice">
                  {(() => {
                    const parts = []
                    if (!pickupOpen && !dropOpen) {
                      parts.push(`Today's changes are locked. Pickup closed at ${todayChangeDeadline(pickupTrip?.shiftStart, cutoffHours)} and drop closed at ${todayChangeDeadline(dropTrip?.shiftEnd, cutoffHours)}.`)
                    } else if (!pickupOpen) {
                      parts.push(`Pickup changes for today are locked since ${todayChangeDeadline(pickupTrip?.shiftStart, cutoffHours)} (${cutoffHours} hours before shift start).`)
                    } else if (!dropOpen) {
                      parts.push(`Drop changes for today are locked since ${todayChangeDeadline(dropTrip?.shiftEnd, cutoffHours)} (${cutoffHours} hours before shift end).`)
                    }
                    if (skipPickup && skipDrop) {
                      parts.push('You have skipped both pickup and drop for today. The driver will not collect or drop you.')
                    } else if (skipPickup) {
                      parts.push('You have skipped pickup for today. The driver will not collect you this morning.')
                    } else if (skipDrop) {
                      parts.push('You have skipped drop for today. The driver will not drop you this evening.')
                    }
                    return parts.join(' ')
                  })()}
                </div>
              )}
            </div>
          )}

          {assignment && (
            <div className="cab-grid">
              {/* Pickup card */}
              <CabLegCard
                kind="pickup"
                skipped={skipPickup}
                heroLabel="Pickup time"
                heroTime={pickupTrip?.time}
                heroSub={pickupTrip?.shiftStart ? `Office starts at ${formatTime12(pickupTrip.shiftStart)}` : null}
                rows={[
                  { icon: CarFront, label: 'Vehicle', value: pickupVehicle?.number || '--' },
                  { icon: User, label: 'Driver', avatar: pickupDriver?.name, value: pickupDriver?.name || '--' },
                  { icon: Phone, label: 'Driver mobile', value: pickupDriver?.mobile ? <a href={`tel:${pickupDriver.mobile}`} className="phone-link">{pickupDriver.mobile}</a> : '--' },
                  { icon: MapPin, label: 'Your address', value: homeAddress },
                  { icon: DoorClosed, label: 'Your gate', value: homeGate },
                  { icon: Navigation, label: 'Pickup point',
                    value: pickupPoint
                      ? <a href={googleMapsUrl(pickupPoint)} target="_blank" rel="noreferrer" title="Open in Google Maps">Open in Google Maps</a>
                      : <span className="muted">Not set</span> },
                ]}
                supervisor={{ name: pickupTrip?.supervisorName, mobile: pickupTrip?.supervisorMobile }}
              />

              {/* Drop card */}
              <CabLegCard
                kind="drop"
                skipped={skipDrop}
                heroLabel="Cab leaves office"
                heroTime={dropTrip?.time}
                heroSub={dropTrip?.shiftEnd ? `Office ends at ${formatTime12(dropTrip.shiftEnd)}` : null}
                rows={[
                  { icon: CarFront, label: 'Vehicle', value: dropVehicle?.number || '--' },
                  { icon: User, label: 'Driver', avatar: dropDriver?.name, value: dropDriver?.name || '--' },
                  { icon: Phone, label: 'Driver mobile', value: dropDriver?.mobile ? <a href={`tel:${dropDriver.mobile}`} className="phone-link">{dropDriver.mobile}</a> : '--' },
                  { icon: MapPin, label: 'Drop address', value: homeAddress },
                  { icon: DoorClosed, label: 'Office gate', value: dropTrip?.officeGate || '--' },
                  { icon: Navigation, label: 'Drop point',
                    value: dropPoint
                      ? <a href={googleMapsUrl(dropPoint)} target="_blank" rel="noreferrer" title="Open in Google Maps">Open in Google Maps</a>
                      : <span className="muted">Not set</span> },
                ]}
                supervisor={{ name: dropTrip?.supervisorName, mobile: dropTrip?.supervisorMobile }}
              />
            </div>
          )}
        </>
      )}

      {tab === 1 && (
        <div className="card">
          <TableToolbar
            search={requestsTable.search}
            onSearchChange={requestsTable.setSearch}
            placeholder="Search requests..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: requestsTable.filters.status || 'all',
                options: REQUEST_STATUS_FILTER_OPTS
              }
            ]}
            onFilterChange={requestsTable.setFilter}
            actions={
              <button
                type="button"
                className="btn btn-primary btn-tiny"
                onClick={() => setShowForm(true)}
              >
                <Plus size={14} style={{ marginRight: 4 }} aria-hidden="true" />Request temporary change
              </button>
            }
          />
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '21%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr>
                <SortableTh label="Date(s)" keyName="dates" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <th>Changes</th>
                <SortableTh label="Reason" keyName="reason" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <SortableTh label="Status" keyName="status" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <SortableTh label="Admin note" keyName="adminNote" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requestsTable.count === 0 && (
                <TableEmpty
                  colSpan={6}
                  message={
                    requests.length === 0
                      ? 'No change requests yet. Use "Request temporary change" to raise one.'
                      : 'No requests match your search.'
                  }
                />
              )}
              {requestsPage.map((r) => (
                <tr key={r.id}>
                  <td className="cell-ellipsis" title={r.forDates.map((d) => formatDate(d)).join(', ')}>{r.forDates.map((d) => formatDate(d)).join(', ')}</td>
                  <td className="cell-ellipsis" title={requestChangeSummary(r).join(' — ')}>
                    {requestChangeSummary(r).length > 0
                      ? requestChangeSummary(r).join(' · ')
                      : <span className="muted">--</span>}
                  </td>
                  <td className="cell-ellipsis" title={r.reason || undefined}>{r.reason}</td>
                  <td><span className={`tag ${requestStatusTagClass(r.status)}`}>{requestStatusLabel(r.status)}</span></td>
                  <td className="cell-ellipsis" title={r.adminNote || undefined}>{r.adminNote || <span className="muted">--</span>}</td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(r.id)}
                        aria-label="Request actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === r.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => handleOpenRequest(r.id)}
                          >
                            <Eye size={14} aria-hidden="true" />
                            Open
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={r.status !== 'pending'}
                            onClick={() => handleEditRequest(r.id)}
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={r.status !== 'pending'}
                            onClick={() => handleWithdrawRequest(r.id)}
                          >
                            <Undo2 size={14} aria-hidden="true" />
                            Withdraw
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={requestsPageNum}
            totalPages={requestsTotalPages}
            total={requestsTotal}
            startIndex={requestsStart}
            endIndex={requestsEnd}
            onPageChange={setRequestsPage}
          />
        </div>
      )}

      {chatOpen && (
        <div className="team-chat-overlay" onClick={() => setChatOpen(false)}>
          <div className="team-chat-slide" onClick={(e) => e.stopPropagation()}>
            <ChatSection
              messages={messages}
              onSend={(text) => {
                addCabMessage({ employeeId: user.id, byRole: 'employee', text })
                setRefresh((n) => n + 1)
              }}
              onClear={() => {
                clearCabChat(user.id)
                setRefresh((n) => n + 1)
              }}
            />
          </div>
        </div>
      )}

      {/* Open request detail modal */}
      {openRequest && (
        <Modal onClose={() => setOpenRequestId(null)} title="Change request">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  Change request
                </h3>
                <div className="muted small">
                  {openRequest.forDates.map((d) => formatDate(d)).join(', ')}
                  {' · '}
                  <span className={`tag ${requestStatusTagClass(openRequest.status)}`}>
                    {requestStatusLabel(openRequest.status)}
                  </span>
                </div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setOpenRequestId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>
              {requestChangeSummary(openRequest).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
              {requestChangeSummary(openRequest).length === 0 && <li className="muted">No changes specified</li>}
            </ul>
            {openRequest.reason && (
              <p className="hint"><strong>Reason:</strong> {openRequest.reason}</p>
            )}
            {openRequest.adminNote && (
              <p className="hint"><strong>Admin note:</strong> {openRequest.adminNote}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Edit request modal */}
      {editRequest && (
        <Modal onClose={() => setEditRequestId(null)} title="Edit change request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit change request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditRequestId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You can update this request while it is still pending.
            </p>
            <RequestForm
              key={editRequest.id}
              pickupTrip={pickupTrip}
              initial={editRequest}
              onSubmit={(data) => {
                updateCabRequest(editRequest.id, data)
                setEditRequestId(null)
                setRefresh((n) => n + 1)
              }}
              onCancel={() => setEditRequestId(null)}
            />
          </div>
        </Modal>
      )}

      {/* Withdraw confirmation modal */}
      {withdrawRequestId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will withdraw your change request. It stays in your list marked
              &ldquo;Withdrawn&rdquo; for your records, but the transport desk will no longer act on
              it. This cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmWithdraw}>
                Withdraw
              </button>
              <button type="button" className="btn btn-light" onClick={cancelWithdraw}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Today&rsquo;s Cab shows your pickup and drop details, including driver contact and vehicle
        number. Use Change Requests to ask for a temporary location or time change (valid for 1–2 days).
        If the cab is late or the driver isn&rsquo;t responding, use &ldquo;Chat with Transport Desk&rdquo; above to message us.
      </p>

      {/* Temporary change request form - Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Request a temporary change">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Request a temporary change</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowForm(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <RequestForm
              pickupTrip={pickupTrip}
              onSubmit={(data) => {
                createCabRequest({ ...data, employeeId: user.id })
                setShowForm(false)
                setTab(1)
                setRefresh((n) => n + 1)
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- One leg (pickup or drop) of today's cab, as a run-sheet style card ----
// `kind` drives the semantic accent: pickup = amber (morning), drop = blue
// (evening) — the same pairing the driver run sheet uses.
function CabLegCard({ kind, skipped, heroLabel, heroTime, heroSub, rows, supervisor }) {
  const time = formatTime12(heroTime);
  const [clock, ampm] = time.split(' ');
  const route = kind === 'pickup' ? (
    <>Home <ArrowRight size={13} className="cab-route-arrow" aria-hidden="true" /> Office</>
  ) : (
    <>Office <ArrowRight size={13} className="cab-route-arrow" aria-hidden="true" /> Home</>
  );
  const Icon = kind === 'pickup' ? Sunrise : Sunset;
  return (
    <div className={`card cab-card cab-card-${kind}${skipped ? ' cab-card-skipped' : ''}`}>
      <div className="cab-card-head">
        <span className="cab-card-chip"><Icon size={16} /></span>
        <div className="cab-card-head-text">
          <div className="cab-card-title">
            {kind === 'pickup' ? 'Pickup' : 'Drop'}
            {skipped && <span className="tag tag-medium cab-skip-tag">Skipped today</span>}
          </div>
          <div className="cab-card-route">{route}</div>
        </div>
      </div>
      <div className="cab-hero">
        <div className="cab-hero-label">{heroLabel}</div>
        <div className="cab-hero-time">
          {time === '--' ? <span>--</span> : <>{clock}<span className="cab-hero-ampm">{ampm}</span></>}
        </div>
        {heroSub && <div className="cab-hero-sub">{heroSub}</div>}
      </div>
      <div className="cab-rows">
        {rows.map((row, i) => {
          const RowIcon = row.icon;
          return (
            <div className="cab-row" key={i}>
              <span className="cab-row-label"><RowIcon size={14} aria-hidden="true" />{row.label}</span>
              <strong className="cab-row-value">
                {row.avatar && <Avatar name={row.avatar} size={24} />}
                {row.value}
              </strong>
            </div>
          );
        })}
      </div>
      <div className="cab-supervisor">
        <span className="cab-supervisor-ask"><Phone size={14} aria-hidden="true" />Cab late or driver not answering? Call</span>
        <span className="cab-supervisor-person">
          <span>{supervisor?.name || '--'}</span>
          {supervisor?.mobile && <a href={`tel:${supervisor.mobile}`} className="phone-link">({supervisor.mobile})</a>}
        </span>
      </div>
    </div>
  );
}

// ---- Inline request form ----
function RequestForm({ pickupTrip, onSubmit, onCancel, initial }) {
  const [forDate, setForDate] = useState(initial?.forDates?.[0] || '')
  const [forDate2, setForDate2] = useState(initial?.forDates?.[1] || '')
  const [newLocation, setNewLocation] = useState(initial?.newLocation || '')
  const [newGate, setNewGate] = useState(initial?.newGate || '')
  const [newTime, setNewTime] = useState(initial?.newTime || '')
  const [reason, setReason] = useState(initial?.reason || '')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!forDate) return setError('Please pick at least one date.')
    if (!newLocation && !newGate && !newTime) return setError('Please fill in at least one change (location, gate, or time).')
    if (!reason.trim()) return setError('Please give a short reason.')

    // 5-hour rule check (skip if date unchanged during edit)
    if (pickupTrip && !isWithinDeadline(forDate, pickupTrip.time) && (!initial || initial.forDates?.[0] !== forDate)) {
      return setError('Too late. Requests must be made at least 5 hours before pickup time.')
    }

    const forDates = [forDate]
    if (forDate2) forDates.push(forDate2)

    onSubmit({ forDates, newLocation, newGate, newTime, reason: reason.trim() })
  }

  return (
    <form onSubmit={submit}>
      <p className="hint first">
        Valid for 1 or 2 days only. Must be submitted at least 5 hours before your scheduled
        pickup time ({formatTime12(pickupTrip?.time)}).
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Date (day 1) *</span>
          <input type="date" value={forDate} onChange={(e) => setForDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Date (day 2, optional)</span>
          <input type="date" value={forDate2} onChange={(e) => setForDate2(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>New pickup location (if different)</span>
        <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Full address for those days" />
      </label>

      <div className="two-col">
        <label className="field">
          <span>New gate no. (if different)</span>
          <input value={newGate} onChange={(e) => setNewGate(e.target.value)} placeholder="e.g. Gate 5" />
        </label>
        <label className="field">
          <span>New pickup time (if different)</span>
          <TimeInput value={newTime} onChange={(e) => setNewTime(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Reason *</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Staying at a relative's place" />
      </label>

      <div className="button-row">
        <button type="submit" className="btn btn-primary">{initial ? 'Save changes' : 'Submit request'}</button>
        <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ---- Chat with the transport desk (one ongoing thread, slide-over panel) ----
function ChatSection({ messages, onSend, onClear }) {
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const threadRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to the bottom when new messages arrive.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  // Close the three-dot menu when clicking outside.
  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e) {
      if (!e.target.closest('.team-chat-menu-container')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  function send() {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.focus()
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleClearChat() {
    onClear()
    setMenuOpen(false)
    setConfirmClear(false)
  }

  return (
    <>
      <div className="team-chat-panel">
        <div className="team-chat-header">
          <div className="team-chat-peer">
            <Avatar name="Transport Desk" size={32} />
            <div>
              <div className="team-chat-peer-name">Transport Desk</div>
              <div className="team-chat-peer-role muted small">Cab support team</div>
            </div>
          </div>
          <div className="team-chat-header-actions">
            <div className="task-menu-container team-chat-menu-container">
              <button
                type="button"
                className="btn btn-tiny btn-light task-menu-button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Chat options"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="task-menu-dropdown">
                  <button
                    type="button"
                    className="task-menu-item task-menu-item-danger"
                    onClick={() => { setMenuOpen(false); setConfirmClear(true) }}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Clear chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="team-chat-thread" ref={threadRef}>
        {messages.length === 0 && (
          <p className="muted team-chat-empty">
            No messages yet. Ask about your cab, driver, or any issue.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.byRole === 'employee'
          return (
            <div key={m.id} className={`msg ${mine ? 'msg-mine' : 'msg-them'}`}>
              {m.text && <div className="msg-body">{m.text}</div>}
              <div className="msg-time">{formatDateTime(m.on)}</div>
            </div>
          )
        })}
      </div>

      <div className="team-chat-reply">
        <div className="team-chat-composer">
          <textarea
            ref={inputRef}
            className="team-chat-composer-input"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
          />
          <div className="team-chat-composer-actions">
            <button
              type="button"
              className={`team-chat-composer-send ${text.trim() ? 'active' : ''}`}
              disabled={!text.trim()}
              onClick={send}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      </div>

      {confirmClear && (
        <Modal onClose={() => setConfirmClear(false)} title="Clear chat">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first" style={{ margin: 0 }}>Clear chat</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmClear(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will clear the conversation from your side only. The transport
              desk keeps their copy of the messages.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleClearChat}>
                Clear chat
              </button>
              <button type="button" className="btn btn-light" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
