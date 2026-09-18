import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Loader2 } from 'lucide-react'
import { supabase, supabaseEnabled } from '../data/supabaseClient.js'
import AnimatedThemeToggle from '../components/ui/animated-theme-toggle.tsx'

// Landing page for the "forgot password" email link. Supabase arrives here with
// a recovery token in the URL and (with detectSessionInUrl) establishes a
// session automatically; we wait for that, then let the user set a new password.
export default function ResetPassword() {
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!supabaseEnabled) return
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setReady(true)
      }
    })
    // The session may already be present by the time this mounts.
    supabase.auth.getSession().then(({ data: s }) => { if (s?.session) setReady(true) })
    return () => data?.subscription?.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (pw.length < 8) { setError('The password must be at least 8 characters.'); return }
    if (pw !== confirm) { setError('The passwords do not match.'); return }
    setBusy(true)
    const { error: updateErr } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (updateErr) { setError(updateErr.message || 'Could not reset the password.'); return }
    setDone(true)
    setTimeout(() => navigate('/login', { replace: true }), 1500)
  }

  return (
    <div className="login-page login-fade-in" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="login-card" style={{ width: 'min(440px, 92vw)' }}>
        <div className="login-card-head">
          <h2 className="login-brand">
            <span className="brand-mark" aria-hidden="true"><Briefcase size={16} strokeWidth={2.25} /></span>
            {' '}Reset your password
          </h2>
          <div className="theme-toggle-wrap"><AnimatedThemeToggle /></div>
        </div>

        {done ? (
          <p className="hint first">Your password has been updated. Taking you to the login screen…</p>
        ) : !ready ? (
          <p className="hint first" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Checking your reset link… If this takes too long, the link may have expired — request a new one from the login screen.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="hint first">Enter a new password for your account.</p>
            <label className="field">
              <span>New password</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required autoFocus />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </label>
            {error && <div className="error-box">{error}</div>}
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
