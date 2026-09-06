// Supabase client for the whole app. Values come from the local .env file
// (see .env.example). When they are missing the app falls back to the old
// localStorage-only mode so development without a backend still works.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

// True when a Supabase project is configured.
export const supabaseEnabled = Boolean(supabase)
