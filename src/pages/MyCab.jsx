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
  getTrips,
  getVehicles,
  setCabCancellation
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  driverById,
  formatDateTime,
  formatTime12,
  googleMapsUrl,
  isWithinDeadline,
  requestStatusLabel,
  requestStatusTagClass,
  tripById,
  vehicleById
} from '../utils/cab.js'

// Employee's "My Cab" page: see assigned pickup/drop details and raise
// temporary change requests.
export default function MyCab() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)

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
        <h2>My Cab</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Close' : 'Request temporary change'}
        </button>
      </div>

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
            Let the driver know in advance if you don&rsquo;t need a pickup or drop today.
            Toggle a button below and the driver&rsquo;s list will update automatically.
          </p>
          <div className="cab-cancellation-actions">
            <button
              id="btn-skip-pickup"
              className={`btn cab-cancel-btn ${skipPickup ? 'cab-cancel-btn-active' : 'btn-light'}`}
              onClick={() => toggleCancellation('pickup')}
            >
              {skipPickup ? '✓ Skipping pickup today' : 'Skip pickup today'}
            </button>
            <button
              id="btn-skip-drop"
              className={`btn cab-cancel-btn ${skipDrop ? 'cab-cancel-btn-active' : 'btn-light'}`}
              onClick={() => toggleCancellation('drop')}
            >
              {skipDrop ? '✓ Skipping drop today' : 'Skip drop today'}
            </button>
          </div>
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
          <div className="card cab-card">
            <h3 className="section-title first">Pickup (Home &rarr; Office)</h3>
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
          <div className="card cab-card">
            <h3 className="section-title first">Drop (Office &rarr; Home)</h3>
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

      {/* Temporary change request form - Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <RequestForm
              pickupTrip={pickupTrip}
              onSubmit={(data) => {
                createCabRequest({ ...data, employeeId: user.id })
                setShowForm(false)
                setRefresh((n) => n + 1)
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Past requests */}
      {requests.length > 0 && (
        <>
          <h3 className="section-title">My change requests</h3>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Date(s)</th>
                  <th>Changes</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin note</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
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
          </div>
        </>
      )}

      {/* Chat with transport desk */}
      <ChatSection
        messages={messages}
        onSend={(text) => {
          addCabMessage({ employeeId: user.id, byRole: 'employee', text })
          setRefresh((n) => n + 1)
        }}
      />
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
        <button type="button" className="btn btn-tiny btn-light" onClick={onCancel}>✕</button>
      </div>
      <form onSubmit={submit}>
        <p className="hint first">
          For 1 or 2 days only. Must be raised at least 5 hours before your pickup
          time ({formatTime12(pickupTrip?.time)}).
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
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
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
      <h3 className="section-title">Chat with transport desk</h3>
      <p className="hint first">
        Cab is late, driver isn&rsquo;t answering, or something else is wrong?
        Send a quick message instead of calling.
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
