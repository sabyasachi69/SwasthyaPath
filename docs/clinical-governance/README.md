# Clinical governance

The licensed clinical reviewer owns question wording, applicability, answer options, red-flag thresholds, dispositions, capability requirements, explanation text, source evidence, and clinical fixtures. Engineers validate structure and deterministic behavior but must not invent or “complete” clinical logic.

Protocol publication requires MFA, the `clinician_reviewer` role, source URLs, a future expiry, an independent author/reviewer, reviewer registration evidence, and confirmation that all fixtures were reviewed. Publishing retires the prior version atomically. Previous protocols stay immutable for audit.

Every answer combination in scope needs an expected fixture. Emergency fixtures must never return routine care. Wording requires English and Odia human review. Changes after launch require a new version and the same review; incidents may disable navigation while keeping emergency calls and directory search available.
