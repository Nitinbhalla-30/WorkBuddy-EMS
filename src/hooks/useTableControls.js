import { useMemo, useState } from 'react'
import { compareValues } from '../utils/tableControls.js'

export function useTableControls(items, options = {}) {
  const {
    getSearchText = () => '',
    getSortValue = (item, key) => item[key],
    initialSortKey = null,
    initialSortDir = 'desc',
    filterFns = {}
  } = options

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(initialSortKey)
  const [sortDir, setSortDir] = useState(initialSortDir)
  const [filters, setFilters] = useState({})

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const rows = useMemo(() => {
    let list = [...items]
    const q = search.trim().toLowerCase()

    if (q) {
      list = list.filter((item) => getSearchText(item).toLowerCase().includes(q))
    }

    for (const [key, val] of Object.entries(filters)) {
      if (!val || val === 'all') continue
      const fn = filterFns[key]
      if (fn) {
        list = list.filter((item) => fn(item, val))
      } else {
        list = list.filter((item) => String(getSortValue(item, key)) === String(val))
      }
    }

    if (sortKey) {
      list.sort((a, b) =>
        compareValues(getSortValue(a, sortKey), getSortValue(b, sortKey), sortDir)
      )
    }

    return list
  }, [items, search, sortKey, sortDir, filters, getSearchText, getSortValue, filterFns])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return {
    rows,
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    filters,
    setFilter,
    total: items.length,
    count: rows.length
  }
}
