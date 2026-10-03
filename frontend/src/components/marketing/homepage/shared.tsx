import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import styles from "./homepage.module.css";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`${styles.brand} ${small ? styles.brandSmall : ""}`}>
      <span className={styles.logoMark} aria-hidden="true" />
      MedGuide AI
    </span>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}
export function Action({
  children,
  href = "/login",
  secondary = false,
  compact = false,
}: {
  children: ReactNode;
  href?: string;
  secondary?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${styles.action} ${secondary ? styles.secondary : ""} ${compact ? styles.compact : ""}`}
    >
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
/** Photographic regions of the user-provided reference, never a page screenshot overlay. */
export function ReferenceDetail({
  x,
  y,
  width,
  height,
  className = "",
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
  label?: string;
}) {
  const region = {
    "--detail-ratio": `${width} / ${height}`,
    "--detail-size": `${(1024 / width) * 100}% ${(1536 / height) * 100}%`,
    "--detail-position": `${(x / (1024 - width)) * 100}% ${(y / (1536 - height)) * 100}%`,
  } as CSSProperties;
  return (
    <div
      style={region}
      className={`${styles.referenceDetail} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** Reuse the homepage photographic foliage as a quiet page-edge detail. */
export function BotanicalDetail() {
  return <ReferenceDetail x={0} y={1040} width={60} height={155} className={styles.botanicalDetail} />;
}
