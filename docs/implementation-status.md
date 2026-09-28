# Implementation status and launch gates

Updated: 28 September 2026

## Implemented

- Next.js App Router mobile web application with English/Odia switching, browser geolocation, manual locality/pincode fallback, list-first results, lazy Leaflet map, external directions, real `tel:` actions, and the official eSanjeevani link.
- Deterministic, versioned navigation rules with an approved-protocol-only API. The interface fails closed when no clinician-approved protocol exists.
- Supabase PostgreSQL/PostGIS schema, explicit grants, RLS on exposed tables, private operational schemas, maker-checker facility publication, independent clinician protocol publication, audit events, rollback functions, hashed single-use referral links, and account ownership isolation.
- Optional phone-OTP account flow, consented care plans, patient-reported referral status, account export/deletion controls, and clear “facility not connected” labelling.
- Structured data-quality reporting, private moderation queue, freshness counts, 12-month feedback aggregation, 90-day closed-referral deletion, and a daily retention job.
- Production/demo separation. Production queries cannot return `demo` or unverified facility rows; demo mode is code-gated and visibly labelled.
- Governance, privacy, incident, verification, architecture, and clinical-review documents; the original prototype is preserved in `docs/prototype/`.
- CI for type checking, linting, unit tests, production build, Playwright, and dependency audit.
- Editable Figma core-flow handoff: <https://www.figma.com/design/L7BYsEaLbvpboas5sQsVP2>.

## Connected staging state

- Supabase project: `swasthyapath-staging`, Mumbai (`ap-south-1`).
- Staging contains zero real facilities, zero demo facilities, and zero published clinical protocols by design.
- Supabase security advisor reports no findings. Performance reports unused indexes only because the database has no traffic/data yet; retain the indexes until representative query statistics exist.

## Hard launch gates requiring accountable humans or credentials

1. Appoint separate data editor and verifier accounts plus a licensed clinician reviewer; require staff MFA and add their assignments.
2. Build and sign the Bhubaneswar provenance worksheet, directly verify a minimum useful facility set, then publish through the maker-checker workflow.
3. Author clinical questions/rules and expected-case fixtures, obtain named clinician approval, and publish the first protocol. Engineers must not invent this content.
4. Have Odia and English health/safety copy reviewed by qualified human reviewers.
5. Configure an India-compliant SMS provider and templates for Supabase phone OTP; test delivery and abuse controls.
6. Select production map tile and routing providers, accept their usage terms, and configure server-side credentials.
7. Configure the server-only Supabase secret for account deletion, referral token pepper, monitoring DSNs, and deployment origins in the hosting environment.
8. Complete privacy/legal and penetration reviews, backup/restore and incident drills, then perform a limited Bhubaneswar soft launch.

Until gates 1–4 are complete, the honest production behavior is the current safe empty state: emergency actions remain available, but no facility recommendation or clinical navigation claim is fabricated.
