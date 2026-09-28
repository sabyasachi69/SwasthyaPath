import { APP_DB_CONTRACT, DatabaseContractError } from "@/lib/contract";
import { databaseContract } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = {
    release:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "local",
    environment: process.env.VERCEL_ENV ?? process.env.APP_ENV ?? "development",
    expectedContract: APP_DB_CONTRACT,
  };
  try {
    const contract = await databaseContract();
    return Response.json(
      {
        ...base,
        compatible: true,
        databaseContract: contract.schema_contract,
        minimumAppContract: contract.minimum_app_contract,
        migration: contract.migration_identifier,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        ...base,
        compatible: false,
        error:
          error instanceof DatabaseContractError
            ? error.message
            : "BACKEND_CONTRACT_UNAVAILABLE",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
