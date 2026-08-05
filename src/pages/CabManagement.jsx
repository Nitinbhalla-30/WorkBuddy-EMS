import { useMemo, useState } from 'react'
import {
  addCabMessage,
  addDriver,
  addTrip,
  addVehicle,
  deleteDriver,
  deleteTrip,
  deleteVehicle,
  getCabAssignments,
  getCabCancellationsForDate,
  getCabMessagesForEmployee,
  getCabRequests,
  getCabUnreadByEmployee,
  getDrivers,
  getEmployees,
  getTrips,
  getVehicles,
  markCabThreadRead,
  setCabAssignment,
  setCabRequestStatus,
  setDriverPin
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  driverById,
  formatDateTime,
  formatTime12,
  requestStatusLabel,
  requestStatusTagClass,
  tripLabel,
  vehicleById
} from '../utils/cab.js'

const TABS = ['Vehicles', 'Drivers', 'Trips', 'Assign', 'Requests', 'Messages', 'Today']

// Admin page to manage the company cab system.
export default function CabManagement() {
  const [tab, setTab] = useState(0)
  const [refresh, setRefresh] = useState(0)

  const vehicles = useMemo(() => getVehicles(), [refresh])
  const drivers = useMemo(() => getDrivers(), [refresh])
  const trips = useMemo(() => getTrips(), [refresh])
  const assignments = useMemo(() => getCabAssignments(), [refresh])
  const requests = useMemo(() => getCabRequests(), [refresh])
  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    [refresh]
  )
  const unreadByEmp = useMemo(() => getCabUnreadByEmployee(), [refresh])
  const totalUnread = Object.values(unreadByEmp).reduce((a, b) => a + b, 0)

  function bump() { setRefresh((n) => n + 1) }

  function nameOf(id) {
    return getEmployees().find((e) => e.id === id)?.name || id
  }

  return (
    <div>
      <div className="page-head">
        <h2>Cab Management</h2>
        <span className="muted">{vehicles.length} vehicles, {drivers.length} drivers, {trips.length} trips</span>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`tab ${i === tab ? 'tab-active' : ''}`} onClick={() => setTab(i)}>
            {t}
            {t === 'Requests' ? ` (${requests.filter((r) => r.status === 'pending').length})` : ''}
            {t === 'Messages' && totalUnread > 0 ? ` (${totalUnread})` : ''}
          </button>
        ))}
      </div>

      {tab === 0 && <VehiclesTab vehicles={vehicles} bump={bump} />}
      {tab === 1 && <DriversTab drivers={drivers} bump={bump} />}
      {tab === 2 && <TripsTab trips={trips} vehicles={vehicles} drivers={drivers} bump={bump} />}
      {tab === 3 && <AssignTab employees={employees} trips={trips} assignments={assignments} bump={bump} />}
      {tab === 4 && <RequestsTab requests={requests} nameOf={nameOf} bump={bump} />}
      {tab === 5 && <MessagesTab employees={employees} unreadByEmp={unreadByEmp} bump={bump} />}
      {tab === 6 && <TodayTab employees={employees} bump={bump} />}
    </div>
  )
}

// ---- Vehicles ----
function VehiclesTab({ vehicles, bump }) {
  const [number, setNumber] = useState('')
  const [label, setLabel] = useState('')

  function add() {
    if (!number.trim()) return
    addVehicle({ number: number.trim(), label: label.trim() })
    setNumber(''); setLabel(''); bump()
  }

  return (
    <div className="card">
      <h3 className="section-title first">Company vehicles</h3>
      <table className="table">
        <thead><tr><th>Vehicle No.</th><th>Label</th><th></th></tr></thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td><strong>{v.number}</strong></td>
              <td>{v.label || <span className="muted">--</span>}</td>
              <td><button className="btn btn-tiny btn-danger" onClick={() => { deleteVehicle(v.id); bump() }}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-row">
        <input className="inline-input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Vehicle no." />
        <input className="inline-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Sedan / White)" />
        <button className="btn btn-primary btn-tiny" onClick={add}>Add</button>
      </div>
    </div>
  )
}

// ---- Drivers ----
function DriversTab({ drivers, bump }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [newPin, setNewPin] = useState('')
  // Per-driver inline PIN editing state: { [driverId]: value }
  const [pins, setPins] = useState({})
  const [pinSaved, setPinSaved] = useState({})

  function add() {
    if (!name.trim()) return
    addDriver({ name: name.trim(), mobile: mobile.trim(), pin: newPin.trim() })
    setName(''); setMobile(''); setNewPin(''); bump()
  }

  function savePin(driverId) {
    const pin = (pins[driverId] || '').trim()
    if (!pin) return
    setDriverPin(driverId, pin)
    setPinSaved({ ...pinSaved, [driverId]: true })
    setTimeout(() => setPinSaved((s) => ({ ...s, [driverId]: false })), 2000)
    bump()
  }

  return (
    <div className="card">
      <h3 className="section-title first">Company drivers</h3>
      <p className="hint first">
        Each driver needs a <strong>WorkBuddy ID</strong> and <strong>PIN</strong> to log in and
        view their run sheet. Set or change a driver&rsquo;s PIN in the table below.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>WorkBuddy ID</th>
            <th>PIN</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td><strong>{d.name}</strong></td>
              <td>{d.mobile}</td>
              <td><code>{d.id}</code></td>
              <td>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="inline-input"
                    style={{ width: 80 }}
                    type="password"
                    placeholder={d.pin ? '••••' : 'Set PIN'}
                    value={pins[d.id] || ''}
                    onChange={(e) => setPins({ ...pins, [d.id]: e.target.value })}
                    maxLength={8}
                  />
                  <button
                    className="btn btn-primary btn-tiny"
                    onClick={() => savePin(d.id)}
                    disabled={!(pins[d.id] || '').trim()}
                  >
                    {pinSaved[d.id] ? '✓ Saved' : 'Save PIN'}
                  </button>
                </div>
              </td>
              <td>
                <button className="btn btn-tiny btn-danger" onClick={() => { deleteDriver(d.id); bump() }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="sub-title" style={{ marginTop: '1.5rem' }}>Add a driver</h4>
      <div className="button-row">
        <input className="inline-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Driver name" />
        <input className="inline-input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" maxLength={10} />
        <input className="inline-input" style={{ width: 80 }} value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="PIN" maxLength={8} />
        <button className="btn btn-primary btn-tiny" onClick={add}>Add</button>
      </div>
    </div>
  )
}

// ---- Trips ----
function TripsTab({ trips, vehicles, drivers, bump }) {
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [direction, setDirection] = useState('pickup')
  const [time, setTime] = useState('')
  const [shiftStart, setShiftStart] = useState('')
  const [shiftEnd, setShiftEnd] = useState('')
  const [officeGate, setOfficeGate] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [supervisorMobile, setSupervisorMobile] = useState('')

  function add() {
    if (!vehicleId || !driverId || !time) return
    addTrip({
      vehicleId, driverId, direction, time,
      officeGate: direction === 'drop' ? officeGate : '',
      supervisorName, supervisorMobile,
      shiftStart: direction === 'pickup' ? shiftStart : '',
      shiftEnd: direction === 'drop' ? shiftEnd : ''
    })
    setVehicleId(''); setDriverId(''); setTime(''); setOfficeGate('')
    setShiftStart(''); setShiftEnd('')
    setSupervisorName(''); setSupervisorMobile(''); bump()
  }

  return (
    <div className="card">
      <h3 className="section-title first">Cab trips</h3>
      <table className="table">
        <thead><tr><th>Direction</th><th>Cab time</th><th>Office time</th><th>Vehicle</th><th>Driver</th><th>Office Gate</th><th>Supervisor</th><th></th></tr></thead>
        <tbody>
          {trips.map((t) => {
            const v = vehicleById(vehicles, t.vehicleId)
            const d = driverById(drivers, t.driverId)
            return (
              <tr key={t.id}>
                <td>{t.direction === 'drop' ? 'Drop' : 'Pickup'}</td>
                <td><strong>{formatTime12(t.time)}</strong></td>
                <td>
                  {t.direction === 'drop'
                    ? (t.shiftEnd ? <>Ends {formatTime12(t.shiftEnd)}</> : <span className="muted">--</span>)
                    : (t.shiftStart ? <>Starts {formatTime12(t.shiftStart)}</> : <span className="muted">--</span>)}
                </td>
                <td>{v?.number || '--'}</td>
                <td>{d?.name || '--'} ({d?.mobile || '--'})</td>
                <td>{t.officeGate || <span className="muted">--</span>}</td>
                <td>
                  {t.supervisorName
                    ? <>{t.supervisorName}<div className="muted small">{t.supervisorMobile}</div></>
                    : <span className="muted">--</span>}
                </td>
                <td><button className="btn btn-tiny btn-danger" onClick={() => { deleteTrip(t.id); bump() }}>Remove</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h4 className="sub-title">Add a trip</h4>
      <div className="two-col">
        <label className="field">
          <span>Vehicle</span>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">-- choose --</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.number}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Driver</span>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">-- choose --</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </div>
      <div className="two-col">
        <label className="field">
          <span>Direction</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="pickup">Pickup (home to office)</option>
            <option value="drop">Drop (office to home)</option>
          </select>
        </label>
        <label className="field">
          <span>{direction === 'drop' ? 'Cab leaves office time' : 'Pickup time'}</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <div className="two-col">
        {direction === 'pickup' ? (
          <label className="field">
            <span>Office starts at</span>
            <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} />
          </label>
        ) : (
          <label className="field">
            <span>Office ends at</span>
            <input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} />
          </label>
        )}
        <div />
      </div>
      {direction === 'drop' && (
        <label className="field">
          <span>Office gate (where cab waits)</span>
          <input value={officeGate} onChange={(e) => setOfficeGate(e.target.value)} placeholder="e.g. Gate 2" />
        </label>
      )}
      <div className="two-col">
        <label className="field">
          <span>Supervisor name (to call if cab is late)</span>
          <input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="e.g. Anil Singh" />
        </label>
        <label className="field">
          <span>Supervisor mobile</span>
          <input value={supervisorMobile} onChange={(e) => setSupervisorMobile(e.target.value)} placeholder="10-digit mobile" maxLength={10} />
        </label>
      </div>
      <div className="button-row">
        <button className="btn btn-primary" onClick={add}>Add trip</button>
      </div>
    </div>
  )
}

// ---- Assign employees ----
function AssignTab({ employees, trips, assignments, bump }) {
  const pickupTrips = trips.filter((t) => t.direction === 'pickup')
  const dropTrips = trips.filter((t) => t.direction === 'drop')

  function assignedTo(empId) {
    return assignments.find((a) => a.employeeId === empId) || { pickupTripId: '', dropTripId: '' }
  }

  function save(empId, pickupTripId, dropTripId) {
    setCabAssignment(empId, pickupTripId, dropTripId)
    bump()
  }

  return (
    <div className="card">
      <h3 className="section-title first">Assign employees to trips</h3>
      <table className="table">
        <thead><tr><th>Employee</th><th>Pickup trip</th><th>Drop trip</th><th></th></tr></thead>
        <tbody>
          {employees.map((emp) => {
            const a = assignedTo(emp.id)
            return (
              <tr key={emp.id}>
                <td><strong>{emp.name}</strong><div className="muted small">{emp.id}</div></td>
                <td>
                  <select
                    className="inline-select"
                    value={a.pickupTripId}
                    onChange={(e) => save(emp.id, e.target.value, a.dropTripId)}
                  >
                    <option value="">-- none --</option>
                    {pickupTrips.map((t) => <option key={t.id} value={t.id}>{tripLabel(t)}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    className="inline-select"
                    value={a.dropTripId}
                    onChange={(e) => save(emp.id, a.pickupTripId, e.target.value)}
                  >
                    <option value="">-- none --</option>
                    {dropTrips.map((t) => <option key={t.id} value={t.id}>{tripLabel(t)}</option>)}
                  </select>
                </td>
                <td><span className="tag tag-ok">Saved</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="hint">Changes save automatically when you pick a trip.</p>
    </div>
  )
}

// ---- Temporary requests ----
function RequestsTab({ requests, nameOf, bump }) {
  const [notes, setNotes] = useState({})

  function decide(id, status) {
    setCabRequestStatus(id, status, notes[id] || '')
    bump()
  }

  const sorted = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return a.raisedOn < b.raisedOn ? 1 : -1
  })

  return (
    <div className="card">
      <h3 className="section-title first">Temporary change requests</h3>
      {sorted.length === 0 && <p className="muted">No requests yet.</p>}
      {sorted.map((r) => (
        <div className="cab-request" key={r.id}>
          <div className="cab-request-head">
            <strong>{nameOf(r.employeeId)}</strong>
            <span className={`tag ${requestStatusTagClass(r.status)}`}>{requestStatusLabel(r.status)}</span>
          </div>
          <div className="muted small">
            {r.forDates.map((d) => formatDate(d)).join(', ')} — raised {formatDate(r.raisedOn)}
          </div>
          <div className="cab-request-body">
            {r.newLocation && <div><span className="muted">Location:</span> {r.newLocation}</div>}
            {r.newGate && <div><span className="muted">Gate:</span> {r.newGate}</div>}
            {r.newTime && <div><span className="muted">Time:</span> {formatTime12(r.newTime)}</div>}
            <div><span className="muted">Reason:</span> {r.reason}</div>
          </div>
          {r.status === 'pending' ? (
            <div className="button-row">
              <input
                className="inline-input"
                placeholder="Note to employee (e.g. Driver will come to Gate 5)"
                value={notes[r.id] || ''}
                onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
              />
              <button className="btn btn-primary btn-tiny" onClick={() => decide(r.id, 'approved')}>Approve</button>
              <button className="btn btn-danger btn-tiny" onClick={() => decide(r.id, 'rejected')}>Reject</button>
            </div>
          ) : (
            r.adminNote && <div className="info-box">Note: {r.adminNote}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Messages (chat with employees) ----
function MessagesTab({ employees, unreadByEmp, bump }) {
  const [selected, setSelected] = useState('')
  const [text, setText] = useState('')

  const messages = useMemo(
    () => (selected ? getCabMessagesForEmployee(selected) : []),
    [selected, bump]
  )

  // Employees with unread messages first (highest count on top), then the rest.
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const ua = unreadByEmp[a.id] || 0
      const ub = unreadByEmp[b.id] || 0
      if (ua !== ub) return ub - ua
      return a.name.localeCompare(b.name)
    })
  }, [employees, unreadByEmp])

  function chooseEmployee(id) {
    setSelected(id)
    if (id) markCabThreadRead(id) // opening the thread marks it read
    bump()
  }

  function send(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t || !selected) return
    addCabMessage({ employeeId: selected, byRole: 'admin', text: t })
    setText('')
    bump()
  }

  return (
    <div className="card">
      <h3 className="section-title first">Messages from employees</h3>
      <label className="field">
        <span>Choose an employee to view their chat (unread shown first)</span>
        <select value={selected} onChange={(e) => chooseEmployee(e.target.value)}>
          <option value="">-- choose employee --</option>
          {sortedEmployees.map((emp) => {
            const n = unreadByEmp[emp.id] || 0
            return (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.id}){n > 0 ? ` — ${n} new` : ''}
              </option>
            )
          })}
        </select>
      </label>

      {selected && (
        <>
          <div className="thread">
            {messages.length === 0 && <p className="muted">No messages from this employee yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.byRole === 'admin' ? 'msg-mine' : 'msg-them'}`}>
                <div className="msg-head">
                  <span className="msg-who">{m.byRole === 'admin' ? 'You (Transport desk)' : 'Employee'}</span>
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
              placeholder="Type a reply to the employee..."
            />
            <div className="button-row">
              <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send reply</button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

// ---- Today's cancellations (driver view) ----
function TodayTab({ employees, bump }) {
  const todayKey = new Date().toISOString().slice(0, 10)
  const cancellations = useMemo(
    () => getCabCancellationsForDate(todayKey),
    [bump]
  )
  const drivers = useMemo(() => getDrivers(), [bump])

  function nameOf(id) {
    return employees.find((e) => e.id === id)?.name || id
  }

  const skippingPickup = cancellations.filter((c) => c.skipPickup)
  const skippingDrop   = cancellations.filter((c) => c.skipDrop)

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const origin = window.location.origin

  return (
    <>
      {/* Driver run-sheet links */}
      <div className="card">
        <h3 className="section-title first">Driver run sheets — {todayLabel}</h3>
        <p className="hint first">
          Open or share a driver&rsquo;s run sheet link on their phone before the shift starts.
          The page shows their full pickup and drop list with addresses, times, and map links.
        </p>
        {drivers.length === 0 && <p className="muted">No drivers added yet.</p>}
        <div className="driver-link-grid">
          {drivers.map((d) => (
            <div key={d.id} className="driver-link-card">
              <div className="driver-link-name">{d.name}</div>
              <div className="muted small" style={{ marginBottom: 8 }}>{d.mobile}</div>
              <a
                href={`${origin}/driver/${d.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-tiny"
              >
                Open run sheet →
              </a>
              <button
                className="btn btn-light btn-tiny"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  navigator.clipboard.writeText(`${origin}/driver/${d.id}`)
                    .catch(() => {})
                }}
              >
                Copy link
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation summary */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title first">Cancellation summary</h3>

        <h4 className="sub-title">Not taking pickup today</h4>
        {skippingPickup.length === 0 ? (
          <p className="muted">All employees are taking the pickup cab today.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Employee</th><th>ID</th></tr></thead>
            <tbody>
              {skippingPickup.map((c) => (
                <tr key={c.employeeId}>
                  <td><strong>{nameOf(c.employeeId)}</strong></td>
                  <td className="muted">{c.employeeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h4 className="sub-title" style={{ marginTop: '1.5rem' }}>Not taking drop today</h4>
        {skippingDrop.length === 0 ? (
          <p className="muted">All employees are taking the drop cab today.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Employee</th><th>ID</th></tr></thead>
            <tbody>
              {skippingDrop.map((c) => (
                <tr key={c.employeeId}>
                  <td><strong>{nameOf(c.employeeId)}</strong></td>
                  <td className="muted">{c.employeeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
