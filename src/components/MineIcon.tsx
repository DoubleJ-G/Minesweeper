export function MineIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden
      data-testid="mine-icon"
    >
      <g stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round">
        <line x1="10" y1="1.5" x2="10" y2="4.5" />
        <line x1="10" y1="15.5" x2="10" y2="18.5" />
        <line x1="1.5" y1="10" x2="4.5" y2="10" />
        <line x1="15.5" y1="10" x2="18.5" y2="10" />
        <line x1="3.5" y1="3.5" x2="5.6" y2="5.6" />
        <line x1="16.5" y1="3.5" x2="14.4" y2="5.6" />
        <line x1="3.5" y1="16.5" x2="5.6" y2="14.4" />
        <line x1="16.5" y1="16.5" x2="14.4" y2="14.4" />
      </g>
      <circle cx="10" cy="10" r="5.5" fill="#1e293b" />
      <circle cx="8" cy="8" r="1.8" fill="white" opacity="0.35" />
    </svg>
  );
}
