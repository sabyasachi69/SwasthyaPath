import { z } from "zod";
import { db } from "@/lib/supabase/server";
import { demoEnabled, demoFacilities } from "@/lib/demo";
import {
  rankFacilities,
  inBhubaneswar,
  type Facility,
} from "@/domain/facility";
import { failure } from "@/lib/http";
const input = z
  .object({
    lat: z.number().finite(),
    lng: z.number().finite(),
    service: z.enum(["general", "maternal", "child", "emergency"]).optional(),
  })
  .strict();
export async function POST(req: Request) {
  try {
    const parsed = input.safeParse(await req.json());
    if (!parsed.success) return failure("VALIDATION_ERROR", 400);
    const { lat, lng, service } = parsed.data;
    if (!inBhubaneswar(lat, lng)) return failure("OUTSIDE_SERVICE_AREA", 422);
    let rows: Facility[];
    if (demoEnabled()) rows = demoFacilities;
    else {
      const client = await db();
      const args = {
        p_lat: lat,
        p_lng: lng,
        ...(service ? { p_service: service } : {}),
      };
      const { data, error } = await client.rpc("search_facilities", args);
      if (error) throw error;
      rows = (data ?? []) as unknown as Facility[];
    }
    return Response.json(
      {
        facilities: rankFacilities(rows, { lat, lng }, service, demoEnabled()),
        demo: demoEnabled(),
        distance_type: "straight_line",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return failure("SERVICE_UNAVAILABLE");
  }
}
