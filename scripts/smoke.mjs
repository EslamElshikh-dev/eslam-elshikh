import { access, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const output = resolve(root, dirArg ? dirArg.slice(6) : "dist");
const failures = [];

async function exists(path) { try { await access(path); return true; } catch { return false; } }
const cssPath = join(output, "assets/css/main.css");
const jsPath = join(output, "assets/js/main.js");
const themePath = join(output, "assets/js/theme.js");
const analyticsPath = join(output, "assets/js/analytics.js");
if (!(await exists(cssPath))) failures.push("Missing compiled CSS asset");
if (!(await exists(jsPath))) failures.push("Missing compiled JavaScript asset");
if (!(await exists(themePath))) failures.push("Missing external theme bootstrap");
if (!(await exists(analyticsPath))) failures.push("Missing consent-based analytics loader");

const css = await readFile(cssPath, "utf8").catch(() => "");
const js = await readFile(jsPath, "utf8").catch(() => "");
const analytics = await readFile(analyticsPath, "utf8").catch(() => "");
const aboutCss = await readFile(join(output, "assets/css/about.css"), "utf8").catch(() => "");
const home = await readFile(join(output, "index.html"), "utf8").catch(() => "");
const about = await readFile(join(output, "about/index.html"), "utf8").catch(() => "");
const contact = await readFile(join(output, "contact/index.html"), "utf8").catch(() => "");

const cssRequirements = [
  ["min-width: 320px", "320px minimum viewport guard"],
  ["overflow-x: clip", "horizontal overflow protection"],
  ["env(safe-area-inset-bottom)", "safe-area support"],
  ["@media (max-width: 350px)", "small-phone breakpoint"],
  ["@media (max-width: 430px)", "phone breakpoint"],
  ["@media (max-width: 700px)", "large-phone breakpoint"],
  ["@media (max-width: 900px)", "tablet breakpoint"],
  ["@media (max-width: 1120px)", "small-desktop breakpoint"],
  ["prefers-reduced-motion", "reduced-motion support"],
  ["@media print", "print stylesheet"]
];
for (const [needle, label] of cssRequirements) if (!css.includes(needle)) failures.push(`CSS missing ${label}`);

for (const [needle, label] of [["IntersectionObserver", "progressive reveal"], ["data-project-form", "contact form handler"], ["data-service-filter", "service filters"], ["aria-selected", "accessible filters"], ["normalizePath", "mobile navigation state"]]) {
  if (!js.includes(needle)) failures.push(`JavaScript missing ${label}`);
}

const homeMapFrame = home.match(/<iframe\b[^>]*www\.google\.com\/maps\/embed[^>]*>/i)?.[0] || "";
if (!homeMapFrame || !/loading="lazy"/i.test(homeMapFrame) || !/title="[^"]+"/i.test(homeMapFrame) || !/referrerpolicy="strict-origin-when-cross-origin"/i.test(homeMapFrame)) {
  failures.push("Homepage Google Maps embed is missing lazy loading, an accessible title, or referrer policy");
}
if (!/viewport-fit=cover/.test(home)) failures.push("Homepage viewport lacks viewport-fit=cover");
if (!/apple-mobile-web-app-capable/.test(home)) failures.push("Homepage lacks iOS web app metadata");
if (!/data-theme-toggle/.test(home)) failures.push("Homepage lacks theme control");
if (!/data-project-form/.test(contact)) failures.push("Contact page lacks project form");
if (!/لا ترسل كلمات مرور/.test(contact)) failures.push("Contact page lacks sensitive-data warning");
if (/<form\b[^>]*data-project-form/i.test(contact)) failures.push("Contact composer still has a native form submission path");
if (!/data-project-submit/.test(contact)) failures.push("Contact composer lacks its explicit client-side action");
if (!/storageKey = "es-analytics-consent"/.test(analytics) || !/choice !== "denied"/.test(analytics)) failures.push("Analytics loader does not enforce an explicit consent choice");
if (/createElement\("aside"\)/.test(analytics) || !/createElement\("div"\)/.test(analytics)) failures.push("Analytics preferences use an incompatible dialog host element");
if (!/aria-label="اقرأ الدليل كاملًا: [^"]+"/.test(home)) failures.push("Homepage article links lack unique accessible names");
if (/<style\b|\sstyle=["']/.test(home) || /<script\b(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)/i.test(home)) failures.push("Homepage contains inline code incompatible with the strict CSP");
if (!/class="about-hero-actions"/.test(about) || !/class="about-quick-facts"/.test(about)) failures.push("About page lacks contextual hero actions or quick facts");
if ((about.match(/class="about-case-card reveal"/g) || []).length !== 3) failures.push("About page must feature exactly three verifiable case studies");
if (!/class="about-h1-line"/.test(about) || /إسلام الشيخ\.<br/i.test(about)) failures.push("About page H1 does not preserve readable text separation");
if (/<article\b[^>]*\brole="tabpanel"/i.test(about)) failures.push("About tabpanel uses an incompatible article element");
if (!/\.about-focus-panel\[hidden\]\s*\{\s*display:\s*none;?\s*\}/.test(aboutCss)) failures.push("About inactive tabpanels are not visually hidden");
if (!/الهندسةُ الحقّة لا تتباهى بذكائها/.test(about) || /الهندسة الجيدة لا تجعل الحل يبدو أذكى/.test(about)) failures.push("About page still uses the superseded engineering quote");
if (!/href="https:\/\/github\.com\/EslamElshikh-dev"[^>]*target="_blank"[^>]*rel="noopener"/.test(about)) failures.push("About page lacks the verified GitHub profile link");

for (const match of home.matchAll(/<img\b([^>]*)>/gi)) {
  if (!/\bwidth="\d+"/.test(match[1]) || !/\bheight="\d+"/.test(match[1])) failures.push(`Image missing dimensions: ${match[0].slice(0, 120)}`);
}
for (const match of home.matchAll(/<a\b([^>]*)target="_blank"([^>]*)>/gi)) {
  const attrs = `${match[1]} ${match[2]}`;
  if (!/rel="[^"]*noopener/.test(attrs)) failures.push(`External link missing noopener: ${match[0].slice(0, 120)}`);
}

const cssSize = (await stat(cssPath).catch(() => ({ size: 0 }))).size;
const jsSize = (await stat(jsPath).catch(() => ({ size: 0 }))).size;
if (cssSize > 110_000) failures.push(`CSS asset is unexpectedly large (${cssSize} bytes)`);
if (jsSize > 25_000) failures.push(`JavaScript asset is unexpectedly large (${jsSize} bytes)`);
if (jsSize === 0 || cssSize === 0) failures.push("CSS or JS asset is empty");

if (failures.length) {
  console.error(`Smoke test failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Smoke test passed. CSS ${cssSize} bytes; JS ${jsSize} bytes.`);
