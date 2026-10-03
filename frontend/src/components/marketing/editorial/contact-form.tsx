"use client";
import { useState, type FormEvent } from "react";
import styles from "./editorial.module.css";
export function ContactForm() {
  const [notice, setNotice] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    setNotice(
      "Demo message reviewed. Nothing has been sent or saved; the contact service is not connected.",
    );
  }
  return (
    <form className={styles.contactForm} onSubmit={submit}>
      <p>Demo form only. Please do not enter private medical information.</p>
      <label>
        Your name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Message
        <textarea name="message" rows={5} required />
      </label>
      <button type="submit">Preview message →</button>
      <p className={styles.status} role="status">
        {notice}
      </p>
    </form>
  );
}
