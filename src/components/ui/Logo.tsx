import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Show full logo with "PREMIER PROPERTY GROUP" text */
  variant?: "full" | "compact";
  /** Override height in pixels */
  height?: number;
  className?: string;
}

/**
 * G|C Premier Property Group logo.
 *
 * Uses the original high-quality PNG (1511×200, transparent bg).
 * The logo has dark text on transparent background, displaying
 * correctly on the light site background without any CSS filter.
 */
export default function Logo({
  variant = "compact",
  height = 36,
  className = "",
}: LogoProps) {
  // Original PNG aspect ratio: 1511 / 200 ≈ 7.555
  const ASPECT = 7.555;

  if (variant === "full") {
    // Full logo for footer — show at given height
    const w = Math.round(height * ASPECT);
    return (
      <Link
        href="/"
        className={`inline-flex items-center ${className}`}
        aria-label="G|C Premier Property Group — Home"
      >
        <Image
          src="/images/gc-logo.png"
          alt="G|C Premier Property Group"
          width={w}
          height={height}
          className="logo-dark-theme"
          priority
        />
      </Link>
    );
  }

  // Compact logo for navbar — same image, sized to fit
  const w = Math.round(height * ASPECT);
  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="G|C Premier Property Group — Home"
    >
      <Image
        src="/images/gc-logo.png"
        alt="G|C Premier Property Group"
        width={w}
        height={height}
        className="logo-dark-theme"
        priority
      />
    </Link>
  );
}
