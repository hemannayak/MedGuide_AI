"use client";
import { useLanguage } from "@/lib/i18n/context";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall } from "lucide-react";
import styles from "./emergency-banner.module.css";

/**
 * EmergencyBanner: Route-aware emergency access strip.
 *
 * Public pages (/, /about, /how-it-works, /safety):
 *   → Hidden. Emergency accessible via footer + /app/emergency.
 *
 * Patient app (/app/*):
 *   → Compact persistent strip with 108/112 quick-dial.
 *
 * Emergency page (/app/emergency):
 *   → Hidden. The page itself handles full emergency treatment.
 */
export const EmergencyBanner: React.FC<{ withinWorkspace?: boolean }> = ({ withinWorkspace = false }) => {
 const { tr } = useLanguage();

  const pathname = usePathname();

  // Hide entirely on public/marketing pages and on the emergency page itself
  const isPublicPage =
    !pathname?.startsWith("/app") && !pathname?.startsWith("/worker");
  const isEmergencyPage = pathname === "/app/emergency";

  if (isPublicPage || isEmergencyPage || (pathname?.startsWith("/app") && !withinWorkspace)) return null;

  return (
    <div
      role="region"
      aria-label={tr("Emergency Quick Access")}
      className={styles.banner}
    >
      <span className={styles.message}>
        {tr("Life-threatening emergency? Call immediately.")}</span>
      <div className={styles.actions}>
        <a
          href="tel:108"
          className={styles.call}
          aria-label={tr("Call 108 Ambulance")}
        >
          <PhoneCall className="w-3 h-3" aria-hidden="true" />
          {tr("108 Ambulance")}</a>
        <a
          href="tel:112"
          className={styles.call}
          aria-label={tr("Call 112 National Emergency")}
        >
          {tr("112 Emergency")}</a>
        <Link
          href="/app/emergency"
          className={styles.guide}
        >
          {tr("Full guide →")}</Link>
      </div>
    </div>
  );
};
