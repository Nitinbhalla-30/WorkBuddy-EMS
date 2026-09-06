import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getProfileForEmployee,
  requestProfileUpdate,
  saveProfileDraft,
  submitProfile
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  canRequestProfileUpdate,
  isEditable,
  profileStatusLabel,
  profileStatusTagClass
} from '../utils/profile.js'
import ProfileWizard from '../components/ProfileWizard.jsx'
import ProfileView from '../components/ProfileView.jsx'
import Modal from '../components/Modal.jsx'
import { CircleUser, X } from 'lucide-react'

// The employee's own details. Onboarding, or update-after-verification with HR approval.
export default function EmployeeProfile() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestNote, setRequestNote] = useState('')

  const profile = useMemo(() => {
    const found = getProfileForEmployee(user.id)
    if (!found.personal.fullName) {
      found.personal = { ...found.personal, fullName: user.name }
    }
    return found
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, refresh])

  function handleSaveDraft(data) {
    saveProfileDraft(user.id, data)
    setRefresh((n) => n + 1)
  }

  function handleSubmit(data) {
    submitProfile(user.id, data)
    setRefresh((n) => n + 1)
  }

  function handleRequestUpdate() {
    requestProfileUpdate(user.id, requestNote)
    setRequestNote('')
    setShowRequestForm(false)
    setRefresh((n) => n + 1)
  }

  const editable = isEditable(profile.status)
  const canRequest = canRequestProfileUpdate(profile.status)

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <CircleUser size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Details
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>View and manage your personal and employment details</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`tag ${profileStatusTagClass(profile.status)}`}>
            {profileStatusLabel(profile.status)}
          </span>
          {canRequest && (
            <button
              type="button"
              className="btn btn-primary btn-tiny"
              onClick={() => setShowRequestForm(true)}
            >
              Request update
            </button>
          )}
        </div>
      </div>

      {editable ? (
        <>
          {profile.status === 'draft' && (
            <p className="hint first">
              Welcome! Please complete your personal details, upload a profile photo, and submit your documents.
              You can save a draft and come back later. When everything is ready, submit for HR to review.
            </p>
          )}
          {profile.status === 'update_approved' && (
            <div className="info-box first">
              HR approved your request to update your details. Make your changes,
              then submit so HR can verify them again.
            </div>
          )}
          <ProfileWizard
            profile={profile}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />
        </>
      ) : (
        <>
          {profile.status === 'submitted' && (
            <div className="info-box first">
              Your details were submitted on {formatDate(profile.submittedOn)} and
              are with HR for review. The form is locked until they finish.
            </div>
          )}
          {profile.status === 'verified' && (
            <div className="info-box first">
              Your details were verified by HR on {formatDate(profile.reviewedOn)}.
              To change anything, ask HR for permission first, then update and
              submit for verification again.
            </div>
          )}
          {profile.status === 'update_requested' && (
            <div className="info-box first">
              Your request to update details was sent on{' '}
              {formatDate(profile.updateRequestedOn)}. HR will review it and
              unlock the form if approved. You cannot edit until then.
              {profile.updateRequestNote && (
                <span> Your note: &ldquo;{profile.updateRequestNote}&rdquo;</span>
              )}
            </div>
          )}
          {profile.reviewNote && profile.status === 'verified' && profile.reviewedOn && (
            <div className="error-box first">
              HR note: {profile.reviewNote}
            </div>
          )}

          <div className="card">
            <ProfileView profile={profile} />
          </div>

          {showRequestForm && (
            <Modal onClose={() => setShowRequestForm(false)} title="Request to update details">
              <div className="modal-form">
                  <div className="modal-header">
                    <h3 className="section-title first">Request to update details</h3>
                    <button
                      type="button"
                      className="btn btn-tiny btn-light"
                      onClick={() => setShowRequestForm(false)}
                     aria-label="Close"><X size={15} /></button>
                  </div>
                  <p className="hint first">
                    Your details are locked once HR has verified them. If you need to make a change,
                    submit a request to HR for permission. Once approved, you can edit and resubmit for verification.
                  </p>
                  <label className="field">
                    <span>Reason for update (optional)</span>
                    <input
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      placeholder="e.g. Changed address, new bank account"
                    />
                  </label>
                  <div className="button-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleRequestUpdate}
                    >
                      Send request to HR
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
            </Modal>
          )}
        </>
      )}

      <p className="hint">
        Fill in your personal details, upload a profile photo, and submit your documents for HR
        to verify. Once verified, your details are locked. To change anything afterwards, use
        &ldquo;Request update&rdquo; and wait for HR to unlock the form.
      </p>
    </div>
  )
}
