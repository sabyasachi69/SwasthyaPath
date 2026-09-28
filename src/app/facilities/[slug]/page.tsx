import { notFound } from "next/navigation";
import { db } from "@/lib/supabase/server";
import { demoEnabled, demoFacilities } from "@/lib/demo";
import SaveFacility from "@/components/SaveFacility";
import FacilityFeedback from "@/components/FacilityFeedback";
import type { Facility } from "@/domain/facility";
export const dynamic = "force-dynamic";
export default async function FacilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let f: Facility | undefined;
  if (demoEnabled()) f = demoFacilities.find((x) => x.slug === slug);
  else {
    try {
      const c = await db();
      const { data } = await c
        .from("facilities")
        .select(
          "id,slug,name_en,name_or,address,latitude,longitude,kind,data_class,verification_status,last_verified_at,valid_until,facility_contacts(phone,verified_at),facility_services(service_code),facility_source_links(data_sources(url))",
        )
        .eq("slug", slug)
        .single();
      if (data) {
        const latestContact = [...data.facility_contacts].sort((a, b) =>
          b.verified_at.localeCompare(a.verified_at),
        )[0];
        f = {
          id: data.id,
          slug: data.slug,
          name_en: data.name_en,
          name_or: data.name_or,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          kind: data.kind,
          data_class: data.data_class as Facility["data_class"],
          verification_status: data.verification_status,
          last_verified_at: data.last_verified_at,
          valid_until: data.valid_until,
          phone: latestContact?.phone ?? null,
          services: data.facility_services.map((service) => service.service_code),
          source_url:
            data.facility_source_links[0]?.data_sources?.url ?? null,
        };
      }
    } catch {}
  }
  if (!f) notFound();
  return (
    <article className="content-page">
      <span className="badge">
        {f.data_class === "demo"
          ? "DEMO • FICTIONAL FACILITY"
          : "VERIFIED DIRECTORY"}
      </span>
      <h1>{f.name_en}</h1>
      <p>{f.name_or}</p>
      <p>{f.address}</p>
      <h2>Listed services</h2>
      <ul>
        {f.services.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p>
        Confirm current hours and availability by phone before travelling. No
        live capacity or doctor availability is claimed.
      </p>
      {f.source_url && (
        <a href={f.source_url} target="_blank" rel="noreferrer">
          View source • Reviewed {f.last_verified_at?.slice(0, 10)}
        </a>
      )}
      {f.data_class !== "demo" ? (
        <>
          <div className="actions">
            {f.phone && (
              <a className="secondary" href={"tel:" + f.phone}>
                Call facility
              </a>
            )}
            <a
              className="secondary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </div>
          <hr />
          <SaveFacility id={f.id} services={f.services} />
          <FacilityFeedback facilityId={f.id} />
        </>
      ) : (
        <p className="notice">
          This fictional listing demonstrates the interface. Calls, directions
          and saving are disabled.
        </p>
      )}
    </article>
  );
}
