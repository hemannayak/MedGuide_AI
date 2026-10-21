"use client";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
const subscribe = (callback: () => void) => { window.addEventListener("medguide-session", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("medguide-session", callback); window.removeEventListener("storage", callback); }; };
export default function WorkerLayout({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribe, getSessionToken, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const router = useRouter(), pathname = usePathname();
  const [checkedToken, setCheckedToken] = useState<string | null>(null), [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!ready) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent(pathname)}`); return; }
    api.getCurrentAccount().then(result => { if (!active) return; if (result.success && result.data?.role === "HEALTHCARE_WORKER") { setCheckedToken(token); setError(""); } else { setCheckedToken(null); setError("An authorized healthcare-worker account is required. Please sign in with your worker account."); } });
    return () => { active = false; };
  }, [ready, token, pathname, router]);
  if (error) return <section className="max-w-xl mx-auto p-8"><h1 className="text-3xl">Worker access unavailable</h1><p role="alert" className="my-6">{error}</p><Link href="/login">Return to sign in</Link></section>;
  if (!token || token !== checkedToken) return <p role="status" className="min-h-[60vh] grid place-items-center">Checking worker access…</p>;
  return <WorkspaceShell mode="worker">{children}</WorkspaceShell>;
}
