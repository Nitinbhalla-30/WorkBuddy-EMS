import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSettings } from '../data/store.js'
import CinematicThemeSwitcher from '../components/ui/cinematic-theme-switcher.tsx'

// Simple login for the test phase: Employee ID + PIN.
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const settings = getSettings()

  const [id, setId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const err = login(id, pin)
    if (err) {
      setError(err)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-head">
          <h1 className="login-brand">WorkBuddy - {settings.companyName}</h1>
          <div className="cinematic-theme-switcher-wrap cinematic-theme-switcher-wrap--login">
            <CinematicThemeSwitcher />
          </div>
        </div>
        <p className="login-sub">Please log in to continue</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>WorkBuddy ID</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. EMP001 or DRV01"
              autoFocus
            />
          </label>

          <label className="field">
            <span>PIN</span>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Your PIN"
            />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit">
            Log in
          </button>
        </form>

        <div className="login-help">
          <strong>Test logins:</strong>
          <ul>
            <li>Employee &mdash; <code>EMP001</code> / PIN <code>1111</code></li>
            <li>HR / Admin &mdash; <code>ADM001</code> / PIN <code>0000</code></li>
            <li>IT Support &mdash; <code>IT001</code> / PIN <code>5555</code></li>
            <li>Driver &mdash; <code>DRV01</code> / PIN <code>1234</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
