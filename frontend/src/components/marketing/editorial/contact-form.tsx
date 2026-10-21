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
        Synthetic example message
        <textarea name="message" rows={5} maxLength={1000} required aria-describedby="contact-purpose" />
      </label>
      <p id="contact-purpose">This preview does not need your name or email and sends nothing. Do not include health records or personal details.</p>
      <label><input type="checkbox" name="preview-consent" required />I understand this is an unsent preview and have used synthetic information only.</label>
      <button type="submit">Preview message →</button>
      <p className={styles.status} role="status">
        {notice}
      </p>
    </form>
  );
}
