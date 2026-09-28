import { z } from "zod";
import { db } from "@/lib/supabase/server";
import { failure, serviceFailure } from "@/lib/http";
import { evaluate, type Protocol } from "@/domain/triage";
import { inBhubaneswar, type Facility } from "@/domain/facility";
import { rankFacilities } from "@/domain/facility";
const input = z
  .object({
    answers: z.record(z.string().max(60), z.string().max(60)),
    lat: z.number(),
    lng: z.number(),
  })
  .strict();
export async function POST(req: Request) {
  try {
    const parsed = input.safeParse(await req.json());
    if (!parsed.success) return failure("VALIDATION_ERROR", 400);
    if (!inBhubaneswar(parsed.data.lat, parsed.data.lng))
      return failure("OUTSIDE_SERVICE_AREA", 422);
    const c = await db();
    const { data, error } = await c.rpc("active_protocol");
    if (error || !data) return failure("CLINICAL_PROTOCOL_NOT_APPROVED");
    const protocol = data as unknown as Protocol;
    const decision = evaluate(protocol, parsed.data.answers);
    const explanations = decision.explanation_codes.map((code) => ({
      code,
      text: protocol.explanations?.[code] ?? null,
    }));
    if (decision.disposition === "emergency")
      return Response.json(
        {
          disposition: "emergency",
          call: "108",
          ruleVersion: protocol.version,
          explanations,
          facilities: [],
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    const args = {
      p_lat: parsed.data.lat,
      p_lng: parsed.data.lng,
      ...(decision.capability_codes[0]
        ? { p_service: decision.capability_codes[0] }
        : {}),
    };
    const { data: facilities, error: searchError } = await c.rpc(
      "search_facilities",
      args,
    );
    if (searchError) throw searchError;
    const rows = (facilities ?? []) as unknown as Facility[];
    const eligible = rows.filter((f) =>
      decision.capability_codes.every((code) => f.services.includes(code)),
    );
    return Response.json(
      {
        disposition: decision.disposition,
        ruleVersion: protocol.version,
        explanations,
        facilities: rankFacilities(
          eligible,
          { lat: parsed.data.lat, lng: parsed.data.lng },
          decision.capability_codes[0],
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      error instanceof Error &&
        ["INCOMPLETE_ANSWERS", "INVALID_ANSWER"].includes(error.message)
    ) return failure(error.message);
    return serviceFailure(error, "CLINICAL_PROTOCOL_NOT_APPROVED");
  }
}
