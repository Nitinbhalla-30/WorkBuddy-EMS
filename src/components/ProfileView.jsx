import { DOCUMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import { formatFileSize } from '../utils/profile.js'
import { googleMapsUrl } from '../utils/cab.js'

// A small labelled value row.
function Row({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || <span className="muted">--</span>}</span>
    </div>
  )
}

// Read-only display of a submitted profile. Used by the employee (when locked)
// and by HR while reviewing.
export default function ProfileView({ profile }) {
  const p = profile.personal
  const b = profile.bank
  const s = profile.statutory

  return (
    <div className="profile-view">
      <h3 className="section-title first">Personal &amp; identity</h3>
      <div className="info-grid">
        <Row label="Full name" value={p.fullName} />
        <Row label="Address" value={p.address} />
        <Row label="Contact number" value={p.contactNumber} />
        <Row label="Date of birth" value={p.dob ? formatDate(p.dob) : ''} />
        <Row label="Aadhaar number" value={p.aadhaar} />
        <Row label="PAN" value={p.pan} />
        <div className="info-row">
          <span className="info-label">Cab pickup point</span>
          <span className="info-value">
            {p.pickupPoint
              ? <a href={googleMapsUrl(p.pickupPoint)} target="_blank" rel="noreferrer">Open in Google Maps</a>
              : <span className="muted">--</span>}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Cab drop point</span>
          <span className="info-value">
            {p.dropSameAsPickup !== false
              ? (p.pickupPoint ? 'Same as pickup' : <span className="muted">--</span>)
              : (p.dropPoint
                  ? <a href={googleMapsUrl(p.dropPoint)} target="_blank" rel="noreferrer">Open in Google Maps</a>
                  : <span className="muted">--</span>)}
          </span>
        </div>
        <Row label="Home gate (cab pickup)" value={p.homeGate} />
        <Row label="Emergency contact" value={
          p.emergencyName ? `${p.emergencyName}${p.emergencyRelation ? ` (${p.emergencyRelation})` : ''} — ${p.emergencyContact}` : ''
        } />
      </div>

      <h3 className="section-title">Bank details</h3>
      <div className="info-grid">
        <Row label="Account number" value={b.accountNumber} />
        <Row label="IFSC code" value={b.ifsc} />
        <Row label="Bank name" value={b.bankName} />
      </div>

      <h3 className="section-title">Statutory numbers</h3>
      <div className="info-grid">
        <Row label="UAN (for PF)" value={s.uan} />
        <Row label="ESIC" value={s.esicApplicable ? (s.esic || 'Applicable') : 'Not applicable'} />
        <Row label="PF nominee" value={
          s.nomineeName ? `${s.nomineeName}${s.nomineeRelation ? ` (${s.nomineeRelation})` : ''}${s.nomineeShare ? ` — ${s.nomineeShare}%` : ''}` : ''
        } />
      </div>

      <h3 className="section-title">Documents</h3>
      <div className="card doc-summary">
        {DOCUMENT_TYPES.map((d) => {
          const files = (profile.documents && profile.documents[d.key]) || []
          return (
            <div className="doc-summary-row" key={d.key}>
              <span className="doc-summary-label">{d.label}</span>
              <span className="doc-summary-files">
                {files.length === 0 ? (
                  <span className="muted">--</span>
                ) : (
                  files.map((f, i) => (
                    <span className="file-chip static" key={`${f.name}-${i}`}>
                      <span className="file-chip-name">{f.name}</span>
                      <span className="file-chip-size muted">{formatFileSize(f.size)}</span>
                    </span>
                  ))
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
