// Shared helpers for company announcements.
// The announcement screens and the notification feed all classify an
// announcement the same way, so the lookup lives here once.

import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'

// Human label for an announcement type key ('policy' -> 'Policy Update').
// Unknown/missing keys fall back to the raw value so the UI never shows blank.
export function announcementTypeLabel(key) {
  const t = ANNOUNCEMENT_TYPES.find((item) => item.key === key)
  return t ? t.label : key
}

// Status-tag class for the type pill (matches the app-wide tag palette).
export function announcementTypeTagClass(key) {
  switch (key) {
    case 'urgent': return 'tag-high'
    case 'job': return 'tag-medium'
    case 'policy': return 'tag-low'
    case 'event': return 'tag-event'
    default: return 'tag-general'
  }
}
