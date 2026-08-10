export default function Pagination({
  page,
  totalPages,
  total,
  startIndex,
  endIndex,
  onPageChange
}) {
  if (total === 0) return null

  return (
    <div className="pagination-bar">
      <span className="muted small">
        {totalPages > 1
          ? `Showing ${startIndex}–${endIndex} of ${total}`
          : `${total} item(s)`}
      </span>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="btn btn-tiny btn-light"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className="muted small">Page {page} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-tiny btn-light"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
