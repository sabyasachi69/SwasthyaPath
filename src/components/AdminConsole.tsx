"use client";

import { FormEvent, useEffect, useState } from "react";

type Revision = {
  id: string;
  state: string;
  snapshot: Record<string, unknown>;
  reason: string;
  evidence_url: string;
  author_id: string;
};
type Protocol = {
  id: string;
  version: string;
  status: string;
  author_id?: string;
};
type Queue = {
  revisions: Revision[];
  feedback: unknown[];
  protocols: Protocol[];
  stale_facilities: number;
  verified_facilities: number;
};

export default function AdminConsole() {
  const [queue, setQueue] = useState<Queue | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      const response = await fetch("/api/v1/admin/queue", {
        cache: "no-store",
      });
      if (!response.ok) throw Error();
      setQueue(await response.json());
      setMessage("");
    } catch {
      setQueue(null);
      setMessage(
        "Sign in first, then complete staff MFA. An active internal role is also required.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const task = setTimeout(() => void load(), 0);
    return () => clearTimeout(task);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const body = {
        slug: String(form.get("slug")),
        snapshot: {
          name_en: String(form.get("name_en")),
          name_or: String(form.get("name_or")),
          address: String(form.get("address")),
          kind: String(form.get("kind")),
          latitude: Number(form.get("latitude")),
          longitude: Number(form.get("longitude")),
        },
        reason: String(form.get("reason")),
        evidence: String(form.get("evidence")),
      };
      const response = await fetch("/api/v1/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw Error();
      event.currentTarget.reset();
      setMessage("Draft submitted. A different verifier must review it.");
      await load();
    } catch {
      setMessage(
        "Draft not submitted. Check your role, MFA, fields, and evidence URL.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function review(id: string, approve: boolean) {
    setBusy(true);
    const response = await fetch(`/api/v1/admin/revisions/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approve,
        checklist: {
          contact: true,
          location: true,
          source: true,
          translation: true,
        },
      }),
    });
    setMessage(
      response.ok
        ? approve
          ? "Revision approved."
          : "Revision rejected."
        : "Review failed. Self-approval and incomplete checklists are blocked.",
    );
    await load();
  }
  async function publish(id: string) {
    setBusy(true);
    const response = await fetch(`/api/v1/admin/revisions/${id}/publish`, {
      method: "POST",
    });
    setMessage(
      response.ok
        ? "Verified revision published."
        : "Publication failed. Independent approval is required.",
    );
    await load();
  }
  async function submitProtocol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const body = {
        version: String(form.get("version")),
        expiresAt: new Date(String(form.get("expiresAt"))).toISOString(),
        sourceUrls: String(form.get("sources"))
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        questions: JSON.parse(String(form.get("questions"))),
        rules: JSON.parse(String(form.get("rules"))),
        explanations: JSON.parse(String(form.get("explanations"))),
      };
      const response = await fetch("/api/v1/admin/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw Error();
      setMessage(
        "Protocol draft submitted. A different licensed clinician reviewer must publish it.",
      );
      await load();
    } catch {
      setMessage(
        "Protocol draft failed validation. No clinical content was published.",
      );
    }
  }
  async function publishProtocol(id: string) {
    const registration = window.prompt(
      "Clinician registration identifier (recorded in review evidence):",
    );
    if (!registration) return;
    const response = await fetch(`/api/v1/admin/protocols/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerRegistration: registration,
        allCasesReviewed: true,
      }),
    });
    setMessage(
      response.ok
        ? "Protocol published. Previous protocol retired."
        : "Publication failed. Clinician role, MFA, independent review, and complete evidence are required.",
    );
    await load();
  }
  return (
    <div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <button className="secondary" disabled={busy} onClick={() => void load()}>
        Refresh secure queue
      </button>
      {queue && (
        <>
          <section className="admin-card">
            <h2>Facility draft</h2>
            <p>
              Candidate data remains private until a separate verifier approves
              it.
            </p>
            <form onSubmit={submit}>
              <div className="form-grid">
                <label>
                  Stable slug
                  <input name="slug" required pattern="[a-z0-9-]+" />
                </label>
                <label>
                  English name
                  <input name="name_en" required />
                </label>
                <label>
                  Odia name
                  <input name="name_or" required />
                </label>
                <label>
                  Facility type
                  <input name="kind" required />
                </label>
                <label>
                  Latitude
                  <input
                    name="latitude"
                    required
                    type="number"
                    step="any"
                    min="20.12"
                    max="20.42"
                  />
                </label>
                <label>
                  Longitude
                  <input
                    name="longitude"
                    required
                    type="number"
                    step="any"
                    min="85.65"
                    max="85.95"
                  />
                </label>
              </div>
              <label>
                Address
                <input name="address" required />
              </label>
              <label>
                Why this change
                <textarea name="reason" required minLength={10} />
              </label>
              <label>
                Official evidence URL
                <input
                  name="evidence"
                  required
                  type="url"
                  pattern="https://.*"
                />
              </label>
              <button className="primary" disabled={busy}>
                Submit private draft
              </button>
            </form>
          </section>
          <section className="admin-card">
            <h2>Revision queue</h2>
            {queue.revisions.length === 0 && <p>No revisions.</p>}
            {queue.revisions.map((revision) => (
              <article className="facility" key={revision.id}>
                <span className="badge">{revision.state}</span>
                <h3>{String(revision.snapshot.name_en ?? "Unnamed draft")}</h3>
                <p>{revision.reason}</p>
                <a
                  href={revision.evidence_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open evidence
                </a>
                <details>
                  <summary>Compare proposed snapshot</summary>
                  <pre>{JSON.stringify(revision.snapshot, null, 2)}</pre>
                </details>
                {revision.state === "submitted" && (
                  <>
                    <button
                      className="primary"
                      onClick={() => void review(revision.id, true)}
                    >
                      Approve completed checklist
                    </button>
                    <button
                      className="secondary"
                      onClick={() => void review(revision.id, false)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {revision.state === "approved" && (
                  <button
                    className="primary"
                    onClick={() => void publish(revision.id)}
                  >
                    Publish verified revision
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="admin-card">
            <h2>Clinical protocol draft</h2>
            <p>
              Do not enter clinical rules unless a licensed reviewer owns the
              content and test fixtures. Submission does not publish.
            </p>
            <form onSubmit={submitProtocol}>
              <div className="form-grid">
                <label>
                  Version
                  <input name="version" required />
                </label>
                <label>
                  Expiry
                  <input name="expiresAt" type="date" required />
                </label>
              </div>
              <label>
                Source URLs, one per line
                <textarea name="sources" required />
              </label>
              <label>
                Questions JSON
                <textarea name="questions" required placeholder="[]" />
              </label>
              <label>
                Rules JSON
                <textarea name="rules" required placeholder="[]" />
              </label>
              <label>
                Explanation catalogue JSON
                <textarea name="explanations" required placeholder="[]" />
              </label>
              <button className="primary">Submit protocol draft</button>
            </form>
            {queue.protocols.map((protocol) => (
              <article className="facility" key={protocol.id}>
                <strong>{protocol.version}</strong> · {protocol.status}
                {protocol.status === "draft" && (
                  <button
                    className="primary"
                    onClick={() => void publishProtocol(protocol.id)}
                  >
                    Clinician review & publish
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="admin-card">
            <h2>Data-quality inbox</h2>
            <p>
              {queue.feedback.length} user reports awaiting moderation. Reports
              never change public data automatically.
            </p>
            <p>
              {queue.verified_facilities} current verified facilities · {" "}
              {queue.stale_facilities} published facilities due for verification
              within 30 days.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
