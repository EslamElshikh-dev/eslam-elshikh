# Professional identity release — 18 October 2026

## Public surfaces

Arabic and English versions of `/credentials/`, `/media-kit/`, `/notes/` and three original practice notes. The existing About pages link to these resources. Tawod, Sama Scan and Naqada Directory are the selected case studies; Naqada has a new technical-evidence section.

`src/professional-identity.mjs` supplies the biographies, credential details, community contributions and selected-work list. `src/practice-notes.mjs` supplies the original bilingual articles. The canonical Person remains `https://www.eslam-elshikh.com/#person`.

## Evidence and scope

- Search credential 196860691: issued 11 October 2026; expires 11 October 2027.
- Measurement credential 191833453: issued 19 August 2026; expires 19 August 2027.
- Both issuer URLs and the saved 11 October review date come from the Skillshop study record. The issuer's JavaScript application did not expose a fresh credential record in this session. Do not relabel the saved check as a live verification on 18 October.
- Developer program/community membership is separate from certification. The three displayed membership badges were observed during the profile review earlier on 18 October.
- The selected community answers were published and reopened in the dated community contribution record on 18 October. This release does not assert Recommended Answer status for them.
- Tawod and Sama metrics retain the periods, source names and interpretation in `docs/case-study-evidence-20261010.md`. No new revenue, lead or patient information is published.
- Naqada's README and PROJECT_NOTES were reviewed on 18 October. They describe differing record totals; this release uses their shared implementation facts and omits record counts and audience-growth claims.
- The homepage's previous unsupported 472/233 experience counters are replaced by two issuer-linked credentials and three selected evidence-led studies. Maps and web-project counts describe portfolio entries.

## Assets

The dated asset directory includes PNG exports and editable SVGs for Arabic/English sharing cards, professional/Facebook/YouTube covers, a square card and a vertical story. It also includes a four-page bilingual PDF, approved portrait/full logo, QR codes, text biographies, an email signature, short scripts and three silent captioned MP4 clips. Font binaries ship with their licenses.

The existing full logo is preserved. No new certification mark or program logo is invented. Export sizes are supplied as file dimensions; the platform's crop preview still determines presentation.

## Measurement

The existing consent decision remains required. Four new events describe profile interest; only allowlisted item IDs are collected. These events do not invoke Google Ads contact-conversion labels. Existing phone and WhatsApp behavior is unchanged.

The core sitemap reporting cohort and existing SEO monitor now include the identity pages. This change neither creates a new schedule nor claims that a sitemap entry is indexed.

## Validation limits

Run `npm run check`. It validates all generated routes, reciprocal language links, schema, sharing-image paths/types/sizes, required assets, page landmarks and conversion/privacy behavior. Downloadable HTML email signatures are artifacts, so page transformations and page-landmark checks exclude that dated asset directory.

The generated PDF and motion graphics were rendered and visually inspected. Browser-level responsive and interaction checks require a functioning browser session; static source checks do not establish device compatibility by themselves.

## Production packaging

The existing Vercel ignore rules exclude general PDF/ZIP files. Two exact allow rules include only the public identity PDF and media-kit ZIP. Production must pass the same required-asset validation as the local build. Release 4.17.1 includes this packaging correction.

## Final downloadable profile

The final PDF uses fixed table columns for consistent Arabic and English card alignment. Revised PDF and ZIP assets use distinct r2 filenames and explicit Vercel source-package allow rules. Release 4.17.2 updates the download targets without changing the credential, case-study or membership facts.
