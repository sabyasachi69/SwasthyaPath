# Architecture decision record

The browser uses Next.js App Router as a backend-for-frontend. Public directory pages and versioned route handlers use a Supabase publishable key plus RLS. Secret/service credentials are never required by the current web paths. Privileged database transitions are security-definer functions in the unexposed `private` schema, each with caller, role, MFA, state, and ownership checks; small public security-invoker wrappers are the supported RPC surface.

PostgreSQL/PostGIS stores geography, versioned facility evidence, protocols, user-owned plans, and referral events. `api.facility_directory` is a security-invoker view. Public search can return only published, non-expired `verified_real` rows. Exact location stays in request memory and is not written.

The map is optional and lazy-loaded. External directions remain available when route preview fails. A configurable OSRM-compatible hosted provider can supply duration and distance through `/api/v1/routes`; public OSRM is not a production dependency.

The rule engine is deterministic TypeScript over controlled answer codes. No LLM participates in intake, escalation, ranking, or explanation generation. Protocol and facility revisions remain independently rollbackable and auditable.
