"use client";
import { useState } from "react";
import type { CareMedication } from "@/types/care";
import type { StandardResponse } from "@/types/api";
import styles from "./care.module.css";

export function MedicationReview({ medication, verify, onVerified }: {
  medication: CareMedication;
  verify: () => Promise<StandardResponse<CareMedication>>;
  onVerified: (medication: CareMedication) => void;
}) {
  const [checked, setChecked] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const complete = Boolean(medication.medicine_name?.trim()) && medication.medicine_name !== "Unknown Medicine" &&
    Boolean(medication.dosage?.trim()) && medication.dosage !== "Unspecified";
  async function confirm() {
    if (!checked || busy || !complete) return;
    setBusy(true); setError("");
    try {
      const result = await verify();
      if (result.success && result.data) onVerified(result.data);
      else setError(result.message || "Verification could not be saved.");
    } catch { setError("We could not save verification. Please try again."); }
    finally { setBusy(false); }
  }
  return <article className={styles.card}>
    <span className={styles.badge}>{medication.verification_status}</span>
    <h3>{medication.medicine_name}</h3>
    <p>Recorded dosage: {medication.dosage || "Not recorded"}</p>
    <p>Route: {medication.route || "Not recorded"}</p>
    <p>Instructions: {medication.instructions || "Not recorded"}</p>
    {medication.verification_status === "PENDING" && !complete && <p role="status">Incomplete extraction needs professional review. These details cannot be confirmed here.</p>}
    {medication.verification_status === "PENDING" && complete && <>
      <label className={styles.confirm}><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
        <span>I checked the medicine name, dosage and instructions against the original prescription. If anything is unclear, I will ask a healthcare professional before confirming.</span></label>
      <button className={styles.button} disabled={!checked || busy} onClick={confirm}>{busy ? "Saving…" : "Confirm checked details"}</button>
    </>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </article>;
}
