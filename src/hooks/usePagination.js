import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAGE_SIZE, paginate } from '../utils/pagination.js'

export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const result = useMemo(
    () => paginate(items, page, pageSize),
    [items, page, pageSize]
  )

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages)
    }
  }, [page, result.totalPages])

  return { ...result, setPage }
}
