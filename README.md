# SwasthyaPath

SwasthyaPath is a mobile-first care navigator for Bhubaneswar, Odisha. It helps people find source-backed facility information, understand an approved next level of care, and track a patient-generated referral. It is not a diagnosis engine and does not claim live beds, clinicians, queues, medicines, or acceptance by a facility.

## Current safety state

- The production path returns only non-expired `verified_real` facility records.
- The connected staging database contains a source-backed Bhubaneswar directory imported from the supplied dataset.
- Clinical navigation fails closed until a licensed reviewer publishes a versioned protocol.
- Public queries exclude unverified and synthetic records.
- Exact browser coordinates and anonymous intake answers are not persisted.

## Local setup

1. Install Node.js 22 and Docker Desktop.
2. Copy `.env.example` to `.env.local` and provide a Supabase project URL and publishable key.
3. Run `npm ci`.
4. Run `npx supabase start` and `npx supabase db reset` for the local stack. Optional synthetic seeds are disabled by default.
5. Run `npm run dev`.

To exercise fictional practitioner profiles locally, explicitly run
`psql "$LOCAL_DATABASE_URL" -f supabase/seed/optional/002_seed_demo_practitioners.sql`
after reset and set `NEXT_PUBLIC_DEMO_MODE=true`. The optional seed is not part
of `supabase db reset`, CI, preview, or production. Remove it with the adjacent
`003_remove_demo_data.sql` script.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Environments

- `development`: local directory and APIs.
- `preview`: branch deployments connected to the staging data contract.
- `production`: public database policies exclude synthetic and unverified records.

The project is deployable before healthcare data is published, but it is not ready for a public clinical pilot until the launch gates in `docs/` are signed off.

## Repository map

- `src/app`: public, account, staff, and versioned API routes.
- `src/domain`: deterministic facility ranking and protocol evaluation.
- `src/components`: mobile UI, lazy map, referral QR, intake, and admin controls.
- `supabase/migrations`: schema, RLS, audited workflows, and indexes.
- `supabase/seed/demo.sql`: optional synthetic development fixtures; never production.
- `docs/prototype`: preserved original prototype.
- `docs`: architecture, verification, governance, privacy, and incident runbooks.
- [`docs/design.md`](docs/design.md): editable Figma safety-flow handoff.

## Delivery status

The application foundation, Supabase staging project, database security model,
facility and protocol publication workflows, deterministic navigation engine,
optional account/referral loop, retention job, data isolation, and automated
checks are implemented. See [`docs/implementation-status.md`](docs/implementation-status.md)
for the exact launch gates that require verified data, clinical ownership, and
provider credentials rather than software changes.

## Human-owned launch dependencies

Before publishing real recommendations, appoint separate facility editor/verifier accounts, a licensed clinician reviewer, an SMS provider compliant with Indian sender/template requirements, a routing/tile provider, and privacy/legal owners. Real facility records must pass the verification checklist; no record should be copied from the prototype as truth.
