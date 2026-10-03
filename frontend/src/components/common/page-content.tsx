"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
const focusedRoutes = ["/login", "/register", "/forgot-password", "/verify-email", "/onboarding"];
export function PageContent({children}:{children:ReactNode}) {
  const path=usePathname();
  return focusedRoutes.includes(path || "") ? <div className="flex-1">{children}</div> : <main className="flex-1">{children}</main>;
}
