"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api/client";
import type { CareAdherence, CareSchedule } from "@/types/care";
import styles from "./care.module.css";
export function ScheduleAdherence({ schedule }: { schedule: CareSchedule }) {
  const [items, setItems] = useState<CareAdherence[]>([]), [time, setTime] = useState(""), [status, setStatus] = useState<"TAKEN" | "SKIPPED" | "MISSED">("TAKEN"), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; api.getAdherence(schedule.id).then(result => { if (!active) return; if (result.success && result.data) setItems(result.data); else setError(result.message || "Intake history unavailable."); }); return () => { active = false; }; }, [schedule.id]);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await api.recordAdherence(schedule.id, { scheduled_at: new Date(time).toISOString(), status });
    if (result.success && result.data) { setItems(current => [result.data!, ...current]); setTime(""); } else setError(result.message || "Intake record could not be saved.");
    setBusy(false);
  }
  return <article className={styles.card}><h3>{schedule.frequency}</h3><p>Times: {schedule.schedule_data.times?.join(", ") || "Not recorded"} ({schedule.timezone})</p><p>{schedule.start_date} to {schedule.end_date || "No end date recorded"} · {schedule.status}</p>
    <form className={styles.form} onSubmit={save}><label>Scheduled dose date and local time<input type="datetime-local" required value={time} onChange={e => setTime(e.target.value)} /></label><label>What happened?<select value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="TAKEN">Taken</option><option value="SKIPPED">Skipped</option><option value="MISSED">Missed</option></select></label><button className={styles.button} disabled={busy || !time}>{busy ? "Saving…" : "Record intake"}</button></form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <details><summary>Recorded intake history ({items.length})</summary>{items.length === 0 ? <p>No intake records.</p> : items.map(item => <p key={item.id}>{new Date(item.scheduled_at).toLocaleString()} · {item.status}</p>)}</details>
  </article>;
}
