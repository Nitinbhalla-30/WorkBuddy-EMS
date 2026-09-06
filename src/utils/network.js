// The "office internet address" check.
//
// Idea: when a computer is on the office Wi-Fi, its public internet address
// (IP) belongs to the office. We compare the current address with the office
// address saved by the admin. If they match, the person is in the office.
//
// For testing at home, there is a "pretend on office network" switch in
// Settings. Turn it OFF in the real office once the office address is set.

import { getSettings } from '../data/store.js'

// Ask a public service what this computer's internet address is.
// Returns the address text, or null if it could not be found.
export async function fetchPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store'
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.ip || null
  } catch {
    return null
  }
}

// Decide if attendance marking should be allowed right now.
// Returns { allowed: boolean, reason: string, currentIp: string|null }
export async function checkOfficeNetwork() {
  const settings = getSettings()

  // Test mode: always allow, but say so clearly.
  if (settings.pretendOnOfficeNetwork) {
    return {
      allowed: true,
      reason: 'Test mode is ON (office-internet check is skipped).',
      currentIp: null
    }
  }

  // If the office address is not set yet, we cannot check.
  if (!settings.officeIp) {
    return {
      allowed: false,
      reason: 'Office internet address is not set. Ask HR/Admin to set it in Settings.',
      currentIp: null
    }
  }

  const currentIp = await fetchPublicIp()
  if (!currentIp) {
    return {
      allowed: false,
      reason: 'Could not read the internet address. Please check your connection.',
      currentIp: null
    }
  }

  if (currentIp === settings.officeIp.trim()) {
    return {
      allowed: true,
      reason: 'You are on the office internet.',
      currentIp
    }
  }

  return {
    allowed: false,
    reason: 'You are not on the office internet, so attendance is blocked.',
    currentIp
  }
}
