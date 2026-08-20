import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addCabMessage,
  createCabRequest,
  getCabAssignmentForEmployee,
  getCabCancellationForEmployee,
  getCabMessagesForEmployee,
  getCabRequestsForEmployee,
  getDrivers,
  getProfileForEmployee,
  getSettings,
  getTrips,
  getVehicles,
  setCabCancellation
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import TimeInput from '../components/TimeInput.jsx'
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
import { CarFront, Check, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const TABS = ["Today's Cab", 'My Change Requests', 'Chat with Transport Desk']

// Employee's "My Cab" page: three tabs — today's cab reference with
// pickup/drop cards, change requests, and chat with the transport desk.
export default function MyCab() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState(0)

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
    initialSortDir: 'desc'
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
  const messages = useMemo(
    () => getCabMessagesForEmployee(user.id),
    [user.id, refresh]
  )

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
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${i === tab ? 'tab-active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
            {i === 1 && requests.length > 0 ? ` (${requests.length})` : ''}
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
              <div className="cab-cancellation-title">Today&rsquo;s cab preference</div>
              <p className="hint first">
                Let the driver know if you don&rsquo;t need a pickup or drop today.
                Toggle a button below and the driver&rsquo;s list updates automatically.
                Changes are locked {cutoffHours} hour{cutoffHours === 1 ? '' : 's'} before your shift
                starts (pickup) and ends (drop).
              </p>
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
              {(!pickupOpen || !dropOpen) && (
                <div className="cab-cancellation-notice">
                  {!pickupOpen && !dropOpen
                    ? `Today's changes are locked. Pickup closed at ${todayChangeDeadline(pickupTrip?.shiftStart, cutoffHours)} and drop closed at ${todayChangeDeadline(dropTrip?.shiftEnd, cutoffHours)}.`
                    : !pickupOpen
                    ? `Pickup changes for today are locked since ${todayChangeDeadline(pickupTrip?.shiftStart, cutoffHours)} (${cutoffHours} hours before shift start).`
                    : `Drop changes for today are locked since ${todayChangeDeadline(dropTrip?.shiftEnd, cutoffHours)} (${cutoffHours} hours before shift end).`}
                </div>
              )}
              {(skipPickup || skipDrop) && (
                <div className="cab-cancellation-notice">
                  {skipPickup && skipDrop
                    ? 'You have skipped both pickup and drop for today. The driver will not collect or drop you.'
                    : skipPickup
                    ? 'You have skipped pickup for today. The driver will not collect you this morning.'
                    : 'You have skipped drop for today. The driver will not drop you this evening.'}
                </div>
              )}
            </div>
          )}

          {assignment && (
            <div className="cab-grid">
              {/* Pickup card */}
              <div className={`card cab-card${skipPickup ? ' cab-card-skipped' : ''}`}>
                <h3 className="section-title first">
                  Pickup (Home &rarr; Office)
                  {skipPickup && <span className="tag tag-medium cab-skip-tag">Skipped today</span>}
                </h3>
                <div className="cab-detail"><span>Pickup time</span><strong>{formatTime12(pickupTrip?.time)}</strong></div>
                <div className="cab-detail"><span>Office starts</span><strong>{formatTime12(pickupTrip?.shiftStart)}</strong></div>
                <div className="cab-detail"><span>Vehicle</span><strong>{pickupVehicle?.number || '--'}</strong></div>
                <div className="cab-detail"><span>Driver</span><strong>{pickupDriver?.name || '--'}</strong></div>
                <div className="cab-detail"><span>Driver mobile</span><strong>{pickupDriver?.mobile ? <a href={`tel:${pickupDriver.mobile}`} className="phone-link">{pickupDriver.mobile}</a> : '--'}</strong></div>
                <div className="cab-detail"><span>Your address</span><strong>{homeAddress}</strong></div>
                <div className="cab-detail"><span>Your gate</span><strong>{homeGate}</strong></div>
                <div className="cab-detail">
                  <span>Pickup point</span>
                  <strong>
                    {pickupPoint
                      ? <a href={googleMapsUrl(pickupPoint)} target="_blank" rel="noreferrer">Open in Google Maps</a>
                      : 'Not set'}
                    <span className="tip" data-tip="To change this location, update it in My Details.">&#9432;</span>
                  </strong>
                </div>
                <div className="cab-detail cab-supervisor">
                  <span>Cab late / driver not answering? Call</span>
                  <strong>{pickupTrip?.supervisorName || '--'} {pickupTrip?.supervisorMobile ? <a href={`tel:${pickupTrip.supervisorMobile}`} className="phone-link">({pickupTrip.supervisorMobile})</a> : ''}</strong>
                </div>
              </div>

              {/* Drop card */}
              <div className={`card cab-card${skipDrop ? ' cab-card-skipped' : ''}`}>
                <h3 className="section-title first">
                  Drop (Office &rarr; Home)
                  {skipDrop && <span className="tag tag-medium cab-skip-tag">Skipped today</span>}
                </h3>
                <div className="cab-detail"><span>Office ends</span><strong>{formatTime12(dropTrip?.shiftEnd)}</strong></div>
                <div className="cab-detail"><span>Cab leaves office</span><strong>{formatTime12(dropTrip?.time)}</strong></div>
                <div className="cab-detail"><span>Vehicle</span><strong>{dropVehicle?.number || '--'}</strong></div>
                <div className="cab-detail"><span>Driver</span><strong>{dropDriver?.name || '--'}</strong></div>
                <div className="cab-detail"><span>Driver mobile</span><strong>{dropDriver?.mobile ? <a href={`tel:${dropDriver.mobile}`} className="phone-link">{dropDriver.mobile}</a> : '--'}</strong></div>
                <div className="cab-detail"><span>Drop address</span><strong>{homeAddress}</strong></div>
                <div className="cab-detail"><span>Office gate</span><strong>{dropTrip?.officeGate || '--'}</strong></div>
                <div className="cab-detail">
                  <span>Drop point</span>
                  <strong>
                    {dropPoint
                      ? <a href={googleMapsUrl(dropPoint)} target="_blank" rel="noreferrer">Open in Google Maps</a>
                      : 'Not set'}
                    <span className="tip" data-tip="To change this location, update it in My Details.">&#9432;</span>
                  </strong>
                </div>
                <div className="cab-detail cab-supervisor">
                  <span>Cab late / driver not answering? Call</span>
                  <strong>{dropTrip?.supervisorName || '--'} {dropTrip?.supervisorMobile ? <a href={`tel:${dropTrip.supervisorMobile}`} className="phone-link">({dropTrip.supervisorMobile})</a> : ''}</strong>
                </div>
              </div>
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
            actions={
              <button
                type="button"
                className="btn btn-primary btn-tiny"
                onClick={() => setShowForm(true)}
              >
                Request temporary change
              </button>
            }
          />
          <table className="table">
            <thead>
              <tr>
                <SortableTh label="Date(s)" keyName="dates" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <th>Changes</th>
                <SortableTh label="Reason" keyName="reason" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <SortableTh label="Status" keyName="status" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
                <SortableTh label="Admin note" keyName="adminNote" sortKey={requestsTable.sortKey} sortDir={requestsTable.sortDir} onSort={requestsTable.toggleSort} />
              </tr>
            </thead>
            <tbody>
              {requestsTable.count === 0 && (
                <TableEmpty
                  colSpan={5}
                  message={
                    requests.length === 0
                      ? 'No change requests yet. Use "Request temporary change" to raise one.'
                      : 'No requests match your search.'
                  }
                />
              )}
              {requestsPage.map((r) => (
                <tr key={r.id}>
                  <td>{r.forDates.map((d) => formatDate(d)).join(', ')}</td>
                  <td>
                    {r.newLocation && <div>Location: {r.newLocation}</div>}
                    {r.newGate && <div>Gate: {r.newGate}</div>}
                    {r.newTime && <div>Time: {formatTime12(r.newTime)}</div>}
                    {!r.newLocation && !r.newGate && !r.newTime && <span className="muted">--</span>}
                  </td>
                  <td>{r.reason}</td>
                  <td><span className={`tag ${requestStatusTagClass(r.status)}`}>{requestStatusLabel(r.status)}</span></td>
                  <td>{r.adminNote || <span className="muted">--</span>}</td>
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

      {tab === 2 && (
        <ChatSection
          messages={messages}
          onSend={(text) => {
            addCabMessage({ employeeId: user.id, byRole: 'employee', text })
            setRefresh((n) => n + 1)
          }}
        />
      )}

      <p className="hint">
        Today&rsquo;s Cab shows your pickup and drop details, including driver contact and vehicle
        number. Use Change Requests to ask for a temporary location or time change (valid for 1–2 days).
        Chat here if the cab is late or the driver isn&rsquo;t responding.
      </p>

      {/* Temporary change request form - Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Request a temporary change">
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
        </Modal>
      )}
    </div>
  )
}

// ---- Inline request form ----
function RequestForm({ pickupTrip, onSubmit, onCancel }) {
  const [forDate, setForDate] = useState('')
  const [forDate2, setForDate2] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newGate, setNewGate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!forDate) return setError('Please pick at least one date.')
    if (!newLocation && !newGate && !newTime) return setError('Please fill in at least one change (location, gate, or time).')
    if (!reason.trim()) return setError('Please give a short reason.')

    // 5-hour rule check
    if (pickupTrip && !isWithinDeadline(forDate, pickupTrip.time)) {
      return setError('Too late. Requests must be made at least 5 hours before pickup time.')
    }

    const forDates = [forDate]
    if (forDate2) forDates.push(forDate2)

    onSubmit({ forDates, newLocation, newGate, newTime, reason: reason.trim() })
  }

  return (
    <div className="modal-form">
      <div className="modal-header">
        <h3 className="section-title first">Request a temporary change</h3>
        <button type="button" className="btn btn-tiny btn-light" onClick={onCancel} aria-label="Close"><X size={15} /></button>
      </div>
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
        <button type="submit" className="btn btn-primary">Submit request</button>
        <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
      </div>
      </form>
    </div>
  )
}

// ---- Chat with the transport desk (one ongoing thread) ----
function ChatSection({ messages, onSend }) {
  const [text, setText] = useState('')

  function send(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <>
      <p className="hint first cab-chat-hint">
        Need help? If the cab is late, the driver isn&rsquo;t responding, or something else is wrong,
        send a message here instead of calling.
      </p>
      <div className="card">
        <div className="thread">
          {messages.length === 0 && (
            <p className="muted">No messages yet. Type below to start.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.byRole === 'employee' ? 'msg-mine' : 'msg-them'}`}>
              <div className="msg-head">
                <span className="msg-who">{m.byRole === 'employee' ? 'You' : 'Transport desk'}</span>
                <span>{formatDateTime(m.on)}</span>
              </div>
              <div className="msg-body">{m.text}</div>
            </div>
          ))}
        </div>
        <form className="reply-box" onSubmit={send}>
          <textarea
            className="reply-input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "Where is my cab?" or "Driver is not answering my call"'
          />
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send</button>
          </div>
        </form>
      </div>
    </>
  )
}
