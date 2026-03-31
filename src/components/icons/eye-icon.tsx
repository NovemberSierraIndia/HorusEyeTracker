export function EyeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 80"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Eyebrow — thick curved line above the eye */}
      <path
        d="M10 18C10 18 15 8 30 5C45 2 65 4 80 10C85 12 88 16 90 18
           C88 14 85 10 80 7C65 0 45 -2 28 2C15 5 8 14 10 18Z"
        fill="currentColor"
      />

      {/* Upper eyelid */}
      <path
        d="M8 30C8 30 20 14 50 14C75 14 90 26 92 30
           C90 24 75 10 50 10C22 10 10 26 8 30Z"
        fill="currentColor"
      />

      {/* Lower eyelid */}
      <path
        d="M8 30C8 30 22 44 50 44C75 44 90 34 92 30
           C90 36 75 48 50 48C22 48 10 36 8 30Z"
        fill="currentColor"
      />

      {/* Pupil */}
      <ellipse cx="52" cy="30" rx="12" ry="11" fill="currentColor" />

      {/* Inner corner notch / teardrop triangle */}
      <path
        d="M8 30L2 34L14 72L20 68L12 38L8 30Z"
        fill="currentColor"
      />
      {/* Teardrop cutout to create the forked shape */}
      <path
        d="M6 36C6 36 4 42 8 46C12 42 10 36 10 36L8 32L6 36Z"
        fill="currentColor"
        opacity="0"
      />

      {/* Decorative inner corner curve */}
      <path
        d="M8 30C6 32 4 38 6 44C8 40 10 36 8 30Z"
        fill="currentColor"
      />

      {/* Tail — long line from outer corner curving down to spiral */}
      <path
        d="M92 30C92 30 94 34 92 40C88 50 80 58 72 64
           C66 68 60 72 58 74C56 76 56 78 60 78
           C64 78 68 74 70 70C72 66 70 62 66 62
           C62 62 60 64 62 68"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
