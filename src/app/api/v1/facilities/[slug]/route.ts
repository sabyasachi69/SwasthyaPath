import { db } from "@/lib/supabase/server";
import { failure, serviceFailure } from "@/lib/http";
import type { Facility, Practitioner } from "@/domain/facility";

type DetailRow = {
  id: string; slug: string; name_en: string; name_or: string; address: string; locality: string | null; pincode: string | null;
  latitude: number; longitude: number; kind: string; ownership: string | null; website: string | null; coord_quality: string | null;
  data_class: Facility["data_class"]; verification_status: string; last_verified_at: string | null; valid_until: string | null;
  facility_contacts: { phone: string; verified_at: string }[];
  facility_services: { service_code: string }[];
  facility_source_links: { data_sources: { url: string } | null }[];
  facility_practitioners: Practitioner[];
  operating_hours: { weekday: number | null; opens: string | null; closes: string | null; closed: boolean }[];
};

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!/^[a-z0-9-]+$/.test(slug)) return failure("VALIDATION_ERROR", 400);
    const client = await db();
    const { data, error } = await client.from("facilities").select("id,slug,name_en,name_or,address,locality,pincode,latitude,longitude,kind,ownership,website,coord_quality,data_class,verification_status,last_verified_at,valid_until,facility_contacts(phone,verified_at),facility_services(service_code),facility_source_links(data_sources(url)),facility_practitioners(id,display_name,specialization,qualification),operating_hours(weekday,opens,closes,closed)").eq("slug", slug).single();
    if (error || !data) return failure("NOT_FOUND", 404);
    const row = data as unknown as DetailRow;
    const contact = [...row.facility_contacts].sort((a, b) => b.verified_at.localeCompare(a.verified_at))[0];
    const openingHours = row.operating_hours.filter((hour) => hour.weekday !== null).sort((a, b) => (a.weekday ?? 0) - (b.weekday ?? 0)).map((hour) => `${weekdays[hour.weekday ?? 0]}: ${hour.closed ? "Closed" : hour.opens && hour.closes ? `${hour.opens.slice(0, 5)}–${hour.closes.slice(0, 5)}` : "Hours not provided"}`);
    return Response.json({
      facility: {
        ...row,
        phone: contact?.phone ?? null,
        services: row.facility_services.map((service) => service.service_code),
        source_url: row.facility_source_links[0]?.data_sources?.url ?? null,
        practitioners: row.facility_practitioners,
        openingHours,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serviceFailure(error, "SERVICE_UNAVAILABLE");
  }
}
