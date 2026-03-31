import Image from "next/image";

export function EyeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/icons/Eye-of-Horus.webp"
      alt="Eye of Horus"
      width={64}
      height={64}
      className={className}
      unoptimized
    />
  );
}
