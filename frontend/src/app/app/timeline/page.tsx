"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { TimelineEvent } from "@/types/care";
import styles from "@/components/care/care.module.css";
export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]), [page, setPage] = useState(1), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { let active = true; api.getTimeline(page).then(result => { if (!active) return; if (result.success && result.data) { setEvents(result.data); setError(""); } else setError(result.message || "Timeline unavailable."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [page]);
  return <section className={styles.page}><h1>Health timeline</h1><p className="my-6">Events recorded through your account. These records are not a complete clinical history.</p>{loading ? <p role="status">Loading timeline…</p> : error ? <p role="alert" className={styles.error}>{error}</p> : events.length === 0 ? <p>No events on this page.</p> : events.map(event => <article className={styles.card} key={event.id}><h2>{event.event_type.replaceAll("_", " ")}</h2><p>{new Date(event.event_time).toLocaleString()}</p>{typeof event.metadata?.summary === "string" && <p>{event.metadata.summary}</p>}{typeof event.metadata?.medicine_name === "string" && <p>{event.metadata.medicine_name}</p>}</article>)}<div className={styles.actions}><button className={styles.button} disabled={page === 1 || loading} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button><span>Page {page}</span><button className={styles.button} disabled={events.length < 20 || loading || !!error} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button></div></section>;
}
