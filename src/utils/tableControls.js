export function compareValues(a, b, dir = 'asc') {
  const mult = dir === 'desc' ? -1 : 1
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * mult
  }

  const sa = String(a)
  const sb = String(b)
  if (/^\d{4}-\d{2}-\d{2}/.test(sa) && /^\d{4}-\d{2}-\d{2}/.test(sb)) {
    return sa.localeCompare(sb) * mult
  }

  return sa.localeCompare(sb, undefined, { sensitivity: 'base' }) * mult
}
