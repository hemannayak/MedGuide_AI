"use client";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionToken } from "@/lib/auth/session";
import { useLanguage } from "@/lib/i18n/context";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
const subscribeHydration = () => () => {};
const subscribe = (callback: () => void) => { window.addEventListener("medguide-session", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("medguide-session", callback); window.removeEventListener("storage", callback); }; };
export default function AppAuthLayout({ children }: {
    children: ReactNode;
}) {
    const { tr } = useLanguage();
    const token = useSyncExternalStore(subscribe, getSessionToken, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => { if (ready && !token)
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`); }, [ready, token, pathname, router]);
    if (!token)
        return <p role="status" className="min-h-[60vh] grid place-items-center text-[#073d37]">{tr("Checking account access…")}</p>;
    return <WorkspaceShell>{children}</WorkspaceShell>;
}
