# SEO Control Center — Google Search + Cloud Run

This monitor is designed for `https://www.eslam-elshikh.com` and uses only supported Google APIs.

## What it checks

- Every canonical URL in `sitemap.xml`
- HTTP status, redirects, canonical, robots, H1 count and basic content signals
- Google Search Console URL Inspection status for every sitemap URL
- Google-selected canonical vs user-declared canonical
- Last crawl time, fetch state and indexing verdict
- Search Analytics for pages and queries over the latest 29-day window
- Search Console sitemap status, warnings and errors
- Optional manual sitemap submission
- PageSpeed Insights mobile performance + SEO scores for priority URLs
- CrUX real-user PHONE p75 metrics for the origin and selected priority URLs

The tool deliberately does **not** use Google's Indexing API for normal pages. That API is not intended for ordinary service/blog pages.

## Runtime modes

### 1. GitHub Actions

`.github/workflows/seo-control-center.yml` runs every day and can also be started manually.

Without secrets, it still performs the public sitemap/HTTP/canonical audit. Search Console, PageSpeed and CrUX activate automatically when their credentials are configured.

Expected repository secrets:

- `GSC_SERVICE_ACCOUNT_JSON`
- `PAGESPEED_API_KEY`
- `CRUX_API_KEY` (optional when the PageSpeed key is also enabled for the Chrome UX Report API)

### 2. Google Cloud Run

The Cloud Run HTTP wrapper exposes:

- `GET /healthz`
- `GET /run`
- `GET /run?format=markdown`
- `POST /run`

Cloud Run is deployed as a private service. Cloud Scheduler invokes `/run` with OIDC.

## Google Cloud deployment

Prerequisites:

1. Google Cloud CLI installed and authenticated.
2. A Cloud project selected with billing enabled.
3. The Search Console property `sc-domain:eslam-elshikh.com` available to the account that will authorize the monitor.

Run:

```bash
chmod +x ops/seo-control-center/deploy.sh
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID ./ops/seo-control-center/deploy.sh
```

The deployment script enables the required Google APIs, creates the runtime and scheduler service accounts, builds the container, deploys Cloud Run privately, and creates a daily Cloud Scheduler job at 07:15 Asia/Riyadh.

The default region is `me-central1` (Doha). If your Cloud project has access to the Dammam Saudi region, use:

```bash
GCP_REGION=me-central2 GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID ./ops/seo-control-center/deploy.sh
```

## Search Console authorization

Use a dedicated Google Cloud service account for Search Console. Add that service-account email to the Search Console property permissions, then store its JSON credential in Secret Manager as:

- `gsc-service-account-json`

The monitor requests only the Search Console OAuth scope it needs. Scheduled runs are read-only. Sitemap submission is only requested when the monitor is explicitly run with `--submit-sitemap`.

Example Secret Manager upload from a local credential file:

```bash
gcloud secrets create gsc-service-account-json \
  --data-file=/secure/path/search-console-reader.json \
  --replication-policy=automatic
```

If the secret already exists, add a new version instead of creating another secret.

## PageSpeed + CrUX

Enable these APIs in the Cloud project:

- PageSpeed Insights API
- Chrome UX Report API

Create an API key restricted to those APIs and store it in Secret Manager as:

- `pagespeed-api-key`
- `crux-api-key` (optional; can be separate)

Restrict the key to the smallest possible set of APIs.

## Local / CI usage

Self-test without network access:

```bash
npm run seo:self-test
```

Run the public audit:

```bash
npm run seo:monitor
```

Run with Search Console credentials:

```bash
GSC_SERVICE_ACCOUNT_JSON="$(cat /secure/path/search-console-reader.json)" npm run seo:monitor
```

Manual sitemap submission:

```bash
GSC_SERVICE_ACCOUNT_JSON="$(cat /secure/path/search-console-writer.json)" \
node scripts/seo-control-center.mjs --submit-sitemap
```

Reports are written to `seo-reports/latest.json` and `seo-reports/latest.md` and are ignored by Git.

## Current priority URLs

- `/`
- `/google-expert/`
- `/local-seo/riyadh/`
- `/services/google-business-profile/`
- `/google-maps-projects/`

Override with the comma-separated `SEO_PRIORITY_URLS` environment variable.

## Security notes

- Never commit service-account JSON or API keys.
- Keep Cloud Run private; use Cloud Scheduler OIDC for invocation.
- Use a dedicated service account with the minimum Search Console access required.
- Restrict PageSpeed/CrUX API keys to those APIs.
- Scheduled monitoring is read-only; sitemap submission is opt-in.
