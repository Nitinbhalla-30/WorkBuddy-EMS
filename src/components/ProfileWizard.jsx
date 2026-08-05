import { useState } from 'react'
import { DOCUMENT_TYPES } from '../data/sampleData.js'
import { validateForSubmit } from '../utils/profile.js'
import FileField from './FileField.jsx'
import MapPicker from './MapPicker.jsx'
import ProfileView from './ProfileView.jsx'

const STEPS = ['Personal', 'Documents', 'Bank', 'Statutory', 'Review']

// The step-by-step onboarding form.
// Props:
//   profile      - the profile to edit (draft or returned)
//   onSaveDraft  - function(formData) -> save progress
//   onSubmit     - function(formData) -> submit for review
export default function ProfileWizard({ profile, onSaveDraft, onSubmit }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(profile)))
  const [problems, setProblems] = useState([])
  const [savedNote, setSavedNote] = useState('')

  const last = STEPS.length - 1

  function setPersonal(field, value) {
    setForm((f) => ({ ...f, personal: { ...f.personal, [field]: value } }))
  }
  function setBank(field, value) {
    setForm((f) => ({ ...f, bank: { ...f.bank, [field]: value } }))
  }
  function setStatutory(field, value) {
    setForm((f) => ({ ...f, statutory: { ...f.statutory, [field]: value } }))
  }
  function setDoc(key, files) {
    setForm((f) => ({ ...f, documents: { ...f.documents, [key]: files } }))
  }

  function saveDraft() {
    onSaveDraft(form)
    setSavedNote('Saved. You can come back and finish later.')
    setTimeout(() => setSavedNote(''), 2500)
  }

  function submit() {
    const found = validateForSubmit(form)
    setProblems(found)
    if (found.length === 0) onSubmit(form)
  }

  const p = form.personal
  const b = form.bank
  const s = form.statutory

  return (
    <div>
      {/* Progress bar */}
      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`wizard-step ${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="wizard-num">{i + 1}</span>
            <span className="wizard-name">{label}</span>
          </div>
        ))}
      </div>

      {profile.status === 'returned' && profile.reviewNote && (
        <div className="error-box">
          <strong>HR asked for a correction:</strong> {profile.reviewNote}
        </div>
      )}

      {/* Step 1: Personal */}
      {step === 0 && (
        <div className="card">
          <h3 className="section-title first">Personal &amp; identity details</h3>
          <label className="field">
            <span>Full name *</span>
            <input value={p.fullName} onChange={(e) => setPersonal('fullName', e.target.value)} />
          </label>
          <div className="two-col">
            <label className="field">
              <span>Date of birth *</span>
              <input type="date" value={p.dob} onChange={(e) => setPersonal('dob', e.target.value)} />
            </label>
            <label className="field">
              <span>Contact number *</span>
              <input value={p.contactNumber} maxLength={10}
                onChange={(e) => setPersonal('contactNumber', e.target.value)} placeholder="10-digit mobile" />
            </label>
          </div>
          <label className="field">
            <span>Address *</span>
            <input value={p.address} onChange={(e) => setPersonal('address', e.target.value)}
              placeholder="House, street, city, PIN" />
          </label>
          <label className="field">
            <span>Gate No. (for cab pickup at home)</span>
            <input value={p.homeGate || ''} onChange={(e) => setPersonal('homeGate', e.target.value)}
              placeholder="e.g. Gate 3, Gate B" />
          </label>

          <h4 className="sub-title">Cab pickup &amp; drop location</h4>
          <p className="hint first">
            Drag the pin (or tap the map) to your exact home location. Your driver
            uses this point to navigate to you in Google Maps.
          </p>
          <label className="field">
            <span>Pickup point (where the cab picks you up)</span>
          </label>
          <MapPicker value={p.pickupPoint} onChange={(pt) => setPersonal('pickupPoint', pt)} />

          <label className="checkbox-row">
            <input type="checkbox" checked={p.dropSameAsPickup !== false}
              onChange={(e) => setPersonal('dropSameAsPickup', e.target.checked)} />
            <span>Drop point is same as pickup (my home)</span>
          </label>
          {p.dropSameAsPickup === false && (
            <>
              <label className="field">
                <span>Drop point (where the cab drops you)</span>
              </label>
              <MapPicker value={p.dropPoint} onChange={(pt) => setPersonal('dropPoint', pt)} />
            </>
          )}

          <h4 className="sub-title">Emergency contact</h4>
          <div className="two-col">
            <label className="field">
              <span>Name *</span>
              <input value={p.emergencyName} onChange={(e) => setPersonal('emergencyName', e.target.value)} />
            </label>
            <label className="field">
              <span>Relationship</span>
              <input value={p.emergencyRelation} onChange={(e) => setPersonal('emergencyRelation', e.target.value)}
                placeholder="e.g. Father, Spouse" />
            </label>
          </div>
          <label className="field">
            <span>Emergency contact number *</span>
            <input value={p.emergencyContact} maxLength={10}
              onChange={(e) => setPersonal('emergencyContact', e.target.value)} />
          </label>

          <h4 className="sub-title">Identity</h4>
          <div className="two-col">
            <label className="field">
              <span>Aadhaar number * (12 digits, for UAN linking)</span>
              <input value={p.aadhaar} maxLength={12}
                onChange={(e) => setPersonal('aadhaar', e.target.value)} />
            </label>
            <label className="field">
              <span>PAN * (used for TDS &amp; Form 16)</span>
              <input value={p.pan} maxLength={10}
                onChange={(e) => setPersonal('pan', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F" />
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 1 && (
        <div className="card">
          <h3 className="section-title first">Upload documents</h3>
          <p className="hint first">
            Please upload clear <strong>PDF</strong> copies, self-signed. Items
            marked <span className="req">*</span> are required.
          </p>
          {DOCUMENT_TYPES.map((d) => (
            <FileField
              key={d.key}
              label={d.label}
              hint={d.hint}
              multiple={d.multiple}
              required={d.required}
              files={form.documents[d.key]}
              onChange={(files) => setDoc(d.key, files)}
            />
          ))}
        </div>
      )}

      {/* Step 3: Bank */}
      {step === 2 && (
        <div className="card">
          <h3 className="section-title first">Bank details (for salary transfer)</h3>
          <div className="two-col">
            <label className="field">
              <span>Bank account number *</span>
              <input value={b.accountNumber} onChange={(e) => setBank('accountNumber', e.target.value)} />
            </label>
            <label className="field">
              <span>IFSC code *</span>
              <input value={b.ifsc} maxLength={11}
                onChange={(e) => setBank('ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
            </label>
          </div>
          <label className="field">
            <span>Bank name</span>
            <input value={b.bankName} onChange={(e) => setBank('bankName', e.target.value)} />
          </label>
        </div>
      )}

      {/* Step 4: Statutory */}
      {step === 3 && (
        <div className="card">
          <h3 className="section-title first">Statutory numbers</h3>
          <label className="field">
            <span>UAN — Universal Account Number (for PF), if you have one</span>
            <input value={s.uan} onChange={(e) => setStatutory('uan', e.target.value)} />
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={s.esicApplicable}
              onChange={(e) => setStatutory('esicApplicable', e.target.checked)} />
            <span>ESIC applies to me</span>
          </label>
          {s.esicApplicable && (
            <label className="field">
              <span>ESIC number *</span>
              <input value={s.esic} onChange={(e) => setStatutory('esic', e.target.value)} />
            </label>
          )}

          <h4 className="sub-title">PF nominee</h4>
          <div className="two-col">
            <label className="field">
              <span>Nominee name *</span>
              <input value={s.nomineeName} onChange={(e) => setStatutory('nomineeName', e.target.value)} />
            </label>
            <label className="field">
              <span>Relationship</span>
              <input value={s.nomineeRelation} onChange={(e) => setStatutory('nomineeRelation', e.target.value)}
                placeholder="e.g. Mother, Spouse" />
            </label>
          </div>
          <label className="field">
            <span>Nominee share (%)</span>
            <input value={s.nomineeShare} maxLength={3}
              onChange={(e) => setStatutory('nomineeShare', e.target.value)} placeholder="100" />
          </label>
        </div>
      )}

      {/* Step 5: Review */}
      {step === last && (
        <div className="card">
          <h3 className="section-title first">Review your details</h3>
          <p className="hint first">
            Please check everything below. Once you submit, the form is locked and
            sent to HR. If they need a change, they will return it to you.
          </p>
          <ProfileView profile={form} />
        </div>
      )}

      {problems.length > 0 && (
        <div className="error-box">
          <strong>Please fix these before submitting:</strong>
          <ul className="problem-list">
            {problems.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {savedNote && <div className="info-box">{savedNote}</div>}

      {/* Navigation */}
      <div className="button-row">
        {step > 0 && (
          <button className="btn btn-light" onClick={() => setStep((n) => n - 1)}>Back</button>
        )}
        {step < last && (
          <button className="btn btn-primary" onClick={() => setStep((n) => n + 1)}>Next</button>
        )}
        {step === last && (
          <button className="btn btn-primary" onClick={submit}>Submit to HR</button>
        )}
        <button className="btn" onClick={saveDraft}>Save draft</button>
      </div>
    </div>
  )
}
