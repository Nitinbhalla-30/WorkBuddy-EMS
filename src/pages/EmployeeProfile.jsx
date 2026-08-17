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
import { X } from 'lucide-react'

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
        <h2>My Details</h2>
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
              Welcome! Please fill in your details, upload your profile picture, and upload your documents. You
              can save a draft and finish later. Submit when everything is ready.
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
                    Your details are locked after HR verification. Send a request
                    to HR for permission to change anything. After approval, you
                    can edit and submit again for HR to verify.
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
    </div>
  )
}
