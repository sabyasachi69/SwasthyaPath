"use client";
import { useEffect, useRef } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {Facility} from '@/domain/facility';

type UserLocation = { lat: number; lng: number; accuracy?: number };

export default function CareMap({
  facilities,
  location,
}: {
  facilities: Facility[];
  location: UserLocation;
}) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: true });
    const points: L.LatLngExpression[] = [[location.lat, location.lng]];

    const userMarker = L.circleMarker([location.lat, location.lng], {
      color: "#fff",
      fillColor: "#237b57",
      fillOpacity: 1,
      radius: 9,
      weight: 3,
    }).addTo(map);
    userMarker.bindTooltip("Your live location", { direction: "top" });

    if (location.accuracy && location.accuracy < 5000) {
      L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        color: "#237b57",
        fillColor: "#7fc6a6",
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    }

    facilities.forEach((facility) => {
      const point: L.LatLngExpression = [
        facility.latitude,
        facility.longitude,
      ];
      points.push(point);
      const marker = L.circleMarker(point, {
        color: "#174c38",
        fillColor: "#f6c95f",
        fillOpacity: 1,
        radius: 9,
        weight: 2,
      }).addTo(map);
      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = facility.name_en;
      const meta = document.createElement("div");
      meta.textContent = `${facility.kind}${facility.distance_km != null ? ` · ${facility.distance_km.toFixed(1)} km` : ""}`;
      const link = document.createElement("a");
      link.href = `/facilities/${facility.slug}`;
      link.textContent = "View profile";
      popup.append(title, meta, link);
      marker.bindPopup(popup);
    });

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [34, 34], maxZoom: 14 });
    } else {
      map.setView([location.lat, location.lng], 14);
    }

    let cancelled = false;
    fetch("/api/v1/map-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config) => {
        if (!cancelled && config.url) {
          L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19,
          }).addTo(map);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      map.remove();
    };
  }, [facilities, location]);

  return (
    <div className="map-shell">
      <div className="map-legend" aria-hidden="true">
        <span><i className="map-dot user" /> Your location</span>
        <span><i className="map-dot facility-dot" /> Facility</span>
      </div>
      <div ref={el} className="care-map" aria-label="Nearby healthcare facilities map" />
    </div>
  );
}
