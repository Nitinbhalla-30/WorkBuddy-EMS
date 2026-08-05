import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getDriverRunSheet, getSettings } from '../data/store.js'
import { formatTime12, googleMapsUrl } from '../utils/cab.js'
import { useAuth } from '../context/AuthContext.jsx'

// Driver's run-sheet page. Requires driver login.
// Shows the driver's pickup and drop list for today with full stop details.
export default function DriverView() {
  const { driverId } = useParams()
  const { user, logout } = useAuth()
  const todayKey = new Date().toISOString().slice(0, 10)

  const sheet = useMemo(
    () => getDriverRunSheet(driverId, todayKey),
    [driverId, todayKey]
  )

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const settings = useMemo(() => getSettings(), [])
  const cabWaitingTime = settings.cabWaitingTime || 20

  if (!sheet) {
    return (
      <div className="driver-shell">
        <div className="driver-header">
          <div>
            <div className="driver-brand">WorkBuddy — Driver View</div>
            {user?.role === 'driver' && (
              <button
                className="btn btn-light btn-tiny"
                style={{ marginTop: '8px', padding: '4px 12px', fontSize: '12px' }}
                onClick={logout}
              >
                Log out
              </button>
            )}
          </div>
        </div>
        <div className="driver-body">
          <div className="info-box">Driver not found. Please check your credentials.</div>
        </div>
      </div>
    )
  }

  const { driver, pickupStops, dropStops } = sheet
  const activePickups   = pickupStops.filter((s) => !s.cancelled)
  const cancelledPickups = pickupStops.filter((s) => s.cancelled)
  const activeDrops     = dropStops.filter((s) => !s.cancelled)
  const cancelledDrops  = dropStops.filter((s) => s.cancelled)

  const pickupVehicles = useMemo(() => {
    return Array.from(new Set(pickupStops.map((s) => s.vehicle?.number).filter(Boolean)))
  }, [pickupStops])

  const dropVehicles = useMemo(() => {
    return Array.from(new Set(dropStops.map((s) => s.vehicle?.number).filter(Boolean)))
  }, [dropStops])

  return (
    <div className="driver-shell">
      {/* Header */}
      <div className="driver-header">
        <div>
          <div className="driver-brand">WorkBuddy — Driver View</div>
          {user?.role === 'driver' && (
            <button
              className="btn btn-light btn-tiny"
              style={{ marginTop: '8px', padding: '4px 12px', fontSize: '12px' }}
              onClick={logout}
            >
              Log out
            </button>
          )}
        </div>
        <div className="driver-meta">
          <span className="driver-name">{driver.name}</span>
          <span className="driver-date">{todayLabel}</span>
        </div>
      </div>

      <div className="driver-body">
        {/* Waiting policy notice */}
        <div className="info-box first" style={{ border: '1px solid #1e3a8a', background: '#eff6ff', color: '#1e3a8a', margin: '0 0 16px 0', padding: '14px 16px', borderRadius: '10px' }}>
          <strong>⚠️ Waiting Policy:</strong> Do not wait for more than <strong>{cabWaitingTime} minutes</strong> at any pickup or drop stop. Please leave after this duration to ensure you are not late for subsequent stops or shifts.
        </div>

        {/* ---- PICKUP SECTION ---- */}
        <div className="driver-section">
          <div className="driver-section-title pickup-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🚗 Pickup — Home to Office</span>
            {pickupVehicles.length > 0 && (
              <span style={{ fontSize: '13px', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                Vehicle: {pickupVehicles.join(', ')}
              </span>
            )}
          </div>

          {pickupStops.length === 0 && (
            <p className="muted" style={{ padding: '20px' }}>No pickup stops assigned for today.</p>
          )}

          {activePickups.length > 0 && (
            <div className="driver-stops">
              {activePickups.map((stop, i) => (
                <StopCard key={stop.employee.id} index={i + 1} stop={stop} direction="pickup" />
              ))}
            </div>
          )}

          {cancelledPickups.length > 0 && (
            <div className="driver-cancelled-block">
              <div className="driver-cancelled-label">⛔ Not riding today (pickup)</div>
              {cancelledPickups.map((stop) => (
                <div key={stop.employee.id} className="driver-cancelled-row">
                  <strong>{stop.employee.name}</strong>
                  <span className="muted">{stop.employee.id}</span>
                  <span className="tag tag-high">Cancelled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- DROP SECTION ---- */}
        <div className="driver-section">
          <div className="driver-section-title drop-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🏠 Drop — Office to Home</span>
            {dropVehicles.length > 0 && (
              <span style={{ fontSize: '13px', background: '#bbf7d0', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                Vehicle: {dropVehicles.join(', ')}
              </span>
            )}
          </div>

          {dropStops.length === 0 && (
            <p className="muted" style={{ padding: '20px' }}>No drop stops assigned for today.</p>
          )}

          {activeDrops.length > 0 && (
            <div className="driver-stops">
              {activeDrops.map((stop, i) => (
                <StopCard key={stop.employee.id} index={i + 1} stop={stop} direction="drop" />
              ))}
            </div>
          )}

          {cancelledDrops.length > 0 && (
            <div className="driver-cancelled-block">
              <div className="driver-cancelled-label">⛔ Not riding today (drop)</div>
              {cancelledDrops.map((stop) => (
                <div key={stop.employee.id} className="driver-cancelled-row">
                  <strong>{stop.employee.name}</strong>
                  <span className="muted">{stop.employee.id}</span>
                  <span className="tag tag-high">Cancelled</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ---- Individual stop card ----
function StopCard({ index, stop, direction }) {
  const { employee, trip, vehicle, info } = stop
  const mapPoint = direction === 'pickup' ? info.pickupPoint : info.dropPoint
  const mapUrl   = googleMapsUrl(mapPoint)

  return (
    <div className="driver-stop-card">
      <div className="driver-stop-index">{index}</div>
      <div className="driver-stop-body">
        <div className="driver-stop-name">{employee.name}</div>
        <div className="driver-stop-time">
          {direction === 'pickup' ? 'Pickup at' : 'Drop at'}{' '}
          <strong>{formatTime12(trip.time)}</strong>
          {direction === 'pickup' && trip.shiftStart && (
            <span className="driver-stop-shift"> · Shift starts {formatTime12(trip.shiftStart)}</span>
          )}
          {direction === 'drop' && trip.shiftEnd && (
            <span className="driver-stop-shift"> · Shift ends {formatTime12(trip.shiftEnd)}</span>
          )}
        </div>

        <div className="driver-stop-row">
          <span className="driver-stop-label">Mobile</span>
          {info.mobile && info.mobile !== '--'
            ? <a href={`tel:${info.mobile}`} className="driver-map-link">{info.mobile}</a>
            : <span>--</span>
          }
        </div>

        <div className="driver-stop-row">
          <span className="driver-stop-label">Address</span>
          <span>{info.address}</span>
        </div>
        <div className="driver-stop-row">
          <span className="driver-stop-label">
            {direction === 'pickup' ? 'Home gate' : 'Office gate'}
          </span>
          <span>{direction === 'pickup' ? info.homeGate : (trip.officeGate || '--')}</span>
        </div>

        {mapUrl && (
          <div className="driver-stop-row">
            <span className="driver-stop-label">Navigate</span>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="driver-map-link"
            >
              📍 Open in Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
