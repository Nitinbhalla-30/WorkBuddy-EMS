import { ArrowDown, ArrowUp } from 'lucide-react'

export default function SortableTh({ label, keyName, sortKey, sortDir, onSort }) {
  const active = sortKey === keyName
  const Arrow = active && sortDir === 'desc' ? ArrowDown : ArrowUp

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
          <Arrow size={12} strokeWidth={2.5} />
        </span>
      </span>
    </th>
  )
}
