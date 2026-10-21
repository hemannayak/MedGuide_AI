"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { CareFollowUp } from "@/types/care";
import styles from "./care.module.css";
export function FollowUps({ patientId, editable = false, refresh = 0 }: { patientId?: string; editable?: boolean; refresh?: number }) {
  const [items, setItems] = useState<CareFollowUp[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { let active = true; api.getFollowUps(patientId).then(result => { if (!active) return; if (result.success && result.data) { setItems(result.data); setError(""); } else setError(result.message || "Follow-ups unavailable."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [patientId, refresh]);
  async function update(id: string, status: "COMPLETED" | "CANCELLED") {
    setBusy(id); const result = await api.updateFollowUp(id, status);
    if (result.success && result.data) setItems(current => current.map(item => item.id === id ? result.data! : item));
    else setError(result.message || "Update could not be saved.");
    setBusy(null);
  }
  return <section><h2 className="text-2xl my-6">Follow-ups</h2>{loading ? <p role="status">Loading follow-ups…</p> : error ? <p className={styles.error} role="alert">{error}</p> : items.length === 0 ? <p>No follow-ups recorded.</p> : items.map(item => <article className={styles.card} key={item.id}><span className={styles.badge}>{item.status}</span><h3>{item.reason}</h3><p>{new Date(item.scheduled_at).toLocaleString()}</p>{item.notes && <p>{item.notes}</p>}{editable && item.status === "PENDING" && <div className={styles.actions}><button className={styles.button} disabled={busy !== null} onClick={() => update(item.id, "COMPLETED")}>Mark completed</button><button className={styles.button} disabled={busy !== null} onClick={() => update(item.id, "CANCELLED")}>Cancel follow-up</button></div>}</article>)}</section>;
}
