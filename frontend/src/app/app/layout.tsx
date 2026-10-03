"use client";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionToken } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
const subscribe = (callback: () => void) => { window.addEventListener("medguide-session", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("medguide-session", callback); window.removeEventListener("storage", callback); }; };
export default function AppAuthLayout({ children }: {
    children: ReactNode;
}) {
    const token = useSyncExternalStore(subscribe, getSessionToken, () => null);
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => { if (!token)
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`); }, [token, pathname, router]);
    if (!token)
        return <p role="status" className="min-h-[60vh] grid place-items-center text-[#073d37]">Checking account access…</p>;
    return <WorkspaceShell>{children}</WorkspaceShell>;
}
