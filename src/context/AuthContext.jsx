// Keeps track of who is logged in. Very simple for this test phase:
// an ID + PIN. Real, secure login will come in a later phase.

import { createContext, useContext, useEffect, useState } from 'react'
import { getEmployeeById, seedIfEmpty } from '../data/store.js'

const AuthContext = createContext(null)

const SESSION_KEY = 'hr_session_user_id'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedIfEmpty()
    const savedId = localStorage.getItem(SESSION_KEY)
    if (savedId) {
      const found = getEmployeeById(savedId)
      if (found) setUser(found)
    }
    setReady(true)
  }, [])

  // Try to log in with an ID and PIN. Returns an error message or null.
  function login(id, pin) {
    const found = getEmployeeById((id || '').trim().toUpperCase())
    if (!found) return 'No employee found with that ID.'
    if (found.pin !== (pin || '').trim()) return 'The PIN is not correct.'
    setUser(found)
    localStorage.setItem(SESSION_KEY, found.id)
    return null
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
