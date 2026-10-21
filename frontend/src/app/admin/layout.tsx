"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSessionToken } from "@/lib/auth/session";

const subscribe = (callback: () => void) => {
  window.addEventListener("medguide-session", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("medguide-session", callback);
    window.removeEventListener("storage", callback);
  };
};

export default function AdminAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSyncExternalStore(subscribe, getSessionToken, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (ready && !token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [ready, token, pathname, router]);

  if (!ready || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
