import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getDriverRunSheet, getSettings } from '../data/store.js'
import { formatTime12, googleMapsUrl } from '../utils/cab.js'
import { useAuth } from '../context/AuthContext.jsx'

// Driver's run-sheet page. Requires driver login.
// Mobile-first: plain page scroll, one full card per stop, large tap targets.
export default function DriverView() {
  const { driverId } = useParams()
  const { user, logout } = useAuth()
  const todayKey = new Date().toISOString().slice(0, 10)

  const sheet = useMemo(
    () => getDriverRunSheet(driverId, todayKey),
    [driverId, todayKey]
  )

  const settings = useMemo(() => getSettings(), [])
  const cabWaitingTime = settings.cabWaitingTime || 20

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (!sheet) {
    return (
      <div className="driver-page">
        <header className="driver-topbar">
          <span className="driver-brand">WorkBuddy — Driver View</span>
          {user?.role === 'driver' && (
            <button className="driver-logout" onClick={logout}>Log out</button>
          )}
        </header>
        <main className="driver-content">
          <div className="info-box">Driver not found. Please check your credentials.</div>
        </main>
      </div>
    )
  }

  const { driver, pickupStops, dropStops } = sheet
  const activePickups    = pickupStops.filter((s) => !s.cancelled)
  const cancelledPickups = pickupStops.filter((s) => s.cancelled)
  const activeDrops      = dropStops.filter((s) => !s.cancelled)
  const cancelledDrops   = dropStops.filter((s) => s.cancelled)

  const pickupVehicles = Array.from(
    new Set(pickupStops.map((s) => s.vehicle?.number).filter(Boolean))
  )
  const dropVehicles = Array.from(
    new Set(dropStops.map((s) => s.vehicle?.number).filter(Boolean))
  )

  return (
    <div className="driver-page">
      {/* Sticky top bar: always visible while scrolling on the phone */}
      <header className="driver-topbar">
        <div className="driver-topbar-left">
          <span className="driver-brand">WorkBuddy — Driver View</span>
          {user?.role === 'driver' && (
            <button className="driver-logout" onClick={logout}>Log out</button>
          )}
        </div>
        <div className="driver-topbar-right">
          <span className="driver-name">{driver.name}</span>
          <span className="driver-date">{todayLabel}</span>
        </div>
      </header>

      <main className="driver-content">
        {/* Waiting policy notice */}
        <div className="driver-notice">
          <strong>⚠️ Waiting Policy:</strong> Do not wait for more than{' '}
          <strong>{cabWaitingTime} minutes</strong> at any pickup or drop stop.
          Please leave after this duration to ensure you are not late for
          subsequent stops or shifts.
        </div>

        {/* ---- PICKUP SECTION ---- */}
        <RunSection
          title="🚗 Pickup — Home to Office"
          titleClass="pickup-title"
          vehicles={pickupVehicles}
          stops={pickupStops}
          activeStops={activePickups}
          cancelledStops={cancelledPickups}
          direction="pickup"
          emptyText="No pickup stops assigned for today."
        />

        {/* ---- DROP SECTION ---- */}
        <RunSection
          title="🏠 Drop — Office to Home"
          titleClass="drop-title"
          vehicles={dropVehicles}
          stops={dropStops}
          activeStops={activeDrops}
          cancelledStops={cancelledDrops}
          direction="drop"
          emptyText="No drop stops assigned for today."
        />
      </main>
    </div>
  )
}

// ---- One section (pickup or drop) with its stop cards ----
function RunSection({
  title, titleClass, vehicles, stops, activeStops, cancelledStops, direction, emptyText
}) {
  return (
    <section className="driver-section">
      <div className={`driver-section-title ${titleClass}`}>
        <span>{title}</span>
        {vehicles.length > 0 && (
          <span className={`driver-vehicle-chip ${direction === 'drop' ? 'chip-drop' : 'chip-pickup'}`}>
            Vehicle: {vehicles.join(', ')}
          </span>
        )}
      </div>

      <div className="driver-section-body">
        {stops.length === 0 && <p className="driver-empty muted">{emptyText}</p>}

        {activeStops.map((stop, i) => (
          <StopCard key={stop.employee.id} index={i + 1} stop={stop} direction={direction} />
        ))}

        {cancelledStops.length > 0 && (
          <div className="driver-cancelled-block">
            <div className="driver-cancelled-label">
              ⛔ Not riding today ({direction})
            </div>
            {cancelledStops.map((stop) => (
              <div key={stop.employee.id} className="driver-cancelled-row">
                <strong>{stop.employee.name}</strong>
                <span className="muted">{stop.employee.id}</span>
                <span className="tag tag-high">Cancelled</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ---- Individual stop card: every field always visible ----
function StopCard({ index, stop, direction }) {
  const { employee, trip, info } = stop
  const mapPoint = direction === 'pickup' ? info.pickupPoint : info.dropPoint
  const mapUrl   = googleMapsUrl(mapPoint)

  const hasMobile = info.mobile && info.mobile !== '--'
  const gateLabel = direction === 'pickup' ? 'Home gate' : 'Office gate'
  const gateValue = direction === 'pickup' ? info.homeGate : (trip.officeGate || '--')
  const shiftText = direction === 'pickup'
    ? (trip.shiftStart ? `Shift starts ${formatTime12(trip.shiftStart)}` : '')
    : (trip.shiftEnd ? `Shift ends ${formatTime12(trip.shiftEnd)}` : '')

  return (
    <article className="stop-card">
      <div className="stop-card-head">
        <span className="stop-num">{index}</span>
        <div className="stop-head-text">
          <div className="stop-name">{employee.name}</div>
          <div className="stop-time">
            {direction === 'pickup' ? 'Pickup at' : 'Drop at'}{' '}
            <strong>{formatTime12(trip.time)}</strong>
            {shiftText && <span className="stop-shift"> · {shiftText}</span>}
          </div>
        </div>
      </div>

      <dl className="stop-details">
        <div className="stop-detail">
          <dt>Mobile</dt>
          <dd>
            {hasMobile
              ? <a className="stop-tel" href={`tel:${info.mobile}`}>{info.mobile}</a>
              : '--'}
          </dd>
        </div>
        <div className="stop-detail">
          <dt>Address</dt>
          <dd>{info.address}</dd>
        </div>
        <div className="stop-detail">
          <dt>{gateLabel}</dt>
          <dd>{gateValue}</dd>
        </div>
      </dl>

      {(hasMobile || mapUrl) && (
        <div className="stop-actions">
          {hasMobile && (
            <a className="stop-btn stop-btn-call" href={`tel:${info.mobile}`}>
              📞 Call
            </a>
          )}
          {mapUrl && (
            <a
              className="stop-btn stop-btn-nav"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              📍 Navigate
            </a>
          )}
        </div>
      )}
    </article>
  )
}
