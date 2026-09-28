"use client";

import { FormEvent, useState } from "react";

const categories = [
  ["wrong_number", "Phone number did not work"],
  ["closed", "Facility appeared closed"],
  ["missing_service", "Listed service was not available"],
  ["stale_hours", "Opening hours seemed incorrect"],
] as const;

export default function FacilityFeedback({ facilityId }: { facilityId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const category = String(new FormData(form).get("category"));
    setBusy(true);
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId, category }),
      });
      if (response.status === 401) {
        setMessage("Sign in to submit a data-quality report. Browsing remains anonymous.");
      } else if (!response.ok) {
        setMessage("The report could not be submitted. Please try again later.");
      } else {
        form.reset();
        setMessage("Report received. It will be reviewed before any public information changes.");
      }
    } catch {
      setMessage("The report could not be submitted. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="feedback-card" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading">Report incorrect facility information</h2>
      <p>
        Reports create a private review task. They never change verified public
        information automatically and should not include medical details.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="feedback-category">What needs checking?</label>
        <select id="feedback-category" name="category" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {categories.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="secondary" disabled={busy}>
          {busy ? "Sending…" : "Send for verification"}
        </button>
      </form>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
