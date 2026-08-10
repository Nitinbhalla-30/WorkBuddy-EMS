export default function SortableTh({ label, keyName, sortKey, sortDir, onSort }) {
  const active = sortKey === keyName
  const arrow = active && sortDir === 'desc' ? '▼' : '▲'

  return (
    <th
      className={`th-sortable${active ? ' th-sort-active' : ''}`}
      onClick={() => onSort(keyName)}
    >
      <span className="th-sort-inner">
        <span className="th-sort-label">{label}</span>
        <span
          className={`th-sort-icon${active ? '' : ' th-sort-icon-placeholder'}`}
          aria-hidden="true"
        >
          {arrow}
        </span>
      </span>
    </th>
  )
}
