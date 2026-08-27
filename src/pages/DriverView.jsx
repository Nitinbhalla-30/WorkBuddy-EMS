import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Ban, CarFront, House, LogOut, Navigation, Phone, TriangleAlert, Briefcase, X } from 'lucide-react'
import { getDriverRunSheet, getSettings } from '../data/store.js'
import { formatTime12, googleMapsUrl } from '../utils/cab.js'
import { useAuth } from '../context/AuthContext.jsx'
import CinematicThemeSwitcher from '../components/ui/cinematic-theme-switcher.tsx'
import { OriginButton } from '../components/ui/origin-button.tsx'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'

// Driver's run-sheet page. Requires driver login.
// Mobile-first: plain page scroll, one full card per stop, large tap targets.
export default function DriverView() {
  const { driverId } = useParams()
  const { user, logout } = useAuth()
  const todayKey = new Date().toISOString().slice(0, 10)
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

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
              <span className="brand-mark" aria-hidden="true">
                <Briefcase size={14} strokeWidth={2.25} />
              </span>
              WorkBuddy — Driver View
            </span>
            <div className="cinematic-theme-switcher-wrap">
              <CinematicThemeSwitcher />
            </div>
          </div>
          {user?.role === 'driver' && (
            <div className="driver-topbar-driver" style={{ justifyContent: 'flex-end' }}>
              <OriginButton
                className="h-10 rounded-lg px-4 text-[14px] data-[hovered=true]:text-white dark:data-[hovered=true]:text-white"
                fillClassName="bg-[#e81123] dark:bg-[#e81123]"
                onClick={() => setConfirmLogout(true)}
              >
                <LogOut size={14} aria-hidden="true" />
                <span className="driver-logout-text">Log out</span>
              </OriginButton>
            </div>
          )}
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
            <span className="brand-mark" aria-hidden="true">
              <Briefcase size={14} strokeWidth={2.25} />
            </span>
            WorkBuddy — Driver View
          </span>
          <div className="cinematic-theme-switcher-wrap">
            <CinematicThemeSwitcher />
          </div>
        </div>
        <div className="driver-topbar-driver">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar name={driver.name} size={36} className="driver-avatar" />
            <span className="driver-name">{driver.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="driver-date">{todayLabel}</span>
            {user?.role === 'driver' && (
              <OriginButton
                className="h-10 rounded-lg px-4 text-[14px] data-[hovered=true]:text-white dark:data-[hovered=true]:text-white"
                fillClassName="bg-[#e81123] dark:bg-[#e81123]"
                onClick={() => setConfirmLogout(true)}
              >
                <LogOut size={14} aria-hidden="true" />
                <span className="driver-logout-text">Log out</span>
              </OriginButton>
            )}
          </div>
        </div>
      </header>

      <main className="driver-content">
        {/* Waiting policy notice */}
        {!noticeDismissed && (
          <div className="driver-notice">
            <TriangleAlert size={20} className="driver-notice-icon" aria-hidden="true" />
            <div className="driver-notice-text">
              <strong>Waiting Policy:</strong> Do not wait for more than{' '}
              <strong>{cabWaitingTime} minutes</strong> at any pickup or drop stop.
              Please leave after this duration to ensure you are not late for
              subsequent stops or shifts.
            </div>
            <button
              className="driver-notice-close"
              onClick={() => setNoticeDismissed(true)}
              aria-label="Dismiss waiting policy notice"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

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
                    <Avatar src={stop.employee.photoUrl} name={stop.employee.name} size={28} />
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

      {confirmLogout && (
        <Modal onClose={() => setConfirmLogout(false)} title="Confirm Log out">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Log out</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmLogout(false)} aria-label="Close">
                <X size={15} />
              </button>
            </div>
            <p className="hint first">
              You will be signed out and need to log in again to access your run sheet.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={logout} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={14} aria-hidden="true" /> Log out
              </button>
              <button type="button" className="btn btn-light" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
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
        <div className="stop-card-index-row">
          <span className="stop-num">{index}</span>
        </div>
        <div className="stop-card-person">
          <Avatar src={employee.photoUrl} name={employee.name} size={44} className="stop-avatar" />
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
