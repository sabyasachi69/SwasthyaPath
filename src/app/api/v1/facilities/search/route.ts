import { z } from "zod";
import { db } from "@/lib/supabase/server";
import {
  rankFacilities,
  inBhubaneswar,
  type Facility,
} from "@/domain/facility";
import { failure, serviceFailure } from "@/lib/http";
const input = z
  .object({
    lat: z.number().finite(),
    lng: z.number().finite(),
    service: z.enum(["general", "maternal", "child", "emergency"]).optional(),
    kind: z.enum(["hospital", "clinic", "pharmacy", "diagnostic"]).optional(),
  })
  .strict();
export async function POST(req: Request) {
  try {
    const parsed = input.safeParse(await req.json());
    if (!parsed.success) return failure("VALIDATION_ERROR", 400);
    const { lat, lng, service, kind } = parsed.data;
    if (!inBhubaneswar(lat, lng)) return failure("OUTSIDE_SERVICE_AREA", 422);
    const client = await db();
    const { data, error } = await client.rpc("search_facilities", {
      p_lat: lat,
      p_lng: lng,
      p_service: service ?? null,
      p_kind: kind ?? null,
    });
    if (error) throw error;
    const rows = (data ?? []) as unknown as Facility[];
    return Response.json(
      {
        facilities: rankFacilities(rows, { lat, lng }, service),
        distance_type: "straight_line",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return serviceFailure(error, "SERVICE_UNAVAILABLE");
  }
}
