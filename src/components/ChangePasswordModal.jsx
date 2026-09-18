import { useState } from 'react'
import { X } from 'lucide-react'
import Modal from './Modal.jsx'
import Toast from './Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../data/supabaseClient.js'

// Lets a migrated (Supabase Auth) user change their own password. The current
// password is re-verified by signing in again before the update, so a stolen,
// already-open session can't silently rotate the password.
export default function ChangePasswordModal({ onClose }) {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!user?.email) {
      setError('This account has no email on file. Please contact HR.')
      return
    }
    if (next.length < 8) {
      setError('The new password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    setBusy(true)
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current })
    if (verifyErr) {
      setBusy(false)
      setError('Your current password is not correct.')
      return
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: next })
    setBusy(false)
    if (updateErr) {
      setError(updateErr.message || 'Could not change the password.')
      return
    }
    setToast({ message: 'Password changed successfully.', type: 'success' })
    setTimeout(onClose, 1400)
  }

  return (
    <>
      <Modal onClose={onClose} title="Change password">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 className="section-title first">Change password</h3>
            <button type="button" className="btn btn-tiny btn-light" onClick={onClose} aria-label="Close"><X size={15} /></button>
          </div>
          <p className="hint first">Choose a new password you'll remember. You'll use it the next time you log in.</p>
          <label className="field">
            <span>Current password</span>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error && <div className="error-box">{error}</div>}
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Change password'}
            </button>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  )
}
