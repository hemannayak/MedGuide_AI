"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { CareMedication, CareSchedule } from "@/types/care";
import { MedicationReview } from "@/components/care/medication-review";
import { ScheduleAdherence } from "@/components/care/schedule-adherence";
import styles from "@/components/care/care.module.css";
export default function MedicationPage() {
  const { id } = useParams<{ id: string }>();
  const [med, setMed] = useState<CareMedication | null>(null), [schedules, setSchedules] = useState<CareSchedule[]>([]), [error, setError] = useState("");
  const [frequency, setFrequency] = useState(""), [times, setTimes] = useState(""), [start, setStart] = useState(""), [end, setEnd] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; Promise.all([api.getMedication(id), api.getMedicationSchedules(id)]).then(([record, list]) => { if (!active) return; if (record.success && record.data) setMed(record.data); else setError(record.message || "Medication unavailable."); if (list.success && list.data) setSchedules(list.data); else setError(list.message || "Schedules unavailable."); }); return () => { active = false; }; }, [id]);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await api.createMedicationSchedule(id, { frequency: frequency.trim(), schedule_data: { times: times.split(",").map(t => t.trim()) }, start_date: start, end_date: end || undefined, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    if (result.success && result.data) { setSchedules(current => [...current, result.data!]); setFrequency(""); setTimes(""); setStart(""); setEnd(""); } else setError(result.message || "Schedule could not be saved.");
    setBusy(false);
  }
  return <section className={styles.page}><h1>Medication details</h1>{error && <p role="alert" className={styles.error}>{error}</p>}{!med && !error && <p role="status">Loading medication…</p>}{med && <>
    <MedicationReview medication={med} verify={() => api.verifyMedication(id)} onVerified={setMed} />
    <p className={styles.notice}>Use the prescribed instructions. This screen records schedules and intake; it does not recommend doses or changes.</p>
    <h2 className="text-2xl my-6">Medication schedules</h2>{schedules.length === 0 && <p>No schedules recorded.</p>}{schedules.map(schedule => <ScheduleAdherence key={schedule.id} schedule={schedule} />)}
    {med.verification_status === "VERIFIED" ? <><h2 className="text-2xl my-6">Record a prescribed schedule</h2><form className={styles.form} onSubmit={save}><label>Frequency as written on prescription<input required value={frequency} onChange={e => setFrequency(e.target.value)} /></label><label>Times in 24-hour format, separated by commas<input required placeholder="HH:MM, HH:MM" value={times} onChange={e => setTimes(e.target.value)} /></label><label>Start date<input required type="date" value={start} onChange={e => setStart(e.target.value)} /></label><label>End date (if prescribed)<input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label><label className={styles.confirm}><input type="checkbox" required /><span>I checked these times and dates with the prescribed instructions.</span></label><button className={styles.button} disabled={busy}>{busy ? "Saving…" : "Save prescribed schedule"}</button></form></> : <p className={styles.notice}>Scheduling is blocked until the medication details are explicitly verified.</p>}
  </>}<Link href="/app/medications">Back to medications</Link></section>;
}
