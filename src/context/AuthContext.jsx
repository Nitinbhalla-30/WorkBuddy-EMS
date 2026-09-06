// Keeps track of who is logged in. Very simple for this test phase:
// an ID + PIN. Real, secure login will come in a later phase.

import { createContext, useContext, useEffect, useState } from 'react'
import { getEmployeeById, getDriverById, initStore, whenDataReady } from '../data/store.js'

const AuthContext = createContext(null)

const SESSION_KEY      = 'hr_session_user_id'
const SESSION_ROLE_KEY = 'hr_session_role'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Load the store first (from Supabase when configured), then restore
    // the saved session. initStore resolves as soon as the small login
    // snapshot is in memory; the rest of the data keeps loading behind it.
    initStore().then(() => {
      if (cancelled) return
      const savedId   = localStorage.getItem(SESSION_KEY)
      const savedRole = localStorage.getItem(SESSION_ROLE_KEY)
      if (savedId) {
        if (savedRole === 'driver') {
          const found = getDriverById(savedId)
          if (found) setUser({ ...found, role: 'driver' })
        } else {
          const found = getEmployeeById(savedId)
          if (found) {
            // IT staff get admin-like access
            const role = found.role === 'it' ? 'admin' : found.role
            setUser({ ...found, role })
          }
        }
      }
      setReady(true)
    })
    // Screens that need the complete dataset wait on this instead of `ready`.
    whenDataReady().then(() => { if (!cancelled) setDataReady(true) })
    return () => { cancelled = true }
  }, [])

  // Try to log in with an ID and PIN. Returns an error message or null.
  function login(id, pin) {
    const cleanId  = (id  || '').trim().toUpperCase()
    const cleanPin = (pin || '').trim()

    // Check employees (includes admin and IT staff)
    const emp = getEmployeeById(cleanId)
    if (emp) {
      if (emp.pin !== cleanPin) return 'The PIN is not correct.'
      // IT staff get admin-like access for IT Help Desk
      const role = emp.role === 'it' ? 'admin' : emp.role
      setUser({ ...emp, role })
      localStorage.setItem(SESSION_KEY, emp.id)
      localStorage.setItem(SESSION_ROLE_KEY, role)
      return null
    }

    // Check drivers
    const drv = getDriverById(cleanId)
    if (drv) {
      if (!drv.pin) return 'No PIN set for this driver. Please contact HR.'
      if (drv.pin !== cleanPin) return 'The PIN is not correct.'
      const driverUser = { ...drv, role: 'driver' }
      setUser(driverUser)
      localStorage.setItem(SESSION_KEY, drv.id)
      localStorage.setItem(SESSION_ROLE_KEY, 'driver')
      return null
    }

    return 'No account found with that ID.'
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_ROLE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, ready, dataReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
