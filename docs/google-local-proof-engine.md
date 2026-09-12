# Google Local Proof Engine

## Public components

- `/google-business-profile-audit/`: public profile-readiness audit with a 100-point transparent score, three priorities, and a WhatsApp handoff.
- `/google-maps-projects/`: interactive proof map built from public work links. Customer businesses remain independent entities and are represented as `CreativeWork` evidence, never as branches.
- `/book/`: structured consultation request for Google, websites, SEO, security, and AI work.
- `/local-visibility-dashboard/`: `noindex` browser-only CSV dashboard. Imported performance rows never leave the device.

## Google Places configuration

The audit works in guided mode without credentials. Direct public-data lookup activates when this production environment variable is present:

```text
GOOGLE_PLACES_API_KEY
```

Create a new server key in the correct Google Cloud project, enable Places API (New), restrict the key to the Places API, apply a conservative quota, and monitor billing. Do not put the key in HTML, browser JavaScript, repository files, or a public URL. A key that has already appeared in a public or shared URL should be rotated rather than reused.

The server function exposes only the public fields needed by the score, applies request-size checks, a short timeout, a best-effort rate limit, no-store responses, and an allowlist for Google Maps URLs. It does not log the submitted business query in application code.

## Direct API behavior

Endpoint: `POST /api/google-place-audit`

Request:

```json
{ "query": "Business name, Riyadh" }
```

The response can include up to three public matches so the visitor chooses the correct business. When the key is absent or the provider is unavailable, the client opens the local guided audit instead of failing the page.

## Measurement model

Consent-gated GA4 events record only category-level intent and placement:

- `gbp_audit_start`
- `gbp_audit_complete`
- `gbp_audit_whatsapp`
- `booking_message_ready`
- `proof_map_interaction`

Business names, free text, entered URLs, Place IDs, phone numbers, and CSV contents are never included in analytics event parameters.

## Dashboard inputs

The dashboard accepts exported CSV files from Google Business Profile, Search Console, GA4, and a lead log. It recognizes common Arabic and English metric headings, calculates visible totals locally, and can export a small JSON summary. Automated API connectors remain a separate credentialed phase because Business Profile Performance, Search Console, and GA4 Data require scoped account authorization.
