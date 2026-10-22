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

Independent public GETs returned 200 for all 82 affected URLs. This does not prove that all 80 listings still
exist or validate their business details. A 403 alone cannot settle that question.

The expanded online scan also returned 429 for ten exact Google Help, Community
and Search URLs. Independent requests confirmed a Google `/sorry/index` automated
traffic challenge for six; rechecking the other four challenge redirects timed
out. The 429 responses remain explicitly unverified. The former global acceptance
of 429 is replaced by a separate ten-URL policy; other rate limits still fail.
A later GitHub run also returned 617 repeated 429 responses for the exact
Instagram profile `https://www.instagram.com/remoesoo10`. An independent GET
returned 200 with the expected Eslam Elshikh / remoesoo10 profile title; its
automated 429 is tracked separately, too.
The official Help articles were also independently found in Google's public
search index. Neither that discovery nor a challenge response proves every
Community reply or Knowledge Panel target is still present.

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
4. The online scan still requests every unique URL. It accepts only 2xx responses,
   follows redirects and retains its full JSON report. There are no HTTP host
   exclusions or globally accepted 403/429 responses.
5. The required policy step fails for every error except an exact reviewed URL
   and status pair in `ops/link-check-policy.json` (82 URLs for 403, eleven for 429). These exceptions are reported
   separately as **blocked automated verification**, not successful links.
   A 404/5xx/network error on the same URL still fails, as does an unreviewed
   403/429 URL or a different status for a reviewed URL.
   Empty, missing or malformed reports and unexpected scanner exits also fail.

Before the online scan, lychee extracts the complete eligible URL inventory from
every HTML/XML/JSON input. Exact duplicates are removed with `sort -u`; query
variants remain distinct. This avoids repeated retryable requests for hundreds
of occurrences of one blocked destination. The offline scan still checks every
reference and fragment in its original page context. Both `all-links.txt` and
`urls.txt` are retained with the reports. Online error locations reference the
unique inventory; use the URL to find its originating markup in the built `dist`.
On the reviewed build, extraction yields 42,211 eligible references and 2,960
unique URLs; the existing default exclusions account for 1,922 mail/tel references
and two additional distinct schemes in the original 2,962-URL count.

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

## Published indexing metadata

Vercel serves `dist`, produced by the complete `build:vercel` chain. The older
HTML, `robots.txt` and `sitemap.xml` snapshots at the repository root are not
the published Vercel output. Inspect the live files and the final build when
investigating indexing; the root sitemap's 7 September date is not evidence
that this date is being served to Google.

Service cards changed in `38ca4cd` (7 October 2026), and CRM tours, answers and
invitations changed in `3267844` (10 October). Some pages that render these
components still used an older search-evidence or portfolio-audit date.
Component revision constants now set a minimum page revision, preserving any
later page-specific date. Neither a build nor a link-only CI repair advances
these dates to the present day. The older portfolio audit date remains intact.

The final SEO validator now runs inside the Vercel build as well as Actions.
It checks the page's own revision, rather than unrelated entities, against both
XML sitemaps, rejects invalid/future dates and prevents these pages from
predating their shipped content. Article date checks and intentional noindex
policies remain in place.

A successful HTTP/build/link result establishes technical accessibility; it
does not establish indexing. Compare Search Console's last crawl, declared and
Google-selected canonicals, fetch/indexing states and sitemap read dates with
the actual deployment. `Crawled - currently not indexed` alone does not prove
a specific quality, duplicate-content or server failure. See
[Google's indexing report](https://support.google.com/webmasters/answer/7440203)
and [lastmod guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
