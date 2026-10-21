"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { PrescriptionUpload } from "@/types/care";
import styles from "@/components/care/care.module.css";
export default function UploadPrescriptionPage() {
  const [file, setFile] = useState<File | null>(null), [date, setDate] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [result, setResult] = useState<PrescriptionUpload | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!file) { setError("Choose a prescription image."); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError("Choose a JPEG, PNG or WebP image."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("The image must be 10 MB or smaller."); return; }
    setBusy(true);
    try { const response = await api.uploadPrescription(file, date || undefined); if (response.success && response.data) setResult(response.data); else setError(response.message || "Upload could not be completed."); }
    finally { setBusy(false); }
  }
  return <section className={styles.page}><div className={styles.heading}><h1>Upload a prescription</h1><p>Use a clear photo of the original prescription. JPEG, PNG or WebP, up to 10 MB. Scanned PDF processing is not available.</p></div>
    <p className={styles.notice}>OCR can misread handwriting and dosage. No medication is automatically verified or scheduled.</p>
    {!result && <form className={styles.form} onSubmit={submit}><label>Prescription image<input type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy} onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }} /></label><label>Date printed on prescription (optional)<input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={busy} /></label><button className={styles.button} disabled={!file || busy}>{busy ? "Reading prescription…" : "Upload and extract text"}</button></form>}
    {busy && <p role="status">Keep this page open while the image is processed.</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
    {result && <div className={styles.card}><h2>Upload saved — review required</h2><p>{result.extracted_medications.length} candidates remain {result.verification_status}.</p><p>OCR engine: {result.ocr_engine}. {result.confidence === null ? "Confidence unavailable." : `OCR engine score: ${Math.round(result.confidence * 100)}%. This is not a measure of medication correctness.`}</p><div className={styles.actions}><Link href={`/app/prescriptions/${result.prescription_id}`}>Review extracted details</Link></div></div>}
    <Link href="/app/prescriptions">Back to documents</Link>
  </section>;
}
