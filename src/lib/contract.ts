export const APP_DB_CONTRACT = Number.parseInt(
  process.env.APP_DB_CONTRACT ?? "2",
  10,
);

export type ReleaseContract = {
  schema_contract: number;
  minimum_app_contract: number;
  migration_identifier: string;
  updated_at: string;
};

export class DatabaseContractError extends Error {
  constructor(
    message: "BACKEND_CONTRACT_MISMATCH" | "BACKEND_CONTRACT_UNAVAILABLE",
  ) {
    super(message);
    this.name = "DatabaseContractError";
  }
}

export function parseReleaseContract(value: unknown): ReleaseContract {
  if (!value || typeof value !== "object") {
    throw new DatabaseContractError("BACKEND_CONTRACT_UNAVAILABLE");
  }
  const row = value as Partial<ReleaseContract>;
  if (
    !Number.isInteger(row.schema_contract) ||
    !Number.isInteger(row.minimum_app_contract) ||
    typeof row.migration_identifier !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    throw new DatabaseContractError("BACKEND_CONTRACT_UNAVAILABLE");
  }
  return row as ReleaseContract;
}

export function contractCompatible(contract: ReleaseContract) {
  return (
    Number.isInteger(APP_DB_CONTRACT) &&
    APP_DB_CONTRACT >= contract.minimum_app_contract &&
    APP_DB_CONTRACT <= contract.schema_contract
  );
}
