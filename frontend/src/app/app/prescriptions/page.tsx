"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { PrescriptionSummary } from "@/types/care";
import styles from "@/components/care/care.module.css";
export default function PrescriptionsPage() {
  const [records, setRecords] = useState<PrescriptionSummary[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.getPrescriptions().then(result => { if (!active) return; if (result.success && result.data) setRecords(result.data); else setError(result.message || "Documents could not be loaded."); }).catch(() => { if (active) setError("We could not connect to your documents."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section className={styles.page}><div className={styles.heading}><h1>Prescription documents</h1><p>Keep the original prescription. Extracted medication details need review before use.</p></div>
    <div className={styles.actions}><Link href="/app/prescriptions/upload">Upload prescription</Link></div>
    {loading ? <p role="status">Loading documents…</p> : error ? <p role="alert" className={styles.error}>{error}</p> : records.length === 0 ? <p>No prescriptions uploaded yet.</p> : records.map(record => <article className={styles.card} key={record.id}><span className={styles.badge}>{record.verification_status}</span><h2>Uploaded {new Date(record.created_at).toLocaleDateString()}</h2><p>Prescription date: {record.prescribed_date || "Not provided"}</p><p>{record.medications_count} medication candidates</p><Link href={`/app/prescriptions/${record.id}`}>Review extracted details →</Link></article>)}
  </section>;
}
