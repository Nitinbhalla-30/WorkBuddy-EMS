// Reusable styled dropdown used inside form `.field` blocks. Wraps a native
// <select> so it inherits the app's field styling, keyboard access, and dark
// mode for free. Unlike a raw <select>, onChange receives the selected value
// directly (not the event), which is what the call sites expect.
export default function DropdownSelect({
  value,
  options = [],
  onChange,
  ariaLabel,
  disabled = false,
  id,
  name
}) {
  return (
    <select
      id={id}
      name={name}
      className="dropdown-select"
      value={value ?? ''}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
