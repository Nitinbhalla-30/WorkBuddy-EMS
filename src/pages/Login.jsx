import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSettings, getEmployeeById } from '../data/store.js'
import { supabase, supabaseEnabled } from '../data/supabaseClient.js'
import { Clock, CheckCircle2, Megaphone, User, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Loader2, Briefcase } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedThemeToggle from '../components/ui/animated-theme-toggle.tsx'
import Modal from '../components/Modal.jsx'

// Simple login for the test phase: Employee ID + PIN.
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const settings = getSettings()

  const [id, setId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [remember, setRemember] = useState(false)
  const [showForgotPin, setShowForgotPin] = useState(false)
  const [forgotId, setForgotId] = useState('')
  const [forgotBusy, setForgotBusy] = useState(false)
  const [forgotMsg, setForgotMsg] = useState(null)

  const shouldReduceMotion = useReducedMotion()

  const formPanelRef = useRef(null)
  const idInputRef = useRef(null)
  const pinInputRef = useRef(null)
  const pinToggleRef = useRef(null)
  const rememberRef = useRef(null)
  const forgotPinRef = useRef(null)
  const loginBtnRef = useRef(null)

  // Focus trap: Tab cycles within ID → PIN → Eye → Remember me → Forgot PIN → Log in
  useEffect(() => {
    const focusable = () =>
      [idInputRef.current, pinInputRef.current, pinToggleRef.current, rememberRef.current, forgotPinRef.current, loginBtnRef.current].filter(Boolean)

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return
      // Only trap when focus is inside the login form panel
      if (!formPanelRef.current?.contains(document.activeElement)) return

      const els = focusable()
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await login(id, pin)
    if (err) {
      setError(err)
      setLoading(false)
      return
    }
    if (remember) {
      localStorage.setItem('hr_remember_id', id)
    } else {
      localStorage.removeItem('hr_remember_id')
    }
    navigate('/', { replace: true })
  }

  function openForgot() {
    setForgotId(id)
    setForgotMsg(null)
    setShowForgotPin(true)
  }

  async function handleForgot() {
    const cleanId = (forgotId || '').trim().toUpperCase()
    setForgotMsg(null)
    if (!cleanId) {
      setForgotMsg({ type: 'error', text: 'Enter your EmployeeForce ID so we can find your account.' })
      return
    }
    const emp = getEmployeeById(cleanId)
    // Migrated accounts recover by email; everyone else still goes through HR.
    if (emp && emp.authEnabled && emp.email && supabaseEnabled) {
      setForgotBusy(true)
      const { error } = await supabase.auth.resetPasswordForEmail(emp.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      setForgotBusy(false)
      if (error) {
        setForgotMsg({ type: 'error', text: error.message || 'Could not send the reset link.' })
        return
      }
      setForgotMsg({ type: 'success', text: 'If that account has a password login, a reset link is on its way to the email on file.' })
      return
    }
    setForgotMsg({ type: 'info', text: 'This account still uses a PIN. Please contact your HR Administrator or Reporting Manager to have it reset from the Profiles section.' })
  }

  return (
    <div className="login-page login-fade-in">
      <div className="login-brand-panel">
        <div className="login-brand-logo">
          <span className="brand-mark brand-mark--lg" aria-hidden="true">
            <Briefcase size={18} strokeWidth={2.25} />
          </span>
          EmployeeForce
        </div>
        <div>
          <h1 className="login-brand-headline">Everything your team needs, in one place.</h1>
          <p className="login-brand-sub">
            Attendance, leaves, salaries, tasks and more — managed without the busywork.
          </p>
          <ul className="login-brand-points">
            <li><Clock className="login-point-icon" /> Track attendance and leaves in real time</li>
            <li><CheckCircle2 className="login-point-icon" /> Approvals and reimbursements without emails</li>
            <li><Megaphone className="login-point-icon" /> Tasks, announcements and team updates</li>
          </ul>
        </div>
        <div className="login-brand-footer">{settings.companyName}</div>
      </div>

      {/* Compact brand header for mobile */}
      <div className="login-brand-compact">
        <span className="brand-mark brand-mark--lg" aria-hidden="true">
          <Briefcase size={18} strokeWidth={2.25} />
        </span>
        <span className="login-brand-compact-name">EmployeeForce</span>
      </div>

      <div className="login-form-panel" ref={formPanelRef}>
        <div className="login-card">
          <div className="login-card-head">
            <h2 className="login-brand">Welcome back</h2>
            <div className="theme-toggle-wrap">
              <AnimatedThemeToggle />
            </div>
          </div>
          <p className="login-sub">Log in to EmployeeForce — {settings.companyName}</p>

          <form onSubmit={handleSubmit}>
            <label className="field field-icon-field">
              <span>EmployeeForce ID</span>
              <div className="field-icon-row">
                <User className="field-ico" size={16} />
                <input
                  ref={idInputRef}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter your EmployeeForce ID"
                  autoFocus
                />
              </div>
            </label>

            <label className="field field-icon-field">
              <span>PIN</span>
              <div className="field-icon-row field-icon-row--pin">
                <Lock className="field-ico" size={16} />
                <input
                  ref={pinInputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                />
                <button
                  ref={pinToggleRef}
                  type="button"
                  className="login-pin-toggle"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <div className="login-remember-row">
              <label className="login-remember-label">
                <input
                  ref={rememberRef}
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="login-remember-checkmark" />
                Remember me
              </label>
              <button
                ref={forgotPinRef}
                type="button"
                className="login-forgot-pin"
                onClick={openForgot}
              >
                Forgot PIN or password?
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <motion.button
              ref={loginBtnRef}
              className="btn btn-primary btn-block login-btn"
              type="submit"
              disabled={loading}
              whileHover={!loading && !shouldReduceMotion ? { scale: 1.02 } : {}}
              whileTap={!loading && !shouldReduceMotion ? { scale: 0.97 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {loading ? (
                <><Loader2 className="login-btn-spinner" size={16} /> Signing in...</>
              ) : (
                'Log in'
              )}
            </motion.button>
          </form>

          <div className="login-help">
            <button
              type="button"
              className="login-demo-toggle"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDemo ? 'Hide' : 'Show'} demo accounts
            </button>
            {showDemo && (
              <ul>
                <li>Employee &mdash; <code>EMP001</code> / PIN <code>1111</code></li>
                <li>HR / Admin &mdash; <code>ADM001</code> / password login</li>
                <li>IT Support &mdash; <code>IT001</code> / PIN <code>5555</code></li>
                <li>Driver &mdash; <code>DRV01</code> / PIN <code>1234</code></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {showForgotPin && (
        <Modal onClose={() => setShowForgotPin(false)} title="Reset your access">
          <div className="modal-form">
            <p className="hint first">
              Enter your EmployeeForce ID. If your account uses a password, we'll email a secure link to set a new one.
            </p>
            <label className="field">
              <span>EmployeeForce ID</span>
              <input
                value={forgotId}
                onChange={(e) => setForgotId(e.target.value)}
                placeholder="e.g. ADM001"
                autoFocus
              />
            </label>
            {forgotMsg && (
              forgotMsg.type === 'error'
                ? <div className="error-box">{forgotMsg.text}</div>
                : <p className="hint">{forgotMsg.text}</p>
            )}
            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleForgot}
                disabled={forgotBusy}
              >
                {forgotBusy ? 'Sending…' : 'Send reset link'}
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowForgotPin(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
