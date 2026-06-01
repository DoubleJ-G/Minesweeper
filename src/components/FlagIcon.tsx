export function FlagIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden
      data-testid="flag-icon"
    >
      <line
        x1="6"
        y1="2.5"
        x2="6"
        y2="17.5"
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="4.5"
        y1="17.5"
        x2="7.5"
        y2="17.5"
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polygon points="6,2.5 15.5,6.5 6,10.5" fill="#ef4444" />
    </svg>
  );
}
