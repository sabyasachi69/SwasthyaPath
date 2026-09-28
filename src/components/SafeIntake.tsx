"use client";

import { useState } from "react";
import Link from "next/link";
import type { Facility } from "@/domain/facility";
import { optionValue, type TriageOption } from "@/domain/triage";

type Question = {
  key: string;
  wording_en: string;
  wording_or: string;
  options: TriageOption[];
  red_flag: boolean;
  position: number;
};
type Protocol = { version: string; expiresAt: string; questions: Question[] };
type Result = {
  disposition: "emergency" | "urgent" | "routine";
  call?: string;
  ruleVersion: string;
  explanations: { code: string; text: { en: string; or: string } | null }[];
  facilities: Facility[];
};

export default function SafeIntake({
  lang,
  location,
}: {
  lang: "en" | "or";
  location: { lat: number; lng: number } | null;
}) {
  const [protocol, setProtocol] = useState<Protocol | null>(null),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [result, setResult] = useState<Result | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const odia = lang === "or";
  async function begin() {
    if (!location) {
      setMessage(
        odia ? "ପ୍ରଥମେ ଆପଣଙ୍କ ଅବସ୍ଥାନ ବାଛନ୍ତୁ।" : "Choose your location first.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/navigation/protocol", {
        cache: "no-store",
      });
      if (!response.ok) throw Error();
      const data = (await response.json()) as Protocol;
      if (!Array.isArray(data.questions) || !data.questions.length)
        throw Error();
      setProtocol(data);
    } catch {
      setMessage(
        odia
          ? "କ୍ଲିନିକାଲ୍ ସମୀକ୍ଷା ହୋଇଥିବା ପ୍ରଶ୍ନଗୁଡ଼ିକ ଏପର୍ଯ୍ୟନ୍ତ ପ୍ରକାଶିତ ହୋଇନାହିଁ।"
          : "Clinician-reviewed screening questions have not been published yet. Directory search remains available.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function record(question: Question, value: string) {
    if (!location || !protocol) return;
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/navigation/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: next,
          lat: location.lat,
          lng: location.lng,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        return;
      }
      if (data?.error?.code !== "INCOMPLETE_ANSWERS")
        setMessage(
          odia
            ? "ସୁରକ୍ଷିତ ସୁପାରିଶ ଦିଆଯାଇପାରିଲା ନାହିଁ। 108 କୁ ଫୋନ୍ କରନ୍ତୁ କିମ୍ବା ଡିରେକ୍ଟୋରୀ ବ୍ୟବହାର କରନ୍ତୁ।"
            : "A safe recommendation could not be produced. Call 108 for an emergency or use the directory.",
        );
    } catch {
      setMessage(
        odia
          ? "ସେବା ଉପଲବ୍ଧ ନାହିଁ। ଜରୁରୀ ସ୍ଥିତିରେ 108 କୁ ଫୋନ୍ କରନ୍ତୁ।"
          : "Screening is unavailable. In an emergency, call 108.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="intake" aria-labelledby="intake-title">
      <span className="step">03 / OPTIONAL SAFETY NAVIGATION</span>
      <h2 id="intake-title">
        {odia
          ? "ମୋତେ କେଉଁ ସ୍ତରର ସେବା ଖୋଜିବା ଉଚିତ?"
          : "What level of care should I look for?"}
      </h2>
      <p>
        {odia
          ? "ଏହା ରୋଗ ନିର୍ଣ୍ଣୟ ନୁହେଁ। କେବଳ କ୍ଲିନିସିଆନ୍ ଅନୁମୋଦିତ ପ୍ରଶ୍ନ ଓ ନିୟମ ପ୍ରକାଶିତ ହେଲେ ଏହା କାମ କରେ।"
          : "This does not diagnose a condition. It works only when a clinician-approved question set and rule version are published."}
      </p>
      {!protocol && !result && (
        <button
          className="primary"
          disabled={busy || !location}
          onClick={begin}
        >
          {busy
            ? "Checking…"
            : odia
              ? "ସୁରକ୍ଷା ପ୍ରଶ୍ନ ଆରମ୍ଭ କରନ୍ତୁ"
              : "Start safety questions"}
        </button>
      )}
      {protocol && !result && (
        <div className="question-list">
          {protocol.questions.map((q) => (
            <fieldset key={q.key}>
              <legend>
                {odia ? q.wording_or : q.wording_en}
                {q.red_flag && (
                  <span className="red-flag">
                    {" "}
                    {odia ? "ଜରୁରୀ ଯାଞ୍ଚ" : "urgent safety check"}
                  </span>
                )}
              </legend>
              <div className="option-grid">
                {q.options.map((option) => {
                  const value = optionValue(option);
                  const label =
                    typeof option === "string"
                      ? option
                      : odia
                        ? option.label_or
                        : option.label_en;
                  return (
                    <label className="option" key={value}>
                      <input
                        type="radio"
                        name={q.key}
                        value={value}
                        checked={answers[q.key] === value}
                        disabled={busy}
                        onChange={() => void record(q, value)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
      {result?.disposition === "emergency" && (
        <div className="emergency-result" role="alert">
          <span className="badge">{odia ? "ଜରୁରୀ" : "EMERGENCY"}</span>
          <h3>
            {odia ? "ଏବେ ଜରୁରୀ ସହାୟତା ନିଅନ୍ତୁ" : "Get emergency help now"}
          </h3>
          {result.explanations.map((e) => (
            <p key={e.code}>
              {e.text?.[lang] ??
                (odia
                  ? "ଅନୁମୋଦିତ ଜରୁରୀ ନିୟମ ମେଳ ହୋଇଛି।"
                  : "An approved emergency rule matched your answers.")}
            </p>
          ))}
          <a className="primary" href={`tel:${result.call ?? "108"}`}>
            {odia ? "108 କୁ ଫୋନ୍ କରନ୍ତୁ" : "Call 108 now"}
          </a>
        </div>
      )}
      {result && result.disposition !== "emergency" && (
        <div className="recommendation">
          <span className="badge">
            {result.disposition.toUpperCase()} • {result.ruleVersion}
          </span>
          <h3>{odia ? "ସୁପାରିଶ ବୁଝନ୍ତୁ" : "Understand the recommendation"}</h3>
          {result.explanations.map((e) => (
            <p key={e.code}>
              {e.text?.[lang] ??
                (odia
                  ? "ଅନୁମୋଦିତ ନିୟମ ମେଳ ହୋଇଛି।"
                  : "An approved navigation rule matched your answers.")}
            </p>
          ))}
          {result.facilities.length === 0 ? (
            <p className="notice">
              {odia
                ? "ଯାଞ୍ଚ ହୋଇଥିବା ମେଳ ମିଳିଲା ନାହିଁ। ଏହି ସିଷ୍ଟମ୍ ଅଯାଞ୍ଚ ତଥ୍ୟ ଦେଖାଇବ ନାହିଁ।"
                : "No verified match was found. This system will not substitute unverified or demo data."}
            </p>
          ) : (
            result.facilities.map((facility, index) => (
              <article className="facility" key={facility.id}>
                <span className="badge">
                  {index === 0
                    ? odia
                      ? "ପ୍ରଥମ ଯାତ୍ରା ସ୍ଥଳ"
                      : "Suggested first stop"
                    : odia
                      ? "ବିକଳ୍ପ"
                      : "Alternative"}
                </span>
                <h3>{odia ? facility.name_or : facility.name_en}</h3>
                <p>
                  {facility.address} · {facility.distance_km?.toFixed(1)} km
                  straight-line
                </p>
                <Link className="primary" href={`/facilities/${facility.slug}`}>
                  {odia ? "ବିବରଣୀ ଦେଖନ୍ତୁ" : "Review and choose"}
                </Link>
              </article>
            ))
          )}
        </div>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {(protocol || result) && (
        <button
          className="secondary"
          onClick={() => {
            setProtocol(null);
            setAnswers({});
            setResult(null);
            setMessage("");
          }}
        >
          {odia ? "ପୁନଃ ଆରମ୍ଭ" : "Start over"}
        </button>
      )}
    </section>
  );
}
