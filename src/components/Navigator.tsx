"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Facility } from "@/domain/facility";
import SafeIntake from "./SafeIntake";

const CareMap = dynamic(() => import("./CareMap"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

const copy = {
  en: {
    eyebrow: "CARE ACROSS BHUBANESWAR",
    title: "Find the right place, close to you.",
    intro: "Explore hospitals, clinics, diagnostic centres and pharmacies across Bhubaneswar. Compare nearby options and plan your visit.",
    location: "Where do you need care?",
    gps: "Use my live location",
    manual: "Search locality or 6-digit pincode",
    category: "What kind of place do you need?",
    search: "Find nearby care",
    empty: "Choose your location to begin",
    emptyText: "Use live location or search a locality to see nearby hospitals, clinics and pharmacies.",
    map: "Show map",
    list: "Hide map",
    why: "Why this result",
    call: "Call facility",
    directions: "Directions",
    safety: "Need urgent help?",
    safetyText: "For a medical emergency, call 108. Janani ambulance: 102. You do not need an account.",
    tele: "Consult from home",
    teleText: "Visit the official eSanjeevani service to explore available consultations.",
    verify: "Information you can check",
    verifyText: "Listings include their source and review date. Call the facility to confirm current services before travelling.",
  },
  or: {
    eyebrow: "ଭୁବନେଶ୍ୱରରେ ସ୍ୱାସ୍ଥ୍ୟ ସେବା",
    title: "ଆପଣଙ୍କ ପାଖରେ ସଠିକ୍ ସେବା ଖୋଜନ୍ତୁ।",
    intro: "ଭୁବନେଶ୍ୱରର ହସ୍ପିଟାଲ, କ୍ଲିନିକ୍, ଡାୟାଗ୍ନୋଷ୍ଟିକ୍ କେନ୍ଦ୍ର ଏବଂ ଫାର୍ମାସି ଦେଖନ୍ତୁ।",
    location: "ଆପଣ କେଉଁଠି ସେବା ଚାହୁଁଛନ୍ତି?",
    gps: "ମୋ ଲାଇଭ୍ ଅବସ୍ଥାନ ବ୍ୟବହାର କରନ୍ତୁ",
    manual: "ଅଞ୍ଚଳ କିମ୍ବା ପିନ୍ କୋଡ୍ ଖୋଜନ୍ତୁ",
    category: "ଆପଣ କେଉଁ ପ୍ରକାର ସ୍ଥାନ ଚାହୁଁଛନ୍ତି?",
    search: "ପାଖରେ ସେବା ଖୋଜନ୍ତୁ",
    empty: "ଆରମ୍ଭ କରିବାକୁ ଅବସ୍ଥାନ ବାଛନ୍ତୁ",
    emptyText: "ଲାଇଭ୍ ଅବସ୍ଥାନ କିମ୍ବା ଅଞ୍ଚଳ ଖୋଜି ପାଖରେ ସେବା ଦେଖନ୍ତୁ।",
    map: "ମାନଚିତ୍ର ଦେଖନ୍ତୁ",
    list: "ମାନଚିତ୍ର ବନ୍ଦ କରନ୍ତୁ",
    why: "ଏହି ଫଳାଫଳ କାହିଁକି",
    call: "ଫୋନ୍ କରନ୍ତୁ",
    directions: "ଦିଗ ଦେଖନ୍ତୁ",
    safety: "ଜରୁରୀ ସହାୟତା ଦରକାର?",
    safetyText: "ଜରୁରୀ ଚିକିତ୍ସା ପାଇଁ 108 କୁ ଫୋନ୍ କରନ୍ତୁ। ଜନନୀ ଆମ୍ବୁଲାନ୍ସ: 102।",
    tele: "ଘରୁ ପରାମର୍ଶ",
    teleText: "ସରକାରୀ ଇ-ସଞ୍ଜୀବନୀ ସେବା ଦେଖନ୍ତୁ।",
    verify: "ଯାଞ୍ଚଯୋଗ୍ୟ ତଥ୍ୟ",
    verifyText: "ଯିବା ପୂର୍ବରୁ ଫୋନ୍ କରି ସେବା ନିଶ୍ଚିତ କରନ୍ତୁ।",
  },
};

type Locality = { id: string; locality: string; pincode: string; latitude: number; longitude: number };
type LocationPoint = { lat: number; lng: number; label: string; accuracy?: number };

function kindIcon(kind: string) {
  const value = kind.toLowerCase();
  if (value.includes("pharmacy")) return "Rx";
  if (value.includes("diagnostic")) return "⌁";
  if (value.includes("clinic")) return "+";
  return "H";
}

export default function Navigator() {
  const [lang, setLang] = useState<"en" | "or">("en");
  const [query, setQuery] = useState("");
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [location, setLocation] = useState<LocationPoint | null>(null);
  const [kind, setKind] = useState("all");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [map, setMap] = useState(false);
  const [searched, setSearched] = useState(false);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);
  const t = copy[lang];

  useEffect(() => () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  async function searchAt(point: LocationPoint) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/facilities/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: point.lat, lng: point.lng, ...(kind !== "all" ? { kind } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFacilities([]);
        setMessage(data.error?.code === "OUTSIDE_SERVICE_AREA" ? "SwasthyaPath currently serves Bhubaneswar only." : "The directory is temporarily unavailable. Please try again.");
      } else {
        setFacilities(data.facilities);
        setMap(true);
      }
      setSearched(true);
    } catch {
      setMessage("Unable to connect. Emergency phone links still work.");
    } finally {
      setBusy(false);
    }
  }

  function locate() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Location is unavailable. Search a locality instead.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: lang === "en" ? "Your current location" : "ଆପଣଙ୍କ ଅବସ୍ଥାନ",
        };
        setLocation(point);
        setTracking(true);
        void searchAt(point);
        if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = navigator.geolocation.watchPosition(
          (next) => setLocation((current) => ({
            lat: next.coords.latitude,
            lng: next.coords.longitude,
            accuracy: next.coords.accuracy,
            label: current?.label ?? "Your current location",
          })),
          () => setTracking(false),
          { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
        );
      },
      () => {
        setBusy(false);
        setMessage("Location permission was not granted. Search a locality or pincode.");
      },
      { timeout: 10000, maximumAge: 30000, enableHighAccuracy: true },
    );
  }

  async function findLocality() {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/localities?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error();
      setLocalities(data.localities);
      setMessage(data.localities.length ? "" : "No locality found. Try a different name.");
    } catch {
      setMessage("Locality search is unavailable. You can still use your location.");
    } finally {
      setBusy(false);
    }
  }

  function chooseLocality(locality: Locality) {
    const point = { lat: locality.latitude, lng: locality.longitude, label: `${locality.locality} · ${locality.pincode}` };
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    setTracking(false);
    setLocation(point);
    setLocalities([]);
    void searchAt(point);
  }

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <div className="pills"><span>◉ Bhubaneswar only</span><span>✓ No account needed</span><span>◇ Source-backed directory</span></div>
        </div>
        <button className="language" onClick={() => { const next = lang === "en" ? "or" : "en"; setLang(next); document.documentElement.lang = next; }}>
          {lang === "en" ? "ଓଡ଼ିଆ" : "English"} ⇄
        </button>
      </section>

      <div className="workspace">
        <aside className="panel">
          <span className="step">01 / LOCATION</span>
          <h2>{t.location}</h2>
          <button className="secondary full" onClick={locate} disabled={busy}>⌖ {t.gps}</button>
          <div className="divider">or</div>
          <form onSubmit={(event) => { event.preventDefault(); void findLocality(); }}>
            <label htmlFor="locality">{t.manual}</label>
            <div className="input-row">
              <input id="locality" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Unit 1, 751001" maxLength={80} />
              <button className="secondary" disabled={busy || query.length < 2}>Search</button>
            </div>
          </form>
          {localities.map((locality) => <button className="locality" key={locality.id} onClick={() => chooseLocality(locality)}>{locality.locality} · {locality.pincode}</button>)}
          {location && <p className="selected">⌖ {location.label}{tracking ? " · live" : ""}</p>}
          <hr />
          <span className="step">02 / CATEGORY</span>
          <h2>{t.category}</h2>
          <select aria-label={t.category} value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">All nearby care</option><option value="hospital">Hospitals</option><option value="clinic">Clinics</option><option value="pharmacy">Pharmacies</option><option value="diagnostic">Diagnostics</option>
          </select>
          <button className="primary full" disabled={!location || busy} onClick={() => location && void searchAt(location)}>{busy ? "Loading…" : t.search} →</button>
          <p className="small">Your precise location stays on this device and is used only to sort nearby results.</p>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results-heading">
            <div><span className="step">NEARBY CARE</span><h2>{searched ? `${facilities.length} places found` : "Your care directory"}</h2></div>
            {facilities.length > 0 && <button className="secondary" onClick={() => setMap(!map)}>{map ? t.list : t.map}</button>}
          </div>
          {message && <p className="notice" role="status">{message}</p>}
          {map && location && <CareMap facilities={facilities} location={location} />}
          {!facilities.length ? (
            <div className="empty"><div className="empty-icon">✚</div><h3>{t.empty}</h3><p>{t.emptyText}</p><div className="care-chain"><span>Hospitals</span><b>·</b><span>Clinics</span><b>·</b><span>Pharmacies</span></div></div>
          ) : (
            <div className="facility-grid">
              {facilities.map((facility) => (
                <article className="facility" key={facility.id}>
                  <div className={`facility-visual ${facility.kind.toLowerCase().replaceAll(" ", "-")}`}><span>{kindIcon(facility.kind)}</span><small>{facility.kind}</small></div>
                  <div className="facility-body">
                    <div className="facility-top"><span className="badge">{facility.kind}</span><span>{facility.distance_km?.toFixed(1)} km away</span></div>
                    <h3>{lang === "or" && facility.name_or ? facility.name_or : facility.name_en}</h3>
                    <p>{facility.address}</p>
                    <details><summary>{t.why}</summary><p>Nearby directory match, sorted by straight-line distance.</p><p>Call ahead to confirm current services and opening hours.</p>{facility.source_url && <a href={facility.source_url} rel="noreferrer" target="_blank">View listing source · {facility.last_verified_at?.slice(0, 10)}</a>}</details>
                    <div className="actions">
                      {facility.phone && <a className="secondary" href={`tel:${facility.phone}`}>{t.call}</a>}
                      <a className="secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">{t.directions}</a>
                      <Link className="primary" href={`/facilities/${facility.slug}`}>View profile →</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <SafeIntake lang={lang} location={location} />
      <section className="support-grid">
        <article className="support urgent"><span>↗ EMERGENCY</span><h3>{t.safety}</h3><p>{t.safetyText}</p><div className="actions"><a href="tel:108">Call 108 →</a><a href="tel:102">Call 102 →</a></div></article>
        <article className="support"><span>↗ TELECONSULTATION</span><h3>{t.tele}</h3><p>{t.teleText}</p><a href="https://esanjeevani.mohfw.gov.in/" target="_blank" rel="noreferrer">Open eSanjeevani →</a></article>
        <article className="support"><span>◇ DIRECTORY</span><h3>{t.verify}</h3><p>{t.verifyText}</p><Link href="/privacy">How your information is handled →</Link></article>
      </section>
      <p className="disclaimer">SwasthyaPath provides care navigation, not diagnosis.</p>
    </>
  );
}
