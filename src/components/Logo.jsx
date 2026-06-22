export default function Logo({ compact = false }) {
  return (
    <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
      <svg className="brand-mark" viewBox="0 0 42 42" aria-hidden="true">
        <path d="M9 10.5 21 4l12 6.5v9L21 26l-7-3.8v6.3l7 3.8 12-6.5" />
        <path d="M21 12.5 14 16v6.2M21 12.5l7 3.8v6.2L21 26" />
      </svg>
      {!compact && (
        <span className="brand-name">
          <strong>GhostFrame</strong>
          <small>Studios</small>
        </span>
      )}
    </span>
  )
}
