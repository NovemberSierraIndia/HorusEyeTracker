export function EyeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main eye shape */}
      <path
        d="M8 28C8 28 18 14 36 14C54 14 58 28 58 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8 28C8 28 18 42 36 42C54 42 58 28 58 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Iris / pupil */}
      <circle cx="36" cy="28" r="7" fill="currentColor" />
      <circle cx="36" cy="28" r="3.5" fill="currentColor" opacity="0.4" />
      {/* Eyebrow / ceremonial arch */}
      <path
        d="M12 22C12 22 22 8 38 8C52 10 56 22 56 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Teardrop / vertical line (Wadjet marking) */}
      <path
        d="M36 42L36 56"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Spiral at bottom of teardrop */}
      <path
        d="M36 56C36 56 30 54 30 50C30 46 36 46 36 50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tail / horizontal extension (left side) */}
      <path
        d="M8 28C8 28 4 32 2 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Inner corner decorative mark */}
      <path
        d="M8 28L12 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
