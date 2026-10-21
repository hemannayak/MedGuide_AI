"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { CareRecords } from "@/types/care";
import { MedicationReview } from "@/components/care/medication-review";
import { FollowUps } from "@/components/care/follow-ups";
import styles from "@/components/care/care.module.css";
export default function PatientReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [records, setRecords] = useState<CareRecords | null>(null), [error, setError] = useState("");
  const [reason, setReason] = useState(""), [time, setTime] = useState(""), [notes, setNotes] = useState(""), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false), [refresh, setRefresh] = useState(0);
  useEffect(() => { let active = true; api.getWorkerRecords(id).then(result => { if (!active) return; if (result.success && result.data) setRecords(result.data); else setError(result.message || "Patient records unavailable."); }); return () => { active = false; }; }, [id]);
  async function create(event: FormEvent) {
    event.preventDefault(); setError(""); setSaved(false); setBusy(true);
    const result = await api.createFollowUp({ patient_id: id, reason: reason.trim(), scheduled_at: new Date(time).toISOString(), notes: notes.trim() || undefined });
    if (result.success) { setSaved(true); setRefresh(value => value + 1); setReason(""); setTime(""); setNotes(""); } else setError(result.message || "Follow-up could not be saved.");
    setBusy(false);
  }
  if (!records) return error ? <p role="alert" className={styles.error}>{error}</p> : <p role="status">Loading patient records…</p>;
  return <section className={styles.page}><div className={styles.heading}><h1>{records.profile.display_name}</h1><p>Patient-reported records for authorized review. No automated diagnosis is provided.</p></div>
    <article className={styles.card}><h2>Record summary</h2><p>{records.summary.summary_text}</p><p className={styles.muted}>Structured record counts, not an evaluated clinical AI summary.</p></article>
    <h2 className="text-2xl my-6">Open and recorded alerts</h2>{records.alerts.length === 0 ? <p>No alerts recorded.</p> : records.alerts.map(alert => <article className={styles.notice} key={alert.id}><strong>{alert.severity} · {alert.alert_type}</strong><p>Status: {alert.status}</p></article>)}
    <h2 className="text-2xl my-6">Reported symptoms</h2>{records.symptoms.length === 0 ? <p>No symptoms recorded.</p> : records.symptoms.map(symptom => <article className={styles.card} key={symptom.id}><p>{symptom.text}</p><p className={styles.muted}>{new Date(symptom.reported_at).toLocaleString()} · {symptom.language}</p></article>)}
    <h2 className="text-2xl my-6">Medication review</h2>{records.medications.length === 0 && <p>No medication records.</p>}{records.medications.map(med => <MedicationReview key={med.id} medication={med} verify={() => api.verifyWorkerMedication(id, med.id)} onVerified={updated => setRecords(current => current && ({ ...current, medications: current.medications.map(item => item.id === updated.id ? updated : item) }))} />)}
    <h2 className="text-2xl my-6">Prescription records</h2>{records.prescriptions.length === 0 ? <p>No prescriptions uploaded.</p> : records.prescriptions.map(p => <article className={styles.card} key={p.id}><p>Uploaded {new Date(p.created_at).toLocaleDateString()} · {p.verification_status}</p><p>{p.medications_count} medication candidates. Compare against the original document.</p></article>)}
    <h2 className="text-2xl my-6">Arrange a follow-up</h2><form className={styles.form} onSubmit={create}><label>Reason<input required maxLength={255} value={reason} onChange={e => setReason(e.target.value)} /></label><label>Local date and time<input type="datetime-local" required value={time} onChange={e => setTime(e.target.value)} /></label><label>Notes (optional)<textarea value={notes} onChange={e => setNotes(e.target.value)} /></label><button className={styles.button} disabled={busy}>{busy ? "Saving…" : "Save follow-up"}</button></form>{error && <p role="alert" className={styles.error}>{error}</p>}{saved && <p role="status">Follow-up saved.</p>}
    <FollowUps patientId={id} editable refresh={refresh} /><Link href="/hcw/patients">Back to authorized patients</Link>
  </section>;
}
