# Eslam Elshikh — Personal Website

Static, Arabic-first personal website for `eslam-elshikh.com`. The site is generated with Node.js and deployed as plain HTML, CSS, JavaScript, and image assets, making it suitable for GitHub Pages without runtime dependencies.

## Commands

- `npm run build` — generate all pages, sitemap, robots, manifest, and CNAME.
- `npm run validate` — check page metadata, H1 usage, JSON-LD, internal links, and required assets.
- `npm run smoke` — start a temporary local server and verify important routes and assets.
- `npm run serve` — preview the site locally on port 4173.

## Content structure

- `src/content.mjs` — site identity, services, projects, and blog content.
- `build.mjs` — templates, layouts, structured data, and page generation.
- `assets/css/main.css` — responsive design system.
- `assets/js/main.js` — navigation, filtering, reveals, FAQ behavior, and WhatsApp brief form.
- `services/`, `blog/`, `about/`, `projects/`, `google-expert/`, `contact/` — generated public pages.

Generated HTML files are committed because GitHub Pages serves the repository directly.
