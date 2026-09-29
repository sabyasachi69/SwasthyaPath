"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Facility } from "@/domain/facility";
import { symptomGuidance, type FacilityFilter } from "@/domain/symptom-guidance";
import SelectedFacility, { type FacilityDetail, type RouteInfo } from "./SelectedFacility";

const CareMap = dynamic(() => import("./CareMap"), { ssr: false, loading: () => <p className="map-loading">Loading Bhubaneswar map…</p> });
const CITY = { lat: 20.2961, lng: 85.8245, label: "Bhubaneswar" };

const copy = {
  en: { eyebrow: "CARE ACROSS BHUBANESWAR", title: "Find care, close to you.", intro: "Explore hospitals, clinics, diagnostic centres and pharmacies across Bhubaneswar. Compare nearby options and plan your visit.", location: "Where do you need care?", gps: "Use my live location", manual: "Search locality or 6-digit pincode", symptoms: "Describe your symptoms", placeholder: "Example: fever, cough, chest pain, headache…", override: "Choose a different facility type", search: "Find nearby care", call: "Call facility", directions: "Directions", why: "Why this result" },
  or: { eyebrow: "ଭୁବନେଶ୍ୱରରେ ସ୍ୱାସ୍ଥ୍ୟ ସେବା", title: "ଆପଣଙ୍କ ପାଖରେ ସେବା ଖୋଜନ୍ତୁ।", intro: "ଭୁବନେଶ୍ୱରର ହସ୍ପିଟାଲ, କ୍ଲିନିକ୍, ଡାୟାଗ୍ନୋଷ୍ଟିକ୍ କେନ୍ଦ୍ର ଏବଂ ଫାର୍ମାସି ଦେଖନ୍ତୁ।", location: "ଆପଣ କେଉଁଠି ସେବା ଚାହୁଁଛନ୍ତି?", gps: "ମୋ ଲାଇଭ୍ ଅବସ୍ଥାନ ବ୍ୟବହାର କରନ୍ତୁ", manual: "ଅଞ୍ଚଳ କିମ୍ବା ପିନ୍ କୋଡ୍ ଖୋଜନ୍ତୁ", symptoms: "ଆପଣଙ୍କ ଲକ୍ଷଣ ଲେଖନ୍ତୁ", placeholder: "ଉଦାହରଣ: ଜ୍ୱର, କାଶ, ମୁଣ୍ଡବିନ୍ଧା…", override: "ଅନ୍ୟ ସୁବିଧା ପ୍ରକାର ବାଛନ୍ତୁ", search: "ପାଖରେ ସେବା ଖୋଜନ୍ତୁ", call: "ଫୋନ୍ କରନ୍ତୁ", directions: "ଦିଗ ଦେଖନ୍ତୁ", why: "ଏହି ଫଳାଫଳ କାହିଁକି" },
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
  const [kind, setKind] = useState<FacilityFilter>("all");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<FacilityDetail | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [manualOverride, setManualOverride] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);
  const lastAutoFilter = useRef("");
  const t = copy[lang];
  const guidance = useMemo(() => symptomGuidance(symptoms), [symptoms]);

  const searchAt = useCallback(async (point: LocationPoint, requestedKind: FacilityFilter) => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/v1/facilities/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: point.lat, lng: point.lng, ...(requestedKind !== "all" ? { kind: requestedKind } : {}) }) });
      const data = await response.json();
      if (!response.ok) { setFacilities([]); setSelectedFacility(null); setMessage(data.error?.code === "OUTSIDE_SERVICE_AREA" ? "SwasthyaPath currently serves Bhubaneswar only." : "The directory is temporarily unavailable. Please try again."); }
      else { setFacilities(data.facilities); setSelectedFacility((current) => current && !data.facilities.some((facility: Facility) => facility.id === current.id) ? null : current); }
      setSearched(true);
    } catch { setMessage("Unable to connect to the directory. Please try again."); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void searchAt(CITY, "all"); }, 0); return () => window.clearTimeout(timer); }, [searchAt]); // City map and directory are useful before a location is chosen.
  useEffect(() => () => { if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current); }, []);
  useEffect(() => {
    if (!guidance || manualOverride) return;
    const key = `${symptoms}:${guidance.recommendedKind}`;
    if (lastAutoFilter.current === key) return;
    const timeout = window.setTimeout(() => {
      lastAutoFilter.current = key;
      setKind(guidance.recommendedKind);
      void searchAt(location ?? CITY, guidance.recommendedKind);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [guidance, location, manualOverride, searchAt, symptoms]);
  useEffect(() => {
    if (!selectedFacility) return;
    const controller = new AbortController();
    void fetch(`/api/v1/facilities/${selectedFacility.slug}`, { signal: controller.signal, cache: "no-store" }).then(async (response) => ({ response, data: await response.json() as { facility?: FacilityDetail } })).then(({ response, data }) => { if (response.ok && data.facility) setSelectedDetail({ ...data.facility, distance_km: selectedFacility.distance_km }); }).catch(() => undefined);
    return () => controller.abort();
  }, [selectedFacility]);

  const selectFacility = useCallback((facility: Facility) => { setSelectedFacility(facility); setSelectedDetail(null); setRoute(null); }, []);
  const routeChanged = useCallback((next: RouteInfo | null) => setRoute(next), []);
  function locate() {
    setMessage("");
    if (!navigator.geolocation) { setMessage("Location is unavailable. Search a locality instead."); return; }
    setBusy(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, label: lang === "en" ? "Your current location" : "ଆପଣଙ୍କ ଅବସ୍ଥାନ" };
      setLocation(point); setTracking(true); void searchAt(point, kind);
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = navigator.geolocation.watchPosition((next) => setLocation((current) => ({ lat: next.coords.latitude, lng: next.coords.longitude, accuracy: next.coords.accuracy, label: current?.label ?? "Your current location" })), () => setTracking(false), { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
    }, () => { setBusy(false); setMessage("Location permission was not granted. Search a locality or pincode."); }, { timeout: 10000, maximumAge: 30000, enableHighAccuracy: true });
  }
  async function findLocality() {
    setBusy(true);
    try { const response = await fetch(`/api/v1/localities?query=${encodeURIComponent(query)}`); const data = await response.json(); if (!response.ok) throw new Error(); setLocalities(data.localities); setMessage(data.localities.length ? "" : /^\d{6}$/.test(query) ? "This pincode is not in the Bhubaneswar directory yet." : "No locality found. Try a different name."); }
    catch { setMessage("Locality search is unavailable. You can still use your location."); }
    finally { setBusy(false); }
  }
  function chooseLocality(locality: Locality) {
    const point = { lat: locality.latitude, lng: locality.longitude, label: `${locality.locality} · ${locality.pincode}` };
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    setTracking(false); setLocation(point); setLocalities([]); void searchAt(point, kind);
  }
  function chooseKind(next: FacilityFilter) { setManualOverride(true); setKind(next); void searchAt(location ?? CITY, next); }

  return <>
    <section className="hero"><div><span className="eyebrow">{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p><div className="pills"><span>◉ Bhubaneswar only</span><span>✓ No account needed</span><span>◇ Source-backed directory</span></div></div><button className="language" onClick={() => { const next = lang === "en" ? "or" : "en"; setLang(next); document.documentElement.lang = next; }}>{lang === "en" ? "ଓଡ଼ିଆ" : "English"} ⇄</button></section>
    <div className="workspace">
      <aside className="panel"><span className="step">01 / LOCATION</span><h2>{t.location}</h2><button className="secondary full" onClick={locate} disabled={busy}>⌖ {t.gps}</button><div className="divider">or</div><form onSubmit={(event) => { event.preventDefault(); void findLocality(); }}><label htmlFor="locality">{t.manual}</label><div className="input-row"><input id="locality" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Unit 1, 751001" maxLength={80} /><button className="secondary" disabled={busy || query.length < 2}>Search</button></div></form>{localities.map((locality) => <button className="locality" key={locality.id} onClick={() => chooseLocality(locality)}>{locality.locality} · {locality.pincode}</button>)}{location && <p className="selected">⌖ {location.label}{tracking ? " · live" : ""}</p>}<hr />
        <span className="step">02 / SYMPTOM GUIDANCE</span><h2>{t.symptoms}</h2><textarea aria-label={t.symptoms} value={symptoms} onChange={(event) => { setSymptoms(event.target.value); setManualOverride(false); }} placeholder={t.placeholder} maxLength={280} />
        {guidance ? <div className={`guidance${guidance.urgent ? " urgent-guidance" : ""}`}><span>Possible health issue/category</span><strong>{guidance.category}</strong><span>Recommended facility</span><strong>{guidance.recommendedKind === "hospital" ? "Hospital" : guidance.recommendedKind === "clinic" ? "Clinic" : guidance.recommendedKind === "pharmacy" ? "Pharmacy" : "Diagnostic centre"}</strong><p>This is general navigation guidance, not a medical diagnosis.</p>{guidance.urgent && <p><strong>Seek emergency medical care without delay if symptoms are sudden or severe.</strong></p>}</div> : symptoms.trim().length >= 3 ? <p className="small">We could not confidently match that description. Choose a facility type below.</p> : <p className="small">Your description stays in this browser and is not saved.</p>}
        <label htmlFor="facility-type">{t.override}</label><select id="facility-type" value={kind} onChange={(event) => chooseKind(event.target.value as FacilityFilter)}><option value="all">All nearby care</option><option value="hospital">Hospitals</option><option value="clinic">Clinics</option><option value="pharmacy">Pharmacies</option><option value="diagnostic">Diagnostic centres</option></select><button className="primary full" disabled={busy} onClick={() => void searchAt(location ?? CITY, kind)}>{busy ? "Loading…" : t.search} →</button><p className="small">Your precise location stays on this device and is used only to sort nearby results.</p>
      </aside>
      <section className="results" aria-live="polite"><div className="results-heading"><div><span className="step">NEARBY CARE DIRECTORY</span><h2>{searched ? `${facilities.length} places found` : "Bhubaneswar care directory"}</h2></div></div>{message && <p className="notice" role="status">{message}</p>}<CareMap facilities={facilities} location={location} selectedFacility={selectedFacility} onSelect={selectFacility} onRouteInfo={routeChanged} /><SelectedFacility facility={selectedDetail} route={route} loading={Boolean(selectedFacility && !selectedDetail)} />
        {!facilities.length ? <div className="empty"><div className="empty-icon">✚</div><h3>No matching healthcare facilities found</h3><p>Try another facility type, choose a different locality, or expand your search.</p></div> : <div className="facility-grid">{facilities.map((facility) => <article className={`facility${selectedFacility?.id === facility.id ? " active" : ""}`} key={facility.id}><button className="facility-select" type="button" aria-label={`Select ${facility.name_en}`} onClick={() => selectFacility(facility)}><div className={`facility-visual ${facility.kind.toLowerCase().replaceAll(" ", "-")}`}><span>{kindIcon(facility.kind)}</span><small>{facility.kind}</small></div></button><div className="facility-body"><div className="facility-top"><span className="badge">{facility.kind}</span><span>{facility.distance_km?.toFixed(1)} km away</span></div><h3>{lang === "or" && facility.name_or ? facility.name_or : facility.name_en}</h3><p>{facility.address}</p><details><summary>{t.why}</summary><p>Nearby directory match, sorted by straight-line distance.</p><p>Call ahead to confirm current services and opening hours.</p>{facility.source_url && <a href={facility.source_url} rel="noreferrer" target="_blank">View listing source · {facility.last_verified_at?.slice(0, 10)}</a>}</details><div className="actions">{facility.phone && <a className="secondary" href={`tel:${facility.phone}`}>{t.call}</a>}<a className="secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">{t.directions}</a><Link className="primary" href={`/facilities/${facility.slug}`}>View profile →</Link></div></div></article>)}</div>}
      </section>
    </div>
    <section className="support-grid"><article className="support urgent"><span>EMERGENCY HELPLINES</span><h3>Ambulance information</h3><p><strong>108</strong> — Emergency Ambulance Helpline</p><p><strong>102</strong> — Ambulance / Patient Transport Helpline</p><p>For emergencies, use the helpline appropriate to your situation.</p></article><article className="support"><span>◇ DIRECTORY</span><h3>Information you can check</h3><p>Listings include their source and review date. Contact the facility to confirm current services before travelling.</p><Link href="/privacy">How your information is handled →</Link></article></section>
    <p className="disclaimer">SwasthyaPath provides general care navigation and does not replace professional medical advice.</p>
  </>;
}
