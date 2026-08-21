"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall } from "lucide-react";

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
export const EmergencyBanner: React.FC = () => {
  const pathname = usePathname();

  // Hide entirely on public/marketing pages and on the emergency page itself
  const isPublicPage =
    !pathname?.startsWith("/app") && !pathname?.startsWith("/worker");
  const isEmergencyPage = pathname === "/app/emergency";

  if (isPublicPage || isEmergencyPage) return null;

  return (
    <div
      role="region"
      aria-label="Emergency Quick Access"
      className="bg-red-700 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
    >
      <span className="font-medium text-red-100">
        Life-threatening emergency? Call immediately.
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="tel:108"
          className="bg-white text-red-700 hover:bg-red-50 font-bold px-3 py-1 rounded min-h-[32px] inline-flex items-center gap-1 text-xs shadow-sm"
          aria-label="Call 108 Ambulance"
        >
          <PhoneCall className="w-3 h-3" aria-hidden="true" />
          108 Ambulance
        </a>
        <a
          href="tel:112"
          className="border border-red-400 text-white hover:bg-red-800 font-bold px-3 py-1 rounded min-h-[32px] inline-flex items-center gap-1 text-xs"
          aria-label="Call 112 National Emergency"
        >
          112 Emergency
        </a>
        <Link
          href="/app/emergency"
          className="text-red-200 hover:text-white underline text-xs ml-1"
        >
          Full guide →
        </Link>
      </div>
    </div>
  );
};
