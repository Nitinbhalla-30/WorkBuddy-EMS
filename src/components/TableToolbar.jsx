export default function TableToolbar({
  search,
  onSearchChange,
  showSearch = true,
  showing,
  total,
  startIndex,
  endIndex,
  placeholder = 'Search table...',
  filters = [],
  onFilterChange,
  children
}) {
  const countLabel = (() => {
    if (!total) return 'No items'
    if (startIndex != null && endIndex != null) {
      return `Showing ${startIndex}–${endIndex} of ${total}`
    }
    return `Showing ${showing ?? total} of ${total}`
  })()

  return (
    <div className="table-toolbar">
      <div className="table-toolbar-left">
        {showSearch && onSearchChange && (
          <label className="table-toolbar-field table-toolbar-search">
            <span className="table-toolbar-label">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
            />
          </label>
        )}
        {filters.map((f) => (
          <label key={f.key} className="table-toolbar-field table-toolbar-filter">
            <span className="table-toolbar-label">{f.label}</span>
            <select
              value={f.value || 'all'}
              onChange={(e) => onFilterChange(f.key, e.target.value)}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        ))}
        {children}
      </div>
      <span className="muted small table-toolbar-count">
        {countLabel}
      </span>
    </div>
  )
}
