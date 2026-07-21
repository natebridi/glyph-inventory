// Shared so the variant controls and the filter panel stay visually identical.
export default function CheckboxRow({
  checked, onChange, label, count, disabled,
  disabledTitle = 'not present in this typeface',
}) {
  return (
    <label
      title={disabled ? `${label} — ${disabledTitle}` : undefined}
      className={`flex items-center gap-2 py-1 text-xs select-none
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="shrink-0 w-3.5 h-3.5 accent-accent border-border-strong disabled:opacity-40"
      />
      <span className={`flex-1 min-w-0 truncate ${disabled ? 'text-content-muted' : 'text-content-secondary'}`}>
        {label}
      </span>
      {count != null && (
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-content-muted">
          {count.toLocaleString()}
        </span>
      )}
    </label>
  )
}
