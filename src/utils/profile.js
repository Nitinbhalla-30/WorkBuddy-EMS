// Helpers for the employee onboarding profile:
// a blank profile factory, simple validators for Indian IDs, and status labels.

import { DOCUMENT_TYPES } from '../data/sampleData.js'

// A fresh, empty profile for a new employee.
export function blankProfile(employeeId) {
  const documents = {}
  for (const d of DOCUMENT_TYPES) documents[d.key] = []
  return {
    employeeId,
    status: 'draft',        // draft | submitted | verified | returned
    updatedOn: '',
    submittedOn: '',
    reviewedBy: '',
    reviewedOn: '',
    reviewNote: '',
    personal: {
      fullName: '',
      dob: '',
      address: '',
      contactNumber: '',
      emergencyName: '',
      emergencyRelation: '',
      emergencyContact: '',
      aadhaar: '',
      pan: '',
      homeGate: '',
      pickupPoint: null,        // { lat, lng } map point for cab pickup
      dropPoint: null,          // { lat, lng } map point for cab drop
      dropSameAsPickup: true    // drop point is same as pickup by default
    },
    bank: {
      accountNumber: '',
      ifsc: '',
      bankName: ''
    },
    statutory: {
      uan: '',
      esicApplicable: false,
      esic: '',
      nomineeName: '',
      nomineeRelation: '',
      nomineeShare: ''
    },
    documents
  }
}

// ---- validators (light-touch, just enough to catch typos) ----

export function isValidPan(v) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(v || '').trim().toUpperCase())
}

export function isValidAadhaar(v) {
  return /^\d{12}$/.test(String(v || '').replace(/\s/g, ''))
}

export function isValidIfsc(v) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(v || '').trim().toUpperCase())
}

export function isValidPhone(v) {
  return /^\d{10}$/.test(String(v || '').replace(/\D/g, ''))
}

// Count how many document files a profile has for a given type.
export function docCount(profile, key) {
  const list = profile.documents && profile.documents[key]
  return Array.isArray(list) ? list.length : 0
}

// Check everything needed before the employee can submit.
// Returns an array of problem messages (empty means good to go).
export function validateForSubmit(profile) {
  const problems = []
  const p = profile.personal

  if (!p.fullName.trim()) problems.push('Full name is required.')
  if (!p.dob) problems.push('Date of birth is required.')
  if (!p.address.trim()) problems.push('Address is required.')
  if (!isValidPhone(p.contactNumber)) problems.push('Contact number must be 10 digits.')
  if (!p.emergencyName.trim()) problems.push('Emergency contact name is required.')
  if (!isValidPhone(p.emergencyContact)) problems.push('Emergency contact number must be 10 digits.')
  if (!isValidAadhaar(p.aadhaar)) problems.push('Aadhaar must be 12 digits.')
  if (!isValidPan(p.pan)) problems.push('PAN must look like ABCDE1234F.')

  const b = profile.bank
  if (!b.accountNumber.trim()) problems.push('Bank account number is required.')
  if (!isValidIfsc(b.ifsc)) problems.push('IFSC code looks wrong (e.g. HDFC0001234).')

  const s = profile.statutory
  if (s.esicApplicable && !s.esic.trim()) problems.push('ESIC number is required when ESIC applies.')
  if (!s.nomineeName.trim()) problems.push('PF nominee name is required.')

  for (const d of DOCUMENT_TYPES) {
    if (d.required && docCount(profile, d.key) === 0) {
      problems.push(`Please upload: ${d.label}.`)
    }
  }

  return problems
}

// ---- status display ----

export function profileStatusLabel(status) {
  if (status === 'verified') return 'Verified'
  if (status === 'submitted') return 'Submitted (awaiting review)'
  if (status === 'returned') return 'Returned for correction'
  return 'Not submitted'
}

export function profileStatusTagClass(status) {
  if (status === 'verified') return 'tag-ok'
  if (status === 'submitted') return 'tag-late'
  if (status === 'returned') return 'tag-high'
  return 'tag-absent'
}

// Employee can edit only when it is a draft or was returned.
export function isEditable(status) {
  return status === 'draft' || status === 'returned'
}

// Turn bytes into a short, friendly size like "120 KB".
export function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
