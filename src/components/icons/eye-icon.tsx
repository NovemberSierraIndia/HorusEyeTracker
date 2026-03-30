export function EyeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="16"
        cy="16"
        rx="12"
        ry="8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" className="opacity-50" />
      <path
        d="M4 16C4 16 9 8 16 8C23 8 28 16 28 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 16C4 16 9 24 16 24C23 24 28 16 28 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
