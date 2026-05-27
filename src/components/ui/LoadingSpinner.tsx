export default function LoadingSpinner({ size = 40, label = 'Loading...' }: { size?: number; label?: string }) {
  return (
    <div className="spinner-wrapper" role="status" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="spinner-svg"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="16" stroke="var(--border)" strokeWidth="3" />
        <path
          d="M20 4a16 16 0 0 1 16 16"
          stroke="url(#spinnerGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinnerGrad" x1="20" y1="4" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c6ff7" />
            <stop offset="1" stopColor="#ff6b6b" />
          </linearGradient>
        </defs>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
