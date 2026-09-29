"use client";

import Link from "next/link";
import type { Facility, Practitioner } from "@/domain/facility";

export type FacilityDetail = Facility & {
  practitioners: Practitioner[];
  openingHours: string[];
};

export type RouteInfo = {
  distanceKm: number;
  durationMinutes: number | null;
  routePreviewAvailable: boolean;
};

export default function SelectedFacility({ facility, route, loading }: { facility: FacilityDetail | null; route: RouteInfo | null; loading: boolean }) {
  if (loading) return <section className="selected-facility"><span className="step">SELECTED FACILITY</span><p>Loading facility details…</p></section>;
  if (!facility) return <section className="selected-facility empty-selection"><span className="step">SELECTED FACILITY</span><h2>Select a marker to view details</h2><p>Choose a place from the map or directory. Its services and practitioner information will appear here.</p></section>;

  return <section className="selected-facility" aria-live="polite">
    <div className="selected-heading"><div><span className="step">SELECTED FACILITY</span><h2>{facility.name_en}</h2><p>{facility.kind} · {facility.address}</p></div><Link className="secondary" href={`/facilities/${facility.slug}`}>Full profile →</Link></div>
    <dl className="selected-facts">
      <div><dt>Distance</dt><dd>{route?.distanceKm ?? facility.distance_km ?? "—"}{typeof (route?.distanceKm ?? facility.distance_km) === "number" ? " km" : ""}</dd></div>
      <div><dt>Travel time</dt><dd>{route?.durationMinutes ? `${route.durationMinutes} min` : "Routing estimate unavailable"}</dd></div>
      <div><dt>Contact</dt><dd>{facility.phone ? <a href={`tel:${facility.phone}`}>{facility.phone}</a> : "Not provided"}</dd></div>
      <div><dt>Directions</dt><dd><a href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Open navigation →</a></dd></div>
    </dl>
    {!route?.routePreviewAvailable && route && <p className="route-note">The line on the map is a direct connection. Open navigation for a road route and live traffic.</p>}
    <div className="selected-columns">
      <div><h3>Services & hours</h3>{facility.services.length ? <ul className="service-list">{facility.services.map((service) => <li key={service}>{service}</li>)}</ul> : <p>Service details have not been supplied. Contact the facility before visiting.</p>}{facility.openingHours.length ? <ul className="hours-list">{facility.openingHours.map((hour) => <li key={hour}>{hour}</li>)}</ul> : <p>Opening hours are not available in the directory.</p>}</div>
      <div><h3>Doctors & specialists</h3>{facility.practitioners.length ? <div className="practitioner-list">{facility.practitioners.map((person) => <article key={person.id}><div className="avatar">{person.display_name.slice(0, 1)}</div><div><h4>{person.display_name}</h4><p>{person.specialization}</p><small>{person.qualification}</small></div></article>)}</div> : <p>Doctor information has not been supplied for this facility.</p>}</div>
    </div>
  </section>;
}
