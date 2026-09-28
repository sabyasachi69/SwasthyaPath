# SwasthyaPath

SwasthyaPath is a mobile-first care navigator for Bhubaneswar, Odisha. It helps people find source-backed facility information, understand an approved next level of care, and track a patient-generated referral. It is not a diagnosis engine and does not claim live beds, clinicians, queues, medicines, or acceptance by a facility.

## Current safety state

- The production path returns only non-expired `verified_real` facility records.
- The connected staging database intentionally contains no facility or clinical-protocol claims yet.
- Clinical navigation fails closed until a licensed reviewer publishes a versioned protocol.
- Fictional facilities exist only in the code-gated demo mode and optional disabled seed.
- Exact browser coordinates and anonymous intake answers are not persisted.

## Local setup

1. Install Node.js 22 and Docker Desktop.
2. Copy `.env.example` to `.env.local` and provide a Supabase project URL and publishable key.
3. Run `npm ci`.
4. Run `npx supabase start` and `npx supabase db reset` for the local stack. Demo seeds are disabled by default.
5. Run `npm run dev`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Environments

- `development`: local directory and APIs, no demo records unless explicitly configured.
- `demo`: requires both `APP_ENV=demo` and `NEXT_PUBLIC_DEMO_MODE=true`; every page displays a demo banner and calls/referrals are disabled for fictional facilities.
- `production`: must keep `NEXT_PUBLIC_DEMO_MODE=false`; public database policies exclude demo and unverified records.

The project is deployable before healthcare data is published, but it is not ready for a public clinical pilot until the launch gates in `docs/` are signed off.

## Repository map

- `src/app`: public, account, staff, and versioned API routes.
- `src/domain`: deterministic facility ranking and protocol evaluation.
- `src/components`: mobile UI, lazy map, referral QR, intake, and admin controls.
- `supabase/migrations`: schema, RLS, audited workflows, and indexes.
- `supabase/seed/demo.sql`: fictional, opt-in demo data; never production.
- `docs/prototype`: preserved original prototype.
- `docs`: architecture, verification, governance, privacy, and incident runbooks.
- [`docs/design.md`](docs/design.md): editable Figma safety-flow handoff.

## Delivery status

The application foundation, Supabase staging project, database security model,
facility and protocol publication workflows, deterministic navigation engine,
optional account/referral loop, retention job, demo isolation, and automated
checks are implemented. See [`docs/implementation-status.md`](docs/implementation-status.md)
for the exact launch gates that require verified data, clinical ownership, and
provider credentials rather than software changes.

## Human-owned launch dependencies

Before publishing real recommendations, appoint separate facility editor/verifier accounts, a licensed clinician reviewer, an SMS provider compliant with Indian sender/template requirements, a routing/tile provider, and privacy/legal owners. Real facility records must pass the verification checklist; no record should be copied from the prototype as truth.
