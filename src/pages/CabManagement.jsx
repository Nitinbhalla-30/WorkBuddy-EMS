import { useEffect, useMemo, useRef, useState } from 'react'
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
  setDriverPin,
  updateDriver,
  updateTrip,
  updateVehicle
} from '../data/store.js'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TimeInput from '../components/TimeInput.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
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
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ number: '', label: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const editVehicle = vehicles.find((v) => v.id === editId) || null

  const vehiclesTable = useTableControls(vehicles, {
    getSortValue: (v, key) => {
      if (key === 'label') return v.label || ''
      return v[key]
    },
    initialSortKey: 'number',
    initialSortDir: 'asc'
  })

  const {
    items: vehiclesPage,
    page: vehiclesPageNum,
    totalPages: vehiclesTotalPages,
    total: vehiclesTotal,
    startIndex: vehiclesStart,
    endIndex: vehiclesEnd,
    setPage: setVehiclesPage
  } = usePagination(vehiclesTable.rows)

  function toggleMenu(vehicleId) {
    setOpenMenuId(openMenuId === vehicleId ? null : vehicleId)
  }

  function closeMenu() {
    setOpenMenuId(null)
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

  function openAdd() {
    setForm({ number: '', label: '' })
    setShowAdd(true)
  }

  function openEdit(v) {
    setEditId(v.id)
    setForm({ number: v.number, label: v.label || '' })
  }

  function submitAdd() {
    if (!form.number.trim()) return
    addVehicle({ number: form.number.trim(), label: form.label.trim() })
    setShowAdd(false)
    bump()
  }

  function submitEdit() {
    if (!editId || !form.number.trim()) return
    updateVehicle(editId, { number: form.number.trim(), label: form.label.trim() })
    setEditId(null)
    bump()
  }

  function confirmDelete() {
    if (deleteId) {
      deleteVehicle(deleteId)
      setDeleteId(null)
      bump()
    }
  }

  return (
    <div className="card">
      <div className="section-head-row" style={{ marginTop: 0, marginBottom: 12 }}>
        <h3 className="section-title first">Company vehicles</h3>
        <button className="btn btn-primary btn-tiny" onClick={openAdd}>Add vehicle</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <SortableTh label="Vehicle No." keyName="number" sortKey={vehiclesTable.sortKey} sortDir={vehiclesTable.sortDir} onSort={vehiclesTable.toggleSort} />
            <SortableTh label="Label" keyName="label" sortKey={vehiclesTable.sortKey} sortDir={vehiclesTable.sortDir} onSort={vehiclesTable.toggleSort} />
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vehiclesPage.map((v) => (
            <tr key={v.id}>
              <td><strong>{v.number}</strong></td>
              <td>{v.label || <span className="muted">--</span>}</td>
              <td>
                <div className="task-menu-container">
                  <button
                    type="button"
                    className="btn btn-tiny btn-light task-menu-button"
                    onClick={() => toggleMenu(v.id)}
                    aria-label="Vehicle actions"
                  >
                    ⋯
                  </button>
                  {openMenuId === v.id && (
                    <div className="task-menu-dropdown">
                      <button
                        type="button"
                        className="task-menu-item"
                        onClick={() => {
                          openEdit(v)
                          closeMenu()
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-menu-item task-menu-item-danger"
                        onClick={() => {
                          setDeleteId(v.id)
                          closeMenu()
                        }}
                      >
                        Delete
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
        page={vehiclesPageNum}
        totalPages={vehiclesTotalPages}
        total={vehiclesTotal}
        startIndex={vehiclesStart}
        endIndex={vehiclesEnd}
        onPageChange={setVehiclesPage}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add vehicle">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Add vehicle</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <label className="field">
              <span>Vehicle no.</span>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="e.g. DL 1CA 1234" />
            </label>
            <label className="field">
              <span>Label (optional)</span>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Sedan / White" />
            </label>
            <div className="button-row">
              <button className="btn btn-primary" disabled={!form.number.trim()} onClick={submitAdd}>Add vehicle</button>
              <button className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {editVehicle && (
        <Modal onClose={() => setEditId(null)} title={`Edit vehicle — ${editVehicle.number}`}>
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit vehicle — {editVehicle.number}</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)}>✕</button>
            </div>
            <label className="field">
              <span>Vehicle no.</span>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </label>
            <label className="field">
              <span>Label (optional)</span>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Sedan / White" />
            </label>
            <div className="button-row">
              <button className="btn btn-primary" disabled={!form.number.trim()} onClick={submitEdit}>Save changes</button>
              <button className="btn btn-light" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button type="button" className="btn btn-light" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- Drivers ----
function DriversTab({ drivers, bump }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', pin: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  // Per-driver inline PIN editing state: { [driverId]: value }
  const [pins, setPins] = useState({})
  const [pinSaved, setPinSaved] = useState({})

  const editDriver = drivers.find((d) => d.id === editId) || null

  const driversTable = useTableControls(drivers, {
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const {
    items: driversPage,
    page: driversPageNum,
    totalPages: driversTotalPages,
    total: driversTotal,
    startIndex: driversStart,
    endIndex: driversEnd,
    setPage: setDriversPage
  } = usePagination(driversTable.rows)

  function toggleMenu(driverId) {
    setOpenMenuId(openMenuId === driverId ? null : driverId)
  }

  function closeMenu() {
    setOpenMenuId(null)
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

  function openAdd() {
    setForm({ name: '', mobile: '', pin: '' })
    setShowAdd(true)
  }

  function openEdit(d) {
    setEditId(d.id)
    setForm({ name: d.name, mobile: d.mobile || '', pin: '' })
  }

  function submitAdd() {
    if (!form.name.trim()) return
    addDriver({ name: form.name.trim(), mobile: form.mobile.trim(), pin: form.pin.trim() })
    setShowAdd(false)
    bump()
  }

  function submitEdit() {
    if (!editId || !form.name.trim()) return
    updateDriver(editId, {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      // Blank PIN keeps the existing one.
      ...(form.pin.trim() ? { pin: form.pin.trim() } : {})
    })
    setEditId(null)
    bump()
  }

  function confirmDelete() {
    if (deleteId) {
      deleteDriver(deleteId)
      setDeleteId(null)
      bump()
    }
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
      <div className="section-head-row" style={{ marginTop: 0, marginBottom: 12 }}>
        <h3 className="section-title first">Company drivers</h3>
        <button className="btn btn-primary btn-tiny" onClick={openAdd}>Add driver</button>
      </div>
      <p className="hint first">
        Each driver needs a <strong>WorkBuddy ID</strong> and <strong>PIN</strong> to log in and
        view their run sheet. Set or change a driver&rsquo;s PIN in the table below.
      </p>
      <table className="table">
        <thead>
          <tr>
            <SortableTh label="Name" keyName="name" sortKey={driversTable.sortKey} sortDir={driversTable.sortDir} onSort={driversTable.toggleSort} />
            <SortableTh label="Mobile" keyName="mobile" sortKey={driversTable.sortKey} sortDir={driversTable.sortDir} onSort={driversTable.toggleSort} />
            <SortableTh label="WorkBuddy ID" keyName="id" sortKey={driversTable.sortKey} sortDir={driversTable.sortDir} onSort={driversTable.toggleSort} />
            <th>PIN</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {driversPage.map((d) => (
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
                <div className="task-menu-container">
                  <button
                    type="button"
                    className="btn btn-tiny btn-light task-menu-button"
                    onClick={() => toggleMenu(d.id)}
                    aria-label="Driver actions"
                  >
                    ⋯
                  </button>
                  {openMenuId === d.id && (
                    <div className="task-menu-dropdown">
                      <button
                        type="button"
                        className="task-menu-item"
                        onClick={() => {
                          openEdit(d)
                          closeMenu()
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-menu-item task-menu-item-danger"
                        onClick={() => {
                          setDeleteId(d.id)
                          closeMenu()
                        }}
                      >
                        Delete
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
        page={driversPageNum}
        totalPages={driversTotalPages}
        total={driversTotal}
        startIndex={driversStart}
        endIndex={driversEnd}
        onPageChange={setDriversPage}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add driver">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Add driver</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <label className="field">
              <span>Driver name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramu Yadav" />
            </label>
            <div className="two-col">
              <label className="field">
                <span>Mobile</span>
                <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile" maxLength={10} />
              </label>
              <label className="field">
                <span>PIN (optional)</span>
                <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="Login PIN" maxLength={8} />
              </label>
            </div>
            <div className="button-row">
              <button className="btn btn-primary" disabled={!form.name.trim()} onClick={submitAdd}>Add driver</button>
              <button className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {editDriver && (
        <Modal onClose={() => setEditId(null)} title={`Edit driver — ${editDriver.name}`}>
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit driver — {editDriver.name}</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)}>✕</button>
            </div>
            <label className="field">
              <span>Driver name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div className="two-col">
              <label className="field">
                <span>Mobile</span>
                <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} maxLength={10} />
              </label>
              <label className="field">
                <span>New PIN (leave blank to keep current)</span>
                <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder={editDriver.pin ? '••••' : 'Set PIN'} maxLength={8} />
              </label>
            </div>
            <div className="button-row">
              <button className="btn btn-primary" disabled={!form.name.trim()} onClick={submitEdit}>Save changes</button>
              <button className="btn btn-light" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to delete this driver? This action cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button type="button" className="btn btn-light" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- Trips ----
const EMPTY_TRIP_FORM = {
  vehicleId: '', driverId: '', direction: 'pickup', time: '',
  shiftStart: '', shiftEnd: '', officeGate: '',
  supervisorName: '', supervisorMobile: ''
}

// Person cell for the trips table: name on its own line with the mobile
// number below it in brackets, tappable (tel: link) on phones.
function PersonCell({ name, mobile }) {
  if (!name && !mobile) return <span className="muted">--</span>
  return (
    <>
      <div>{name || '--'}</div>
      {mobile
        ? <a href={`tel:${mobile}`} className="phone-link">({mobile})</a>
        : <span className="muted">(--)</span>}
    </>
  )
}

function TripsTab({ trips, vehicles, drivers, bump }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_TRIP_FORM)
  const [deleteId, setDeleteId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const editTrip = trips.find((t) => t.id === editId) || null

  const tripsTable = useTableControls(trips, {
    getSortValue: (t, key) => {
      if (key === 'direction') return t.direction === 'drop' ? 'Drop' : 'Pickup'
      if (key === 'officeTime') return t.direction === 'drop' ? (t.shiftEnd || '') : (t.shiftStart || '')
      if (key === 'vehicle') return vehicleById(vehicles, t.vehicleId)?.number || ''
      if (key === 'driver') return driverById(drivers, t.driverId)?.name || ''
      if (key === 'gate') return t.officeGate || ''
      if (key === 'supervisor') return t.supervisorName || ''
      return t[key]
    },
    initialSortKey: 'direction',
    initialSortDir: 'asc'
  })

  const {
    items: tripsPage,
    page: tripsPageNum,
    totalPages: tripsTotalPages,
    total: tripsTotal,
    startIndex: tripsStart,
    endIndex: tripsEnd,
    setPage: setTripsPage
  } = usePagination(tripsTable.rows)

  function toggleMenu(tripId) {
    setOpenMenuId(openMenuId === tripId ? null : tripId)
  }

  function closeMenu() {
    setOpenMenuId(null)
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

  function openAdd() {
    setForm(EMPTY_TRIP_FORM)
    setShowAdd(true)
  }

  function openEdit(t) {
    setEditId(t.id)
    setForm({
      vehicleId: t.vehicleId, driverId: t.driverId, direction: t.direction, time: t.time,
      shiftStart: t.shiftStart || '', shiftEnd: t.shiftEnd || '', officeGate: t.officeGate || '',
      supervisorName: t.supervisorName || '', supervisorMobile: t.supervisorMobile || ''
    })
  }

  // Keep only the fields that belong to the chosen direction.
  function normalize(data) {
    return {
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      direction: data.direction,
      time: data.time,
      officeGate: data.direction === 'drop' ? data.officeGate : '',
      supervisorName: data.supervisorName,
      supervisorMobile: data.supervisorMobile,
      shiftStart: data.direction === 'pickup' ? data.shiftStart : '',
      shiftEnd: data.direction === 'drop' ? data.shiftEnd : ''
    }
  }

  const canSubmit = Boolean(form.vehicleId && form.driverId && form.time)

  function submitAdd() {
    if (!canSubmit) return
    addTrip(normalize(form))
    setShowAdd(false)
    bump()
  }

  function submitEdit() {
    if (!editId || !canSubmit) return
    updateTrip(editId, normalize(form))
    setEditId(null)
    bump()
  }

  function confirmDelete() {
    if (deleteId) {
      deleteTrip(deleteId)
      setDeleteId(null)
      bump()
    }
  }

  // The trip form is shared by the Add and Edit popups.
  function tripFormFields() {
    return (
      <>
        <div className="two-col">
          <label className="field">
            <span>Vehicle</span>
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">-- choose --</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.number}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Driver</span>
            <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">-- choose --</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
        </div>
        <div className="two-col">
          <label className="field">
            <span>Direction</span>
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <option value="pickup">Pickup (home to office)</option>
              <option value="drop">Drop (office to home)</option>
            </select>
          </label>
          <label className="field">
            <span>{form.direction === 'drop' ? 'Cab leaves office time' : 'Pickup time'}</span>
            <TimeInput value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </label>
        </div>
        {form.direction === 'pickup' && (
          <label className="field">
            <span>Office starts at</span>
            <TimeInput value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} />
          </label>
        )}
        {form.direction === 'drop' && (
          <label className="field">
            <span>Office ends at</span>
            <TimeInput value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} />
          </label>
        )}
        {form.direction === 'drop' && (
          <label className="field">
            <span>Office gate (where cab waits)</span>
            <input value={form.officeGate} onChange={(e) => setForm({ ...form, officeGate: e.target.value })} placeholder="e.g. Gate 2" />
          </label>
        )}
        <div className="two-col">
          <label className="field">
            <span>Supervisor name (to call if cab is late)</span>
            <input value={form.supervisorName} onChange={(e) => setForm({ ...form, supervisorName: e.target.value })} placeholder="e.g. Anil Singh" />
          </label>
          <label className="field">
            <span>Supervisor mobile</span>
            <input value={form.supervisorMobile} onChange={(e) => setForm({ ...form, supervisorMobile: e.target.value })} placeholder="10-digit mobile" maxLength={10} />
          </label>
        </div>
      </>
    )
  }

  return (
    <div className="card">
      <div className="section-head-row" style={{ marginTop: 0, marginBottom: 12 }}>
        <h3 className="section-title first">Cab trips</h3>
        <button className="btn btn-primary btn-tiny" onClick={openAdd}>Add trip</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <SortableTh label="Direction" keyName="direction" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Cab time" keyName="time" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Office time" keyName="officeTime" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Vehicle" keyName="vehicle" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Driver" keyName="driver" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Office Gate" keyName="gate" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <SortableTh label="Supervisor" keyName="supervisor" sortKey={tripsTable.sortKey} sortDir={tripsTable.sortDir} onSort={tripsTable.toggleSort} />
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tripsPage.map((t) => {
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
                <td><PersonCell name={d?.name} mobile={d?.mobile} /></td>
                <td>{t.officeGate || <span className="muted">--</span>}</td>
                <td><PersonCell name={t.supervisorName} mobile={t.supervisorMobile} /></td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(t.id)}
                      aria-label="Trip actions"
                    >
                      ⋯
                    </button>
                    {openMenuId === t.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            openEdit(t)
                            closeMenu()
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          onClick={() => {
                            setDeleteId(t.id)
                            closeMenu()
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Pagination
        page={tripsPageNum}
        totalPages={tripsTotalPages}
        total={tripsTotal}
        startIndex={tripsStart}
        endIndex={tripsEnd}
        onPageChange={setTripsPage}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add trip">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Add trip</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            {tripFormFields()}
            <div className="button-row">
              <button className="btn btn-primary" disabled={!canSubmit} onClick={submitAdd}>Add trip</button>
              <button className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {editTrip && (
        <Modal onClose={() => setEditId(null)} title="Edit trip">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit trip</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)}>✕</button>
            </div>
            {tripFormFields()}
            <div className="button-row">
              <button className="btn btn-primary" disabled={!canSubmit} onClick={submitEdit}>Save changes</button>
              <button className="btn btn-light" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to delete this trip? This action cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button type="button" className="btn btn-light" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- Assign employees ----
function AssignTab({ employees, trips, assignments, bump }) {
  const pickupTrips = trips.filter((t) => t.direction === 'pickup')
  const dropTrips = trips.filter((t) => t.direction === 'drop')

  const assignTable = useTableControls(employees, {
    getSortValue: (emp, key) => {
      if (key === 'pickup' || key === 'drop') {
        const a = assignedTo(emp.id)
        const list = key === 'pickup' ? pickupTrips : dropTrips
        const tripId = key === 'pickup' ? a.pickupTripId : a.dropTripId
        const t = list.find((x) => x.id === tripId)
        return t ? tripLabel(t) : ''
      }
      return emp[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const {
    items: employeesPage,
    page: assignPageNum,
    totalPages: assignTotalPages,
    total: assignTotal,
    startIndex: assignStart,
    endIndex: assignEnd,
    setPage: setAssignPage
  } = usePagination(assignTable.rows)

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
        <thead>
          <tr>
            <SortableTh label="Employee" keyName="name" sortKey={assignTable.sortKey} sortDir={assignTable.sortDir} onSort={assignTable.toggleSort} />
            <SortableTh label="Pickup trip" keyName="pickup" sortKey={assignTable.sortKey} sortDir={assignTable.sortDir} onSort={assignTable.toggleSort} />
            <SortableTh label="Drop trip" keyName="drop" sortKey={assignTable.sortKey} sortDir={assignTable.sortDir} onSort={assignTable.toggleSort} />
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employeesPage.map((emp) => {
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
      <Pagination
        page={assignPageNum}
        totalPages={assignTotalPages}
        total={assignTotal}
        startIndex={assignStart}
        endIndex={assignEnd}
        onPageChange={setAssignPage}
      />
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

  const {
    items: requestsPage,
    page: requestsPageNum,
    totalPages: requestsTotalPages,
    total: requestsTotal,
    startIndex: requestsStart,
    endIndex: requestsEnd,
    setPage: setRequestsPage
  } = usePagination(sorted)

  return (
    <div className="card">
      <h3 className="section-title first">Temporary change requests</h3>
      {sorted.length === 0 && <p className="muted">No requests yet.</p>}
      {requestsPage.map((r) => (
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
      <Pagination
        page={requestsPageNum}
        totalPages={requestsTotalPages}
        total={requestsTotal}
        startIndex={requestsStart}
        endIndex={requestsEnd}
        onPageChange={setRequestsPage}
      />
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

  const [openMenuId, setOpenMenuId] = useState(null)
  const [showCancellation, setShowCancellation] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const copyTimer = useRef(null)

  function toggleMenu(id) {
    setOpenMenuId((cur) => (cur === id ? null : id))
  }
  function closeMenu() {
    setOpenMenuId(null)
  }

  function copyRunSheetLink(d) {
    navigator.clipboard.writeText(`${origin}/driver/${d.id}`).catch(() => {})
    setCopiedId(d.id)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => {
      setCopiedId(null)
      setOpenMenuId(null)
    }, 1200)
  }

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  const runsTable = useTableControls(drivers, {
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const {
    items: driversPage,
    page: runsPageNum,
    totalPages: runsTotalPages,
    total: runsTotal,
    startIndex: runsStart,
    endIndex: runsEnd,
    setPage: setRunsPage
  } = usePagination(runsTable.rows)

  function nameOf(id) {
    return employees.find((e) => e.id === id)?.name || id
  }

  const skippingPickup = cancellations.filter((c) => c.skipPickup)
  const skippingDrop   = cancellations.filter((c) => c.skipDrop)

  const {
    items: pickupPage,
    page: pickupPageNum,
    totalPages: pickupTotalPages,
    total: pickupTotal,
    startIndex: pickupStart,
    endIndex: pickupEnd,
    setPage: setPickupPage
  } = usePagination(skippingPickup)
  const {
    items: dropPage,
    page: dropPageNum,
    totalPages: dropTotalPages,
    total: dropTotal,
    startIndex: dropStart,
    endIndex: dropEnd,
    setPage: setDropPage
  } = usePagination(skippingDrop)

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const origin = window.location.origin

  return (
    <>
      {/* Driver run-sheet links */}
      <div className="card">
        <div className="section-head-row" style={{ marginTop: 0, marginBottom: 12 }}>
          <h3 className="section-title first">Driver run sheets — {todayLabel}</h3>
          <button className="btn btn-primary btn-tiny" onClick={() => setShowCancellation(true)}>
            Cancellation summary
          </button>
        </div>
        <p className="hint first">
          Open or share a driver&rsquo;s run sheet link on their phone before the shift starts.
          The page shows their full pickup and drop list with addresses, times, and map links.
        </p>
        {drivers.length === 0 && <p className="muted">No drivers added yet.</p>}
        {drivers.length > 0 && (
          <>
            <table className="table">
              <thead>
                <tr>
                  <SortableTh label="Driver" keyName="name" sortKey={runsTable.sortKey} sortDir={runsTable.sortDir} onSort={runsTable.toggleSort} />
                  <SortableTh label="Mobile" keyName="mobile" sortKey={runsTable.sortKey} sortDir={runsTable.sortDir} onSort={runsTable.toggleSort} />
                  <SortableTh label="WorkBuddy ID" keyName="id" sortKey={runsTable.sortKey} sortDir={runsTable.sortDir} onSort={runsTable.toggleSort} />
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {driversPage.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.mobile}</td>
                    <td><code>{d.id}</code></td>
                    <td>
                      <div className="task-menu-container">
                        <button
                          type="button"
                          className="btn btn-tiny btn-light task-menu-button"
                          onClick={() => toggleMenu(d.id)}
                          aria-label="Run sheet actions"
                        >
                          ⋯
                        </button>
                        {openMenuId === d.id && (
                          <div className="task-menu-dropdown">
                            <a
                              href={`${origin}/driver/${d.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="task-menu-item"
                              onClick={closeMenu}
                            >
                              Open run sheet
                            </a>
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => copyRunSheetLink(d)}
                            >
                              {copiedId === d.id ? 'Link copied ✓' : 'Copy link'}
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
              page={runsPageNum}
              totalPages={runsTotalPages}
              total={runsTotal}
              startIndex={runsStart}
              endIndex={runsEnd}
              onPageChange={setRunsPage}
            />
          </>
        )}
      </div>

      {/* Cancellation summary popup */}
      {showCancellation && (
        <Modal onClose={() => setShowCancellation(false)} title="Cancellation summary">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <h3 className="section-title first">Cancellation summary</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowCancellation(false)}>✕</button>
            </div>

            <h4 className="sub-title">Not taking pickup today</h4>
            {skippingPickup.length === 0 ? (
              <p className="muted">All employees are taking the pickup cab today.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Employee</th><th>ID</th></tr></thead>
                <tbody>
                  {pickupPage.map((c) => (
                    <tr key={c.employeeId}>
                      <td><strong>{nameOf(c.employeeId)}</strong></td>
                      <td className="muted">{c.employeeId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {skippingPickup.length > 0 && (
              <Pagination
                page={pickupPageNum}
                totalPages={pickupTotalPages}
                total={pickupTotal}
                startIndex={pickupStart}
                endIndex={pickupEnd}
                onPageChange={setPickupPage}
              />
            )}

            <h4 className="sub-title" style={{ marginTop: '1.5rem' }}>Not taking drop today</h4>
            {skippingDrop.length === 0 ? (
              <p className="muted">All employees are taking the drop cab today.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Employee</th><th>ID</th></tr></thead>
                <tbody>
                  {dropPage.map((c) => (
                    <tr key={c.employeeId}>
                      <td><strong>{nameOf(c.employeeId)}</strong></td>
                      <td className="muted">{c.employeeId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {skippingDrop.length > 0 && (
              <Pagination
                page={dropPageNum}
                totalPages={dropTotalPages}
                total={dropTotal}
                startIndex={dropStart}
                endIndex={dropEnd}
                onPageChange={setDropPage}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
