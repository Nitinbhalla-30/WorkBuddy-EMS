import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSettings } from '../data/store.js'

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
        <h1 className="login-brand">WorkBuddy - {settings.companyName}</h1>
        <p className="login-sub">Please log in to continue</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Employee ID</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. EMP001"
              autoFocus
            />
          </label>

          <label className="field">
            <span>PIN</span>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-digit PIN"
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
            <li>Employee — <code>EMP001</code> / PIN <code>1111</code></li>
            <li>HR / Admin — <code>ADM001</code> / PIN <code>0000</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
