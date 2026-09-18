// Keeps track of who is logged in. Two modes coexist while we migrate to real
// authentication:
//   - Supabase Auth (email + password, verified on Supabase's server) for
//     employee accounts flagged `authEnabled`.
//   - The legacy ID + PIN check for everyone else (drivers and staff who have
//     not been migrated yet).
// Accounts are moved over one at a time; once all are migrated the PIN path and
// its localStorage session go away.

import { createContext, useContext, useEffect, useState } from 'react'
import { getEmployeeById, getEmployees, getDriverById, initStore, isEmployeeActive, whenDataReady } from '../data/store.js'
import { supabase, supabaseEnabled } from '../data/supabaseClient.js'

const AuthContext = createContext(null)

const SESSION_KEY      = 'hr_session_user_id'
const SESSION_ROLE_KEY = 'hr_session_role'

// IT staff get admin-like access so they can reach the help desk.
function roleFor(emp) {
  return emp.role === 'it' ? 'admin' : emp.role
}

// Find the employee record that owns a Supabase auth email.
function findEmployeeByEmail(email) {
  if (!email) return null
  const needle = email.trim().toLowerCase()
  return getEmployees().find((e) => (e.email || '').trim().toLowerCase() === needle) || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Turn a Supabase auth user into the app's user object. Returns true when a
    // matching, active employee was found and applied.
    function applySupabaseUser(sbUser) {
      const emp = findEmployeeByEmail(sbUser?.email)
      if (emp && isEmployeeActive(emp)) {
        setUser({ ...emp, role: roleFor(emp) })
        return true
      }
      return false
    }

    initStore().then(async () => {
      if (cancelled) return

      // Prefer a real Supabase session when one exists.
      if (supabaseEnabled) {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user && applySupabaseUser(data.session.user)) {
          setReady(true)
          return
        }
      }

      // Otherwise restore the legacy saved session (PIN users and drivers).
      const savedId   = localStorage.getItem(SESSION_KEY)
      const savedRole = localStorage.getItem(SESSION_ROLE_KEY)
      if (savedId) {
        if (savedRole === 'driver') {
          const found = getDriverById(savedId)
          if (found) setUser({ ...found, role: 'driver' })
        } else {
          const found = getEmployeeById(savedId)
          if (found && isEmployeeActive(found)) {
            setUser({ ...found, role: roleFor(found) })
          }
        }
      }
      setReady(true)
    })

    // Screens that need the complete dataset wait on this instead of `ready`.
    whenDataReady().then(() => { if (!cancelled) setDataReady(true) })

    // Stay in sync with Supabase auth events: sign-out elsewhere, password
    // recovery, and token refresh.
    let sub
    if (supabaseEnabled) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return
        if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem(SESSION_KEY)
          localStorage.removeItem(SESSION_ROLE_KEY)
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
          applySupabaseUser(session.user)
        }
      })
      sub = data?.subscription
    }

    return () => { cancelled = true; sub?.unsubscribe() }
  }, [])

  // Log in. Returns an error message string, or null on success.
  async function login(id, password) {
    const cleanId = (id || '').trim().toUpperCase()
    const cleanPw = (password || '').trim()

    const emp = getEmployeeById(cleanId)

    // Real authentication for migrated employee accounts.
    if (emp && emp.authEnabled && supabaseEnabled) {
      if (!isEmployeeActive(emp)) return 'This account has been deactivated. Please contact HR.'
      if (!emp.email) return 'This account has no email on file. Please contact HR.'
      const { error } = await supabase.auth.signInWithPassword({ email: emp.email, password: cleanPw })
      if (error) {
        return error.message === 'Invalid login credentials'
          ? 'The password is not correct.'
          : (error.message || 'Login failed. Please try again.')
      }
      // Success. onAuthStateChange also applies the user; drop any stale legacy
      // session so the two mechanisms never disagree.
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_ROLE_KEY)
      setUser({ ...emp, role: roleFor(emp) })
      return null
    }

    // Legacy employee PIN.
    if (emp) {
      if (!isEmployeeActive(emp)) return 'This account has been deactivated. Please contact HR.'
      if (emp.pin !== cleanPw) return 'The PIN is not correct.'
      setUser({ ...emp, role: roleFor(emp) })
      localStorage.setItem(SESSION_KEY, emp.id)
      localStorage.setItem(SESSION_ROLE_KEY, roleFor(emp))
      return null
    }

    // Legacy driver PIN.
    const drv = getDriverById(cleanId)
    if (drv) {
      if (!drv.pin) return 'No PIN set for this driver. Please contact HR.'
      if (drv.pin !== cleanPw) return 'The PIN is not correct.'
      setUser({ ...drv, role: 'driver' })
      localStorage.setItem(SESSION_KEY, drv.id)
      localStorage.setItem(SESSION_ROLE_KEY, 'driver')
      return null
    }

    return 'No account found with that ID.'
  }

  async function logout() {
    if (supabaseEnabled) {
      try { await supabase.auth.signOut() } catch { /* ignore network hiccups */ }
    }
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
