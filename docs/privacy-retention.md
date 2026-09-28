# Data classification and retention

Public data includes approved facility identity, contacts, capabilities, hours, provenance, freshness, and approved pathway edges. Internal data includes draft revisions, evidence notes, staff roles, review decisions, and audit events. User data includes the Auth phone number, preferences, explicitly saved controlled answer codes, selected destination, referral state, and structured feedback.

Do not store exact GPS history, home address, free-text symptoms, diagnoses, prescriptions, reports, images, medication lists, clinical notes, Aadhaar/ABHA identifiers or tokens, identity documents, recordings, browser contacts, OTPs, raw referral tokens, or analytics identifiers joined to health-navigation choices. Logs must redact phone numbers, coordinates, intake answers, tokens, and sensitive query strings.

Anonymous intake is memory-only. Saved plans expire after 90 days. Share tokens expire after seven days and are single-use. Referral records are deleted or irreversibly anonymized 90 days after closure. Raw feedback is retained 12 months, then aggregated and de-identified. Audit records are retained 24 months pending legal review. Account deletion and share revocation must remain self-service.
