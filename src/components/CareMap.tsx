"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@/domain/facility";
import type { RouteInfo } from "./SelectedFacility";

type LocationPoint = { lat: number; lng: number; label: string; accuracy?: number };
const bhubaneswar: L.LatLngExpression = [20.2961, 85.8245];

function markerKind(kind: string) {
  const name = kind.toLowerCase();
  if (name.includes("pharmacy")) return "pharmacy";
  if (name.includes("diagnostic") || name.includes("lab")) return "diagnostic";
  if (name.includes("clinic")) return "clinic";
  return "hospital";
}

function facilityIcon(kind: string, selected: boolean) {
  const type = markerKind(kind);
  const symbol = type === "pharmacy" ? "💊" : type === "diagnostic" ? "🧪" : type === "clinic" ? "🩺" : "🏥";
  const image = type === "pharmacy" ? "" : `<img src="/markers/${type}.svg" alt="" />`;
  return L.divIcon({ className: "facility-marker-wrap", html: `<span class="facility-marker ${type}${selected ? " selected" : ""}">${image || symbol}</span>`, iconSize: [42, 42], iconAnchor: [21, 38], popupAnchor: [0, -38] });
}

function userIcon() {
  return L.divIcon({ className: "user-marker-wrap", html: '<span class="user-marker"><img src="/markers/user.svg" alt="" /></span>', iconSize: [44, 44], iconAnchor: [22, 39], tooltipAnchor: [0, -40] });
}

export default function CareMap({ facilities, location, selectedFacility, onSelect, onRouteInfo }: { facilities: Facility[]; location: LocationPoint | null; selectedFacility: Facility | null; onSelect: (facility: Facility) => void; onRouteInfo: (route: RouteInfo | null) => void }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: true, scrollWheelZoom: true, preferCanvas: true });
    map.setView(location ? [location.lat, location.lng] : bhubaneswar, location ? 14 : 12);
    let cancelled = false;
    fetch("/api/v1/map-config", { cache: "no-store" }).then((response) => response.json()).then((config) => { if (!cancelled && config.url) L.tileLayer(config.url, { attribution: config.attribution, maxZoom: 19 }).addTo(map); }).catch(() => undefined);

    if (location) {
      const marker = L.marker([location.lat, location.lng], { icon: userIcon(), zIndexOffset: 1000 }).addTo(map);
      marker.bindTooltip(location.label, { direction: "top" });
      if (location.accuracy && location.accuracy < 5000) L.circle([location.lat, location.lng], { radius: location.accuracy, color: "#237b57", fillColor: "#7fc6a6", fillOpacity: 0.12, weight: 1 }).addTo(map);
    }
    facilities.forEach((facility) => {
      const selected = selectedFacility?.id === facility.id;
      const marker = L.marker([facility.latitude, facility.longitude], { icon: facilityIcon(facility.kind, selected), zIndexOffset: selected ? 900 : 0 }).addTo(map);
      marker.bindTooltip(`${facility.name_en} · ${facility.kind}`, { direction: "top", opacity: 0.95 });
      marker.on("click", () => onSelect(facility));
    });

    if (!location || !selectedFacility) {
      onRouteInfo(null);
      return () => { cancelled = true; map.remove(); };
    }
    const fallback = () => {
      const distanceKm = Math.round(Math.hypot(location.lat - selectedFacility.latitude, location.lng - selectedFacility.longitude) * 111 * 10) / 10;
      L.polyline([[location.lat, location.lng], [selectedFacility.latitude, selectedFacility.longitude]], { color: "#a66612", weight: 4, opacity: 0.85, dashArray: "8 9" }).addTo(map);
      map.fitBounds([[location.lat, location.lng], [selectedFacility.latitude, selectedFacility.longitude]], { padding: [45, 45], maxZoom: 14, animate: true });
      onRouteInfo({ distanceKm, durationMinutes: null, routePreviewAvailable: false });
    };
    void fetch("/api/v1/routes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: location, to: { lat: selectedFacility.latitude, lng: selectedFacility.longitude } }) })
      .then(async (response) => ({ response, data: await response.json() as { distanceKm?: number; durationMinutes?: number; geometry?: { coordinates?: [number, number][] } } }))
      .then(({ response, data }) => {
        if (cancelled) return;
        const coordinates = data.geometry?.coordinates;
        if (!response.ok || !coordinates?.length || data.distanceKm == null || data.durationMinutes == null) { fallback(); return; }
        L.polyline(coordinates.map(([lng, lat]) => [lat, lng] as L.LatLngExpression), { color: "#237b57", weight: 5, opacity: 0.9 }).addTo(map);
        map.fitBounds([[location.lat, location.lng], [selectedFacility.latitude, selectedFacility.longitude]], { padding: [45, 45], maxZoom: 14, animate: true });
        onRouteInfo({ distanceKm: data.distanceKm, durationMinutes: data.durationMinutes, routePreviewAvailable: true });
      }).catch(() => { if (!cancelled) fallback(); });
    return () => { cancelled = true; map.remove(); };
  }, [facilities, location, onRouteInfo, onSelect, selectedFacility]);

  return <div className="map-shell"><div className="map-legend" aria-label="Map marker legend"><span><i className="map-dot user" /> Your area</span><span>🏥 Hospital</span><span>🩺 Clinic</span><span>💊 Pharmacy</span><span>🧪 Diagnostic</span></div><div ref={el} className="care-map" aria-label="Bhubaneswar healthcare directory map" /></div>;
}
