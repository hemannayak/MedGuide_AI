"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { PrescriptionDetail } from "@/types/care";
import { MedicationReview } from "@/components/care/medication-review";
import styles from "@/components/care/care.module.css";
export default function PrescriptionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<PrescriptionDetail | null>(null), [error, setError] = useState("");
  useEffect(() => { let active = true; api.getPrescription(id).then(result => { if (!active) return; if (result.success && result.data) setRecord(result.data); else setError(result.message || "Prescription unavailable."); }); return () => { active = false; }; }, [id]);
  return <section className={styles.page}><h1>Review prescription</h1><p className={styles.notice}>Compare every extracted detail with the original prescription. Ask a healthcare professional about anything uncertain. Confirmation does not prescribe or change medication.</p>
    {error ? <p role="alert" className={styles.error}>{error}</p> : !record ? <p role="status">Loading prescription…</p> : <>
      <p>Prescription date: {record.prescribed_date || "Not provided"}</p>
      {record.ocr_results.map(ocr => <details className={styles.card} key={ocr.id}><summary>Extracted text — may contain errors ({ocr.status})</summary><pre className={styles.raw}>{ocr.raw_text || "No readable text found. Please seek human review."}</pre></details>)}
      {record.medications.length === 0 && <p>No medicine details could be extracted. Ask a healthcare worker to review the original.</p>}
      {record.medications.map(med => <MedicationReview key={med.id} medication={med} verify={() => api.verifyMedication(med.id)} onVerified={updated => setRecord(current => current && ({ ...current, medications: current.medications.map(item => item.id === updated.id ? updated : item) }))} />)}
    </>}
    <div className={styles.actions}><Link href="/app/prescriptions">All documents</Link><Link href="/app/medications">Medication overview</Link></div>
  </section>;
}
