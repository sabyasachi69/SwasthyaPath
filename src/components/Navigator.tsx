"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Facility } from "@/domain/facility";
import SafeIntake from "./SafeIntake";
const CareMap = dynamic(() => import("./CareMap"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});
const copy = {
  en: {
    eyebrow: "YOUR NEXT STEP, MADE CLEAR",
    title: "Find care close to home.",
    intro:
      "Explore verified facilities in Bhubaneswar. Understand your options, call ahead, and choose your next step.",
    location: "Where do you need care?",
    gps: "Use my location",
    manual: "Search locality or 6-digit pincode",
    service: "What service are you looking for?",
    search: "Find facilities",
    empty: "No verified results to show yet",
    emptyText:
      "Facilities appear here after their details have been reviewed. Emergency calls and teleconsultation links remain available.",
    map: "Show map",
    list: "Hide map",
    why: "Why this result",
    call: "Call facility",
    directions: "Directions",
    choose: "Choose this facility",
    safety: "Need urgent help?",
    safetyText:
      "For a medical emergency, call 108. Janani ambulance: 102. You do not need an account.",
    tele: "Consult from home",
    teleText:
      "Visit the official eSanjeevani service to explore available consultations.",
    verify: "Information you can check",
    verifyText:
      "Every published listing includes a source and review date. A listed service does not guarantee availability when you arrive.",
  },
  or: {
    eyebrow: "ଆପଣଙ୍କ ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ",
    title: "ଘର ପାଖରେ ସ୍ୱାସ୍ଥ୍ୟ ସେବା ଖୋଜନ୍ତୁ।",
    intro:
      "ଭୁବନେଶ୍ୱରରେ ଯାଞ୍ଚ ହୋଇଥିବା ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ। ଯିବା ପୂର୍ବରୁ ଫୋନ୍ କରନ୍ତୁ।",
    location: "ଆପଣ କେଉଁଠି ସେବା ଚାହୁଁଛନ୍ତି?",
    gps: "ମୋ ଅବସ୍ଥାନ ବ୍ୟବହାର କରନ୍ତୁ",
    manual: "ଅଞ୍ଚଳ କିମ୍ବା ପିନ୍ କୋଡ୍ ଖୋଜନ୍ତୁ",
    service: "ଆପଣ କେଉଁ ସେବା ଖୋଜୁଛନ୍ତି?",
    search: "କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ",
    empty: "ଯାଞ୍ଚ ହୋଇଥିବା ଫଳାଫଳ ନାହିଁ",
    emptyText: "ତଥ୍ୟ ଯାଞ୍ଚ ପରେ କେନ୍ଦ୍ରଗୁଡ଼ିକ ଏଠାରେ ଦେଖାଯିବ।",
    map: "ମାନଚିତ୍ର ଦେଖନ୍ତୁ",
    list: "ମାନଚିତ୍ର ବନ୍ଦ କରନ୍ତୁ",
    why: "ଏହି ଫଳାଫଳ କାହିଁକି",
    call: "ଫୋନ୍ କରନ୍ତୁ",
    directions: "ଦିଗ ଦେଖନ୍ତୁ",
    choose: "ଏହି କେନ୍ଦ୍ର ବାଛନ୍ତୁ",
    safety: "ଜରୁରୀ ସହାୟତା ଦରକାର?",
    safetyText: "ଜରୁରୀ ଚିକିତ୍ସା ପାଇଁ 108 କୁ ଫୋନ୍ କରନ୍ତୁ। ଜନନୀ ଆମ୍ବୁଲାନ୍ସ: 102।",
    tele: "ଘରୁ ପରାମର୍ଶ",
    teleText: "ସରକାରୀ ଇ-ସଞ୍ଜୀବନୀ ସେବା ଦେଖନ୍ତୁ।",
    verify: "ଯାଞ୍ଚଯୋଗ୍ୟ ତଥ୍ୟ",
    verifyText: "ଯିବା ପୂର୍ବରୁ ସେବା ଉପଲବ୍ଧତା ଫୋନ୍ କରି ନିଶ୍ଚିତ କରନ୍ତୁ।",
  },
};
type Locality = {
  id: string;
  locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
};
export default function Navigator({ demo }: { demo: boolean }) {
  const [lang, setLang] = useState<"en" | "or">("en"),
    [query, setQuery] = useState(""),
    [localities, setLocalities] = useState<Locality[]>([]),
    [location, setLocation] = useState<{
      lat: number;
      lng: number;
      label: string;
    } | null>(null),
    [service, setService] = useState("general"),
    [facilities, setFacilities] = useState<Facility[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [map, setMap] = useState(false),
    [searched, setSearched] = useState(false);
  const t = copy[lang];
  async function locate() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Location is unavailable. Search a locality instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          label: lang === "en" ? "Your current location" : "ଆପଣଙ୍କ ଅବସ୍ଥାନ",
        });
      },
      () =>
        setMessage(
          "Location permission was not granted. Search a locality or pincode.",
        ),
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  async function findLocality() {
    setBusy(true);
    try {
      const r = await fetch(
        "/api/v1/localities?query=" + encodeURIComponent(query),
      );
      const d = await r.json();
      if (!r.ok) throw Error();
      setLocalities(d.localities);
      setMessage(
        d.localities.length ? "" : "No locality found. Try a different name.",
      );
    } catch {
      setMessage(
        "Locality search is unavailable. You can still use your location.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function search() {
    if (!location) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/v1/facilities/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: location.lat, lng: location.lng, service }),
      });
      const d = await r.json();
      if (!r.ok) {
        setFacilities([]);
        setMessage(
          d.error.code === "OUTSIDE_SERVICE_AREA"
            ? "SwasthyaPath currently serves Bhubaneswar only."
            : "Verified directory is not connected yet. No unverified data is shown.",
        );
      } else setFacilities(d.facilities);
      setSearched(true);
    } catch {
      setMessage("Unable to connect. Emergency phone links still work.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <div className="pills">
            <span>◉ Bhubaneswar only</span>
            <span>✓ No account needed</span>
            <span>◇ Source-backed information</span>
          </div>
        </div>
        <button
          className="language"
          onClick={() => {
            const next = lang === "en" ? "or" : "en";
            setLang(next);
            document.documentElement.lang = next;
          }}
        >
          {lang === "en" ? "ଓଡ଼ିଆ" : "English"} ⇄
        </button>
      </section>
      <div className="workspace">
        <aside className="panel">
          <span className="step">01 / LOCATION</span>
          <h2>{t.location}</h2>
          <button className="secondary full" onClick={locate}>
            ⌖ {t.gps}
          </button>
          <div className="divider">or</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void findLocality();
            }}
          >
            <label htmlFor="locality">{t.manual}</label>
            <div className="input-row">
              <input
                id="locality"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Unit 1, 751001"
                maxLength={80}
              />
              <button className="secondary" disabled={busy || query.length < 2}>
                Search
              </button>
            </div>
          </form>
          {localities.map((l) => (
            <button
              className="locality"
              key={l.id}
              onClick={() => {
                setLocation({
                  lat: l.latitude,
                  lng: l.longitude,
                  label: l.locality,
                });
                setLocalities([]);
              }}
            >
              {l.locality} · {l.pincode}
            </button>
          ))}
          {demo && (
            <button
              className="locality"
              onClick={() =>
                setLocation({
                  lat: 20.2961,
                  lng: 85.8245,
                  label: "Demo location • Bhubaneswar",
                })
              }
            >
              Use demonstration location
            </button>
          )}
          {location && <p className="selected">⌖ {location.label}</p>}
          <hr />
          <span className="step">02 / SERVICE</span>
          <h2>{t.service}</h2>
          <select
            aria-label={t.service}
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="general">
              {lang === "en" ? "General care" : "ସାଧାରଣ ଚିକିତ୍ସା"}
            </option>
            <option value="maternal">
              {lang === "en" ? "Maternal care" : "ମାତୃ ସ୍ୱାସ୍ଥ୍ୟ"}
            </option>
            <option value="child">
              {lang === "en" ? "Child health" : "ଶିଶୁ ସ୍ୱାସ୍ଥ୍ୟ"}
            </option>
            <option value="emergency">
              {lang === "en" ? "Emergency department" : "ଜରୁରୀ ବିଭାଗ"}
            </option>
          </select>
          <button
            className="primary full"
            disabled={!location || busy}
            onClick={search}
          >
            {busy ? "Loading…" : t.search} →
          </button>
          <p className="small">
            Directory search is available independently of clinical screening.
            Clinical screening remains unavailable until an approved protocol is
            published.
          </p>
        </aside>
        <section className="results" aria-live="polite">
          <div className="results-heading">
            <div>
              <span className="step">YOUR CARE OPTIONS</span>
              <h2>
                {searched
                  ? `${facilities.length} facilities`
                  : "A clearer path to care"}
              </h2>
            </div>
            {facilities.length > 0 && (
              <button className="secondary" onClick={() => setMap(!map)}>
                {map ? t.list : t.map}
              </button>
            )}
          </div>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {map && <CareMap facilities={facilities} />}{" "}
          {!facilities.length ? (
            <div className="empty">
              <div className="empty-icon">✚</div>
              <h3>{t.empty}</h3>
              <p>{t.emptyText}</p>
              <div className="care-chain">
                <span>Primary care</span>
                <b>→</b>
                <span>Referral care</span>
                <b>→</b>
                <span>Follow-through</span>
              </div>
            </div>
          ) : (
            facilities.map((f, i) => (
              <article className="facility" key={f.id}>
                <div className="facility-top">
                  <span className="badge">
                    {f.data_class === "demo"
                      ? "DEMO • FICTIONAL"
                      : "Verified listing"}
                  </span>
                  <span>{f.distance_km?.toFixed(1)} km straight-line</span>
                </div>
                <h3>{lang === "or" ? f.name_or : f.name_en}</h3>
                <p>
                  {f.kind} · {f.address}
                </p>
                <details>
                  <summary>{t.why}</summary>
                  <p>
                    Matches your selected service. Sorted by straight-line
                    distance; this is not a clinical recommendation.
                  </p>
                  <p>Hours and current availability: confirm by phone.</p>
                  {f.source_url && (
                    <a href={f.source_url} rel="noreferrer" target="_blank">
                      Source · reviewed {f.last_verified_at?.slice(0, 10)}
                    </a>
                  )}
                </details>
                <div className="actions">
                  {f.phone && f.data_class !== "demo" && (
                    <a className="secondary" href={"tel:" + f.phone}>
                      {t.call}
                    </a>
                  )}
                  {f.data_class !== "demo" && (
                    <a
                      className="secondary"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.directions}
                    </a>
                  )}
                  <Link className="primary" href={`/facilities/${f.slug}`}>
                    {i === 0 ? "View details →" : "View alternative →"}
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
      <SafeIntake lang={lang} location={location} />
      <section className="support-grid">
        <article className="support urgent">
          <span>↗ EMERGENCY</span>
          <h3>{t.safety}</h3>
          <p>{t.safetyText}</p>
          <div className="actions">
            <a href="tel:108">Call 108 →</a>
            <a href="tel:102">Call 102 →</a>
          </div>
        </article>
        <article className="support">
          <span>↗ TELECONSULTATION</span>
          <h3>{t.tele}</h3>
          <p>{t.teleText}</p>
          <a
            href="https://esanjeevani.mohfw.gov.in/"
            target="_blank"
            rel="noreferrer"
          >
            Open eSanjeevani →
          </a>
        </article>
        <article className="support">
          <span>◇ OUR COMMITMENT</span>
          <h3>{t.verify}</h3>
          <p>{t.verifyText}</p>
          <Link href="/privacy">How your information is handled →</Link>
        </article>
      </section>
      <p className="disclaimer">
        SwasthyaPath provides care navigation, not diagnosis. Odia wording
        requires human review before public launch.
      </p>
    </>
  );
}
