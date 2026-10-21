"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";

type Record = { id: string; consent_type: string; status: string; created_at: string };
export default function ConsentPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    const result = await api.getConsents();
    if (result.success) setRecords(result.data || []);
    else setError(result.message || "Consent could not be loaded.");
    setBusy(false);
  }
  useEffect(() => {
    let active = true;
    api.getConsents().then(result => {
      if (!active) return;
      if (result.success) setRecords(result.data || []);
      else setError(result.message || "Consent could not be loaded.");
      setBusy(false);
    });
    return () => { active = false; };
  }, []);
  async function update(scope: "AI_PROCESSING" | "SPEECH_PROCESSING", id?: string) {
    setBusy(true); setError("");
    const result = id ? await api.withdrawConsent(id) : await api.grantConsent(scope);
    if (!result.success) setError(result.message || "Consent could not be changed.");
    await load();
  }
  return <section className="max-w-2xl p-6 space-y-6">
    <h1 className="text-3xl font-bold">Your processing choices</h1>
    <p>Choose separately. Neither option is selected for you. Version 1.0.</p>
    <p>Health questions and audio may contain sensitive information. Configured external AI or speech providers may process them. MedGuide saves conversation records; speech withdrawal blocks new speech requests and does not erase data already processed. Provider retention terms still require release review.</p>
    {error && <p role="alert">{error}</p>}
    {(["AI_PROCESSING", "SPEECH_PROCESSING"] as const).map(scope => {
      const latest = records.filter(record => record.consent_type === scope).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      const granted = latest?.status === "GRANTED";
      return <section key={scope} className="rounded-xl border p-5 space-y-3">
        <h2 className="text-xl font-semibold">{scope === "AI_PROCESSING" ? "AI health questions" : "Speech recognition and spoken replies"}</h2>
        <p>{scope === "AI_PROCESSING" ? "Allow your submitted health questions to be processed for preliminary answers. These answers are not a diagnosis or a replacement for professional care." : "Allow your voice recording and reply text to be sent to the configured speech service. You can use text without allowing speech processing."}</p>
        <p>Status: {granted ? "Allowed" : "Not allowed"}</p>
        <button className="min-h-11 rounded bg-teal-800 px-4 text-white" disabled={busy} onClick={() => void update(scope, granted ? latest.id : undefined)}>{granted ? "Withdraw permission" : "I understand and allow this processing"}</button>
      </section>;
    })}
    <p>Existing emergency escalation remains available without these cloud-processing choices. For urgent help, use emergency services or a healthcare professional.</p>
    <Link className="underline" href="/app/chat">Return to health companion</Link>
  </section>;
}
