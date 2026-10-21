# Site quality checks

The workflow runs for pull requests to `main`, production pushes, manual runs
and the existing weekly schedule. Build validation and link quality are
independent gates; a Vercel deployment can be ready while a link check fails.

## Findings on 21 October 2026

Run [39544825468](https://github.com/EslamElshikh-dev/eslam-elshikh/actions/runs/39544825468)
checked commit `527c145931d76110cbffeabacde081a119c45622`. The build and required-file
checks passed. Lychee checked 44,133 references / 2,962 unique links and reported
2,305 failed references, all HTTP 403: 80 distinct Maps CID URLs, one Maps short
link and `https://x.com/remoesoo10`. It reported no timeouts or other HTTP errors.
That commit's Vercel production deployment was READY and assigned to the custom
domains; the older deployment failure did not describe its state.

Independent public GETs returned 200 for the X profile, the personal Maps short
link, and a sampled Maps CID URL. This does not prove that all 80 listings still
exist or validate their business details. A 403 alone cannot settle that question.

The stronger local fragment check also found 26 references to `#map-CID`
destinations that only JavaScript understood. Gallery images now have those
static IDs, preserving existing `proof-N` IDs and the JavaScript detail dialog.

## Gates

1. Existing build, content, conversion and SEO checks remain required.
2. `validate-final-seo.mjs` checks the final transformed HTML: self canonicals,
   indexability versus sitemap membership, hreflang targets, both XML sitemaps
   and JSON-LD syntax. This supplements the existing semantic schema checks; it
   is not a Google rich-result eligibility or indexing guarantee.
3. Lychee checks local links, directory index files and anchor fragments with
   `--offline --include-fragments=anchor-only --index-files index.html`.
4. The online scan still requests every URL. It accepts only 2xx responses,
   follows redirects and retains its full JSON report. There are no HTTP host
   exclusions or globally accepted 403/429 responses.
5. The required policy step fails for every error except HTTP 403 on an exact
   reviewed URL in `ops/link-check-policy.json`. These exceptions are reported
   separately as **blocked automated verification**, not successful links.
   A 404/429/5xx/network error on the same URL still fails, as does a new 403 URL.
   Empty, missing or malformed reports and unexpected scanner exits also fail.

Raw online JSON, local results and the classified Markdown summary are retained
as the `site-link-reports` Actions artifact for 14 days. The policy gate writes
the classification to the job summary and emits a warning when checks are blocked.
Review the exact target in a normal client before adding a new exception; record
the evidence and keep the URL narrow. Remove obsolete exceptions when links are
removed or reliably checkable. Never treat a warning as a verified listing.

## Local verification

Use Node 24 and lychee 0.24.2 (the workflow pins the action and binary version).

```sh
node --test scripts/test-link-results.mjs
npm run check
node scripts/validate-final-seo.mjs --dir=dist
lychee --offline --no-progress --include-fragments=anchor-only --index-files index.html --root-dir "$PWD/dist" './dist/**/*.html' './dist/**/*.xml' './dist/**/*.json'
```

For an online scan use the workflow arguments and write a JSON report. Pass its
original exit code in `LYCHEE_EXIT_CODE` to `check-link-results.mjs`; do not replace
the scanner code with a successful shell exit. The classifier tests exercise
reviewed 403s, new/internal failures, rate limits, timeouts and incomplete reports.

References: [lychee CLI/config](https://lychee.cli.rs/guides/config/),
[lychee-action](https://github.com/lycheeverse/lychee-action),
[pinned JSON output format](https://github.com/lycheeverse/lychee/blob/lychee-v0.24.2/lychee-bin/src/formatters/stats/json.rs).
