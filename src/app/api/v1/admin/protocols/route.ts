import { z } from "zod";
import { db } from "@/lib/supabase/server";
import { failure, sameOrigin, serviceFailure } from "@/lib/http";
import type { Json } from "@/lib/supabase/database.types";
const input = z
  .object({
    version: z.string().regex(/^[a-zA-Z0-9._-]{3,40}$/),
    expiresAt: z.iso.datetime(),
    sourceUrls: z.array(z.url().startsWith("https://")).min(1),
    questions: z.array(z.record(z.string(), z.unknown())).min(1),
    rules: z.array(z.record(z.string(), z.unknown())).min(1),
    explanations: z.array(z.record(z.string(), z.unknown())),
  })
  .strict();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("FORBIDDEN", 403);
  try {
    const body = input.parse(await request.json());
    const client = await db();
    const { data, error } = await client.rpc("submit_protocol", {
      p_version: body.version,
      p_expires_at: body.expiresAt,
      p_source_urls: body.sourceUrls,
      p_questions: body.questions as Json,
      p_rules: body.rules as Json,
      p_explanations: body.explanations as Json,
    });
    if (error) throw error;
    return Response.json({ id: data }, { status: 201 });
  } catch (error) {
    return serviceFailure(error, "PROTOCOL_SUBMIT_FAILED", 403);
  }
}
