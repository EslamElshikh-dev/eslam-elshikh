# Google Local Proof Engine

## Public components

- `/google-business-profile-audit/`: public profile-readiness audit with a 100-point transparent score, three priorities, and a WhatsApp handoff.
- `/google-maps-projects/`: interactive proof map built from public work links. Customer businesses remain independent entities and are represented as `CreativeWork` evidence, never as branches.
- `/book/`: structured consultation request for Google, websites, SEO, security, and AI work.
- `/local-visibility-dashboard/`: `noindex` browser-only CSV dashboard. Imported performance rows never leave the device.

## Free guided audit mode

The public audit is intentionally browser-only. A visitor enters a business name or public Google Maps link, reviews eight visible profile signals, and receives a transparent 100-point readiness score with three priorities. The name, link, website, phone, and checklist choices are not sent to the website server or Google.

This mode requires no Google Cloud project, Places API key, OAuth access, or billing account. It also avoids scraping Google Maps and does not imply that the score is official Google data.

The retired `POST /api/google-place-audit` route returns HTTP `410` with `direct_lookup_disabled` so older clients fail safely without contacting Google. A future direct-data version should only be restored after a separate cost, privacy, quota, and abuse-control review.

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
