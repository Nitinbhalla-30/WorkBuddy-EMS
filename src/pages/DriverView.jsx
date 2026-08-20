import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Ban, CarFront, House, LogOut, Navigation, Phone, TriangleAlert, Briefcase } from 'lucide-react'
import { getDriverRunSheet, getSettings } from '../data/store.js'
import { formatTime12, googleMapsUrl } from '../utils/cab.js'
import { useAuth } from '../context/AuthContext.jsx'
import CinematicThemeSwitcher from '../components/ui/cinematic-theme-switcher.tsx'

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
          <div className="driver-topbar-row">
            <span className="driver-brand">
              <Briefcase size={16} style={{ marginRight: 6, flexShrink: 0 }} aria-hidden="true" />
              WorkBuddy — Driver View
            </span>
            {user?.role === 'driver' && (
              <button className="driver-logout" onClick={logout}>Log out</button>
            )}
          </div>
        </header>
        <main className="driver-content">
          <div className="info-box">Driver not found. Please check your credentials.</div>
        </main>
      </div>
    )
  }

  const { driver, pickupStops, dropStops, allStops } = sheet
  const activeStops      = allStops.filter((s) => !s.cancelled)
  const cancelledStops   = allStops.filter((s) => s.cancelled)

  const pickupVehicles = Array.from(
    new Set(pickupStops.map((s) => s.vehicle?.number).filter(Boolean))
  )
  const dropVehicles = Array.from(
    new Set(dropStops.map((s) => s.vehicle?.number).filter(Boolean))
  )
  const allVehicles = Array.from(new Set([...pickupVehicles, ...dropVehicles]))

  return (
    <div className="driver-page">
      {/* Sticky top bar: always visible while scrolling on the phone */}
      <header className="driver-topbar">
        <div className="driver-topbar-row">
          <span className="driver-brand">
            <Briefcase size={16} style={{ marginRight: 6, flexShrink: 0 }} aria-hidden="true" />
            WorkBuddy — Driver View
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="cinematic-theme-switcher-wrap">
              <CinematicThemeSwitcher />
            </div>
            {user?.role === 'driver' && (
              <button className="driver-logout" onClick={logout}>
                <LogOut size={14} aria-hidden="true" /> Log out
              </button>
            )}
          </div>
        </div>
        <div className="driver-topbar-driver">
          <span className="driver-name">{driver.name}</span>
          <span className="driver-date">{todayLabel}</span>
        </div>
      </header>

      <main className="driver-content">
        {/* Waiting policy notice */}
        <div className="driver-notice">
          <TriangleAlert size={20} className="driver-notice-icon" aria-hidden="true" />
          <div>
            <strong>Waiting Policy:</strong> Do not wait for more than{' '}
            <strong>{cabWaitingTime} minutes</strong> at any pickup or drop stop.
            Please leave after this duration to ensure you are not late for
            subsequent stops or shifts.
          </div>
        </div>

        {/* ---- CHRONOLOGICAL RUN SHEET ---- */}
        <section className="driver-section">
          <div className="driver-section-title run-title">
            <span className="driver-section-title-text">
              <CarFront size={17} aria-hidden="true" />
              Today's Run Sheet
            </span>
            {allVehicles.length > 0 && (
              <span className="driver-vehicle-chip chip-all">
                Vehicle: {allVehicles.join(', ')}
              </span>
            )}
          </div>

          <div className="driver-section-body">
            {activeStops.length === 0 && (
              <p className="driver-empty muted">No stops assigned for today.</p>
            )}

            {activeStops.map((stop, i) => (
              <StopCard key={`${stop.employee.id}-${stop.trip.direction}-${stop.trip.time}`} index={i + 1} stop={stop} />
            ))}

            {cancelledStops.length > 0 && (
              <div className="driver-cancelled-block">
                <div className="driver-cancelled-label">
                  <Ban size={14} aria-hidden="true" />
                  Not riding today ({cancelledStops.length})
                </div>
                {cancelledStops.map((stop) => (
                  <div key={`${stop.employee.id}-${stop.trip.direction}`} className="driver-cancelled-row">
                    <strong>{stop.employee.name}</strong>
                    <span className="muted">{stop.employee.id}</span>
                    <span className={`tag ${stop.trip.direction === 'pickup' ? 'tag-pickup' : 'tag-drop'}`}>
                      {stop.trip.direction === 'pickup' ? 'Pickup' : 'Drop'} · Cancelled
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="hint">
          This is your run sheet for today. Tap Call to reach an employee or Navigate to open
          the address in Google Maps. Cancelled stops are shown separately — skip them entirely.
        </p>
      </main>
    </div>
  )
}

// ---- Individual stop card: every field always visible ----
function StopCard({ index, stop }) {
  const { employee, trip, info } = stop
  const direction = trip.direction
  const mapPoint = direction === 'pickup' ? info.pickupPoint : info.dropPoint
  const mapUrl   = googleMapsUrl(mapPoint)

  const hasMobile = info.mobile && info.mobile !== '--'
  const gateLabel = direction === 'pickup' ? 'Home gate' : 'Office gate'
  const gateValue = direction === 'pickup' ? info.homeGate : (trip.officeGate || '--')
  const shiftText = direction === 'pickup'
    ? (trip.shiftStart ? `Shift starts ${formatTime12(trip.shiftStart)}` : '')
    : (trip.shiftEnd ? `Shift ends ${formatTime12(trip.shiftEnd)}` : '')

  return (
    <article className={`stop-card ${direction === 'pickup' ? 'stop-card-pickup' : 'stop-card-drop'}`}>
      <div className="stop-card-head">
        <span className="stop-num">{index}</span>
        <div className="stop-head-text">
          <div className="stop-name">
            {employee.name}
            <span className={`stop-direction-badge ${direction === 'pickup' ? 'badge-pickup' : 'badge-drop'}`}>
              {direction === 'pickup' ? 'PICKUP' : 'DROP'}
            </span>
          </div>
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
              <Phone size={16} aria-hidden="true" /> Call
            </a>
          )}
          {mapUrl && (
            <a
              className="stop-btn stop-btn-nav"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={16} aria-hidden="true" /> Navigate
            </a>
          )}
        </div>
      )}
    </article>
  )
}
