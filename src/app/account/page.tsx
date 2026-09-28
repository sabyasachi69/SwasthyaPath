"use client";
import { useState, useEffect } from "react";
import { browserDb } from "@/lib/supabase/browser";
import ShareReferral from "@/components/ShareReferral";
type Plan = {
  id: string;
  service_code: string;
  created_at: string;
  facility_id: string;
};
type Referral = { id: string; status: string; created_at: string };
export default function Account() {
  const [phone, setPhone] = useState(""),
    [otp, setOtp] = useState(""),
    [sent, setSent] = useState(false),
    [signed, setSigned] = useState(false),
    [message, setMessage] = useState(""),
    [plans, setPlans] = useState<Plan[]>([]),
    [referrals, setReferrals] = useState<Referral[]>([]);
  async function load() {
    try {
      const client = browserDb();
      const {
        data: { user },
      } = await client.auth.getUser();
      setSigned(!!user);
      if (user) {
        const [p, r] = await Promise.all([
          client
            .from("saved_care_plans")
            .select("id,service_code,created_at,facility_id")
            .order("created_at", { ascending: false }),
          client
            .from("referrals")
            .select("id,status,created_at")
            .order("created_at", { ascending: false }),
        ]);
        setPlans(p.data ?? []);
        setReferrals(r.data ?? []);
      }
    } catch {
      setMessage(
        "Accounts require a configured Supabase project and SMS provider. You can continue browsing without signing in.",
      );
    }
  }
  useEffect(() => {
    const task = setTimeout(() => void load(), 0);
    return () => clearTimeout(task);
  }, []);
  async function requestOtp() {
    try {
      if (!/^\+91[6-9]\d{9}$/.test(phone)) {
        setMessage("Enter an Indian mobile number including +91.");
        return;
      }
      const { error } = await browserDb().auth.signInWithOtp({ phone });
      if (error) throw error;
      setSent(true);
      setMessage("Enter the code sent to your phone.");
    } catch {
      setMessage("Unable to send code. Please try again later.");
    }
  }
  async function verify() {
    try {
      const { error } = await browserDb().auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      setMessage("");
      await load();
    } catch {
      setMessage("Unable to verify this code.");
    }
  }
  async function remove(id: string) {
    const { error } = await browserDb()
      .from("saved_care_plans")
      .delete()
      .eq("id", id);
    setMessage(
      error ? "Unable to delete." : "Plan and linked referrals deleted.",
    );
    await load();
  }
  async function createReferral(id: string) {
    const r = await fetch("/api/v1/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: id, consent: true }),
    });
    setMessage(
      r.ok
        ? "Patient-generated referral created. The facility has not acknowledged it."
        : "Unable to create referral.",
    );
    await load();
  }
  async function updateReferral(id: string, status: string) {
    const r = await fetch(`/api/v1/referrals/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessage(
      r.ok ? "Status saved as your report." : "Unable to update status.",
    );
    await load();
  }
  async function exportData() {
    try {
      const response = await fetch("/api/v1/account", { cache: "no-store" });
      if (!response.ok) throw Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "swasthyapath-data.json";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Your minimal stored data was exported.");
    } catch {
      setMessage("Unable to export data.");
    }
  }
  async function deleteAccount() {
    if (
      !window.confirm(
        "Delete your account, saved plans, referrals, events and identifiable feedback? This cannot be undone.",
      )
    )
      return;
    const response = await fetch("/api/v1/account", { method: "DELETE" });
    if (!response.ok) {
      setMessage("Account deletion is temporarily unavailable.");
      return;
    }
    await browserDb().auth.signOut();
    setSigned(false);
    setPlans([]);
    setReferrals([]);
    setMessage("Your account and linked records were deleted.");
  }
  return (
    <section className="content-page">
      <span className="eyebrow">YOUR CHOICES</span>
      <h1>Saved care plans</h1>
      <p>
        Accounts are optional. Save a destination and follow your own referral
        progress. Facilities are not connected to this service.
      </p>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!signed ? (
        <>
          <label htmlFor="phone">Mobile number</label>
          <input
            id="phone"
            autoComplete="tel"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91…"
          />
          <button className="primary" onClick={requestOtp}>
            Send code
          </button>
          {sent && (
            <>
              <label htmlFor="otp">Verification code</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="primary" onClick={verify}>
                Verify
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <button
            className="secondary"
            onClick={async () => {
              await browserDb().auth.signOut();
              setSigned(false);
              setPlans([]);
              setReferrals([]);
            }}
          >
            Sign out
          </button>
          <button className="secondary" onClick={exportData}>
            Export my data
          </button>
          <button className="danger-button" onClick={deleteAccount}>
            Delete account
          </button>
          {plans.length === 0 && <p>No saved care plans.</p>}
          {plans.map((p) => (
            <article className="facility" key={p.id}>
              <h2>{p.service_code} • Saved destination</h2>
              <p>
                Saved {new Date(p.created_at).toLocaleDateString()}. Expires
                after 90 days.
              </p>
              <button className="primary" onClick={() => createReferral(p.id)}>
                Create patient referral
              </button>
              <button className="secondary" onClick={() => remove(p.id)}>
                Delete plan
              </button>
            </article>
          ))}
          <h2>Your referral timeline</h2>
          {referrals.length === 0 && <p>No patient-generated referrals yet.</p>}
          {referrals.map((r) => (
            <article className="facility" key={r.id}>
              <strong>{r.status.replaceAll("_", " ")}</strong>
              <p>Patient-reported • Facility not connected</p>
              {!["completed", "cancelled"].includes(r.status) && (
                <select
                  aria-label="Update referral progress"
                  value={r.status}
                  onChange={(e) => updateReferral(r.id, e.target.value)}
                >
                  {[
                    "planned",
                    "departed",
                    "arrived",
                    "seen",
                    "referred_elsewhere",
                    "completed",
                    "cancelled",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              )}
              <ShareReferral id={r.id} />
            </article>
          ))}
        </>
      )}
    </section>
  );
}
