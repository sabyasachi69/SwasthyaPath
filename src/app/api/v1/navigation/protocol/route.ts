import { db } from "@/lib/supabase/server";
import { failure } from "@/lib/http";
import type { Protocol } from "@/domain/triage";
export async function GET() {
  try {
    const c = await db();
    const { data, error } = await c.rpc("active_protocol");
    if (error || !data) return failure("CLINICAL_PROTOCOL_NOT_APPROVED");
    const protocol = data as unknown as Protocol;
    return Response.json(
      {
        version: protocol.version,
        expiresAt: protocol.expires_at,
        questions: protocol.questions,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return failure("CLINICAL_PROTOCOL_NOT_APPROVED");
  }
}
