// Company holiday helpers for leave settings.

export function getObservedCompanyHolidays(companyHolidays, year) {
  const list = companyHolidays || []
  const y = year || new Date().getFullYear()
  return list
    .filter((h) => h.isHoliday && h.date && h.date.startsWith(String(y)))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function isObservedCompanyHoliday(dateKey, companyHolidays) {
  if (!dateKey) return false
  return (companyHolidays || []).some((h) => h.isHoliday && h.date === dateKey)
}
