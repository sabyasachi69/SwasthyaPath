import Link from "next/link";
import { notFound } from "next/navigation";
import FacilityFeedback from "@/components/FacilityFeedback";
import ImageWithFallback from "@/components/ImageWithFallback";
import PractitionerDirectory from "@/components/PractitionerDirectory";
import SaveFacility from "@/components/SaveFacility";
import type { Facility, PractitionerProfile } from "@/domain/facility";
import { demoModeEnabled } from "@/lib/demo";
import { db } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type FacilityProfile = Facility & {
  practitioners: PractitionerProfile[];
  heroImage: { public_path: string; alt_text: string } | null;
};

function iconFor(kind: string) {
  const value = kind.toLowerCase();
  if (value.includes("pharmacy")) return "Rx";
  if (value.includes("diagnostic")) return "⌁";
  if (value.includes("clinic")) return "+";
  return "H";
}

function dateInOdisha(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export default async function FacilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let facility: FacilityProfile | undefined;
  const demoMode = demoModeEnabled();

  try {
    const client = await db();
    const { data } = await client
      .from("facilities")
      .select("id,slug,name_en,name_or,address,locality,pincode,latitude,longitude,kind,ownership,website,coord_quality,data_class,verification_status,last_verified_at,valid_until,facility_contacts(phone,verified_at),facility_services(service_code),facility_source_links(data_sources(url)),facility_images(public_path,alt_text,position),facility_practitioners(id,display_name,specialization,qualification)")
      .eq("slug", slug)
      .single();

    if (data) {
      const latestContact = [...data.facility_contacts].sort((a, b) => b.verified_at.localeCompare(a.verified_at))[0];
      const heroImage = [...data.facility_images].sort((a, b) => a.position - b.position)[0] ?? null;
      let practitioners: PractitionerProfile[] = data.facility_practitioners.map((person) => ({
        ...person,
        email: null,
        availability: null,
        schedule: [],
      }));

      if (demoMode) {
        const { data: demoPractitioners, error: practitionerError } = await client
          .from("facility_practitioners")
          .select("id,display_name,specialization,qualification,is_demo,demo_label,department_group,sub_specialty,designation,experience_years,languages,consultation_fee_inr,photo_path")
          .eq("facility_id", data.id)
          .eq("is_demo", true)
          .order("department_group")
          .order("specialization")
          .order("display_name");

        if (!practitionerError && demoPractitioners?.length) {
          const ids = demoPractitioners.map((person) => person.id);
          const [availabilityResult, contactResult, scheduleResult] = await Promise.all([
            client.from("practitioner_availability").select("practitioner_id,current_status,current_location,current_until,next_opd_at,next_opd_location").eq("facility_id", data.id),
            client.from("facility_practitioner_contacts").select("practitioner_id,email").in("practitioner_id", ids),
            client.from("practitioner_schedule").select("practitioner_id,weekday,starts,ends,activity,location").in("practitioner_id", ids),
          ]);
          const availability = new Map((availabilityResult.data ?? []).map((row) => [row.practitioner_id, row]));
          const contacts = new Map((contactResult.data ?? []).map((row) => [row.practitioner_id, row.email]));
          const schedules = Map.groupBy(scheduleResult.data ?? [], (row) => row.practitioner_id);
          practitioners = demoPractitioners.map((person) => {
            const live = availability.get(person.id);
            return {
              ...person,
              email: contacts.get(person.id) ?? null,
              availability: live ? {
                current_status: live.current_status ?? "Off duty",
                current_location: live.current_location,
                current_until: live.current_until,
                next_opd_at: live.next_opd_at,
                next_opd_location: live.next_opd_location,
              } : null,
              schedule: schedules.get(person.id) ?? [],
            };
          });
        }
      }

      facility = {
        id: data.id,
        slug: data.slug,
        name_en: data.name_en,
        name_or: data.name_or,
        address: data.address,
        locality: data.locality,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        kind: data.kind,
        ownership: data.ownership,
        website: data.website,
        coord_quality: data.coord_quality,
        data_class: data.data_class as Facility["data_class"],
        verification_status: data.verification_status,
        last_verified_at: data.last_verified_at,
        valid_until: data.valid_until,
        phone: latestContact?.phone ?? null,
        services: data.facility_services.map((service) => service.service_code),
        source_url: data.facility_source_links[0]?.data_sources?.url ?? null,
        practitioners,
        heroImage,
      };
    }
  } catch {
    facility = undefined;
  }

  if (!facility) notFound();

  return (
    <article className="facility-profile">
      <Link className="back-link" href="/">← Back to nearby care</Link>
      <section className="profile-hero">
        <ImageWithFallback src={facility.heroImage?.public_path} alt={facility.heroImage?.alt_text ?? ""} className="profile-hero-image" fallback={<div className={`profile-cover ${facility.kind.toLowerCase().replaceAll(" ", "-")}`}><span>{iconFor(facility.kind)}</span><small>{facility.kind}</small></div>} />
        <div>
          <span className="badge">{facility.kind}</span>
          <h1>{facility.name_en}</h1>
          {facility.name_or && facility.name_or !== facility.name_en && <p>{facility.name_or}</p>}
          <p className="profile-address">{facility.address}{facility.pincode ? ` · ${facility.pincode}` : ""}</p>
          <div className="actions">
            {facility.phone && <a className="primary" href={`tel:${facility.phone}`}>Call facility</a>}
            <a className="secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Get directions</a>
            {facility.website && <a className="secondary" href={facility.website} target="_blank" rel="noreferrer">Official website</a>}
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-panel">
          <span className="step">FACILITY INFORMATION</span>
          <h2>Available information</h2>
          <dl className="profile-facts">
            <div><dt>Category</dt><dd>{facility.kind}</dd></div>
            <div><dt>Ownership</dt><dd>{facility.ownership ?? "Not provided"}</dd></div>
            <div><dt>Phone</dt><dd>{facility.phone ?? "Not provided"}</dd></div>
            <div><dt>Map position</dt><dd>{facility.coord_quality?.toLowerCase().startsWith("approximate") ? "Approximate locality pin" : "Location pin"}</dd></div>
          </dl>
          <h3>Listed services</h3>
          {facility.services.length ? <ul className="service-list">{facility.services.map((service) => <li key={service}>{service}</li>)}</ul> : <p>Detailed service information has not been supplied. Contact the facility before visiting.</p>}
        </section>

        <aside className={`profile-panel${facility.practitioners.some((person) => person.is_demo) ? " care-team-panel" : ""}`}>
          <span className="step">CARE TEAM</span>
          <h2>Doctors and specialists</h2>
          {facility.practitioners.some((person) => person.is_demo) ? (
            <PractitionerDirectory practitioners={facility.practitioners} />
          ) : facility.practitioners.length ? (
            <div className="practitioner-list">
              {facility.practitioners.map((person) => <article key={person.id}><div className="avatar">{person.display_name.slice(0, 1)}</div><div><h3>{person.display_name}</h3><p>{person.specialization}</p><small>{person.qualification}</small></div></article>)}
            </div>
          ) : (
            <div className="information-empty"><span>＋</span><h3>Staff directory unavailable</h3><p>Doctor names, qualifications and current schedules have not been supplied for this facility.</p></div>
          )}
        </aside>
      </div>

      <section className="source-strip">
        <div><strong>Directory updated</strong><span>{dateInOdisha(facility.last_verified_at)}</span></div>
        <p>Contact the facility to confirm services, clinicians and opening hours before travelling.</p>
        {facility.source_url && <a href={facility.source_url} target="_blank" rel="noreferrer">View listing source →</a>}
      </section>

      <section className="profile-actions">
        <SaveFacility id={facility.id} services={facility.services} />
        <FacilityFeedback facilityId={facility.id} />
      </section>
    </article>
  );
}
