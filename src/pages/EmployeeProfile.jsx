import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getProfileForEmployee,
  saveProfileDraft,
  submitProfile
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { isEditable, profileStatusLabel, profileStatusTagClass } from '../utils/profile.js'
import ProfileWizard from '../components/ProfileWizard.jsx'
import ProfileView from '../components/ProfileView.jsx'

// The employee's own onboarding form. Shows the wizard while editable,
// and a locked read-only view once submitted or verified.
export default function EmployeeProfile() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)

  const profile = useMemo(() => {
    const found = getProfileForEmployee(user.id)
    // Pre-fill the name for a brand new form.
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

  const editable = isEditable(profile.status)

  return (
    <div>
      <div className="page-head">
        <h2>My Details</h2>
        <span className={`tag ${profileStatusTagClass(profile.status)}`}>
          {profileStatusLabel(profile.status)}
        </span>
      </div>

      {editable ? (
        <>
          {profile.status === 'draft' && (
            <p className="hint first">
              Welcome! Please fill in your details and upload your documents. You
              can save a draft and finish later. Submit when everything is ready.
            </p>
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
              Everything is in order.
            </div>
          )}
          <div className="card">
            <ProfileView profile={profile} />
          </div>
        </>
      )}
    </div>
  )
}
