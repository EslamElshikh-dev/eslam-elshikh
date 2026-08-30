import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_ORIGIN = "https://www.eslam-elshikh.com";
const DEFAULT_SITEMAP = `${DEFAULT_ORIGIN}/sitemap.xml`;
const DEFAULT_PROPERTY = "sc-domain:eslam-elshikh.com";
const WEBMASTERS_READONLY = "https://www.googleapis.com/auth/webmasters.readonly";
const WEBMASTERS_WRITE = "https://www.googleapis.com/auth/webmasters";
const PRIORITY_URLS = [
  `${DEFAULT_ORIGIN}/`,
  `${DEFAULT_ORIGIN}/google-expert/`,
  `${DEFAULT_ORIGIN}/local-seo/riyadh/`,
  `${DEFAULT_ORIGIN}/services/google-business-profile/`,
  `${DEFAULT_ORIGIN}/google-maps-projects/`
];

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const clean = (value = "") => value.replace(/\s+/g, " ").trim();
const base64url = (value) => Buffer.from(value).toString("base64url");
const todayIso = () => new Date().toISOString();

function parseArgs(argv) {
  const result = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    result[key] = rest.length ? rest.join("=") : true;
  }
  return result;
}

export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((entry) => {
    const body = entry[1];
    return {
      url: body.match(/<loc>([^<]+)<\/loc>/i)?.[1]?.trim() || "",
      lastmod: body.match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1]?.trim() || null
    };
  }).filter((entry) => entry.url);
}

export function extractHtmlSignals(html, responseUrl) {
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]
    || null;
  const robots = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] || null;
  const title = clean(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] || null;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const text = clean(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " "));
  const wordCount = text ? text.split(/\s+/).length : 0;
  let canonicalAbsolute = canonical;
  try { if (canonical) canonicalAbsolute = new URL(canonical, responseUrl).href; } catch {}
  return { canonical: canonicalAbsolute, robots, title, description, h1Count, wordCount };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try { results[index] = await fn(items[index], index); }
      catch (error) { results[index] = { error: error.message }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()));
  return results;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : {}; }
  catch { body = { raw: text.slice(0, 1000) }; }
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function fetchSitemap(url) {
  const response = await fetch(url, { headers: { "user-agent": "EslamElshikh-SEO-Control-Center/1.0" } });
  if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}`);
  const xml = await response.text();
  const entries = parseSitemap(xml);
  if (!entries.length) throw new Error("Sitemap contains no <url> entries");
  return { entries, contentType: response.headers.get("content-type") };
}

async function auditPublicUrl(entry) {
  const started = Date.now();
  const response = await fetch(entry.url, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; EslamElshikhSEOAudit/1.0; +https://www.eslam-elshikh.com/)"
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const xRobotsTag = response.headers.get("x-robots-tag");
  const html = contentType.includes("text/html") ? await response.text() : "";
  const signals = html ? extractHtmlSignals(html, response.url) : {};
  return {
    url: entry.url,
    lastmod: entry.lastmod,
    status: response.status,
    ok: response.ok,
    finalUrl: response.url,
    redirected: response.url !== entry.url,
    contentType,
    xRobotsTag,
    durationMs: Date.now() - started,
    ...signals
  };
}

async function loadServiceAccount() {
  if (process.env.GSC_SERVICE_ACCOUNT_JSON) {
    try { return JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON); }
    catch { throw new Error("GSC_SERVICE_ACCOUNT_JSON is not valid JSON"); }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const raw = await readFile(resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS), "utf8");
    return JSON.parse(raw);
  }
  return null;
}

async function getGoogleAccessToken(serviceAccount, scopes) {
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    throw new Error("Service-account JSON must include client_email and private_key");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key).toString("base64url")}`;
  const response = await fetchJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  return response.access_token;
}

const googleHeaders = (accessToken) => ({
  authorization: `Bearer ${accessToken}`,
  "content-type": "application/json"
});

async function inspectUrl(accessToken, property, url) {
  const body = await fetchJson("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: googleHeaders(accessToken),
    body: JSON.stringify({ inspectionUrl: url, siteUrl: property, languageCode: "ar-SA" })
  });
  const result = body.inspectionResult || {};
  const index = result.indexStatusResult || {};
  return {
    url,
    verdict: index.verdict || null,
    coverageState: index.coverageState || null,
    robotsTxtState: index.robotsTxtState || null,
    indexingState: index.indexingState || null,
    pageFetchState: index.pageFetchState || null,
    googleCanonical: index.googleCanonical || null,
    userCanonical: index.userCanonical || null,
    lastCrawlTime: index.lastCrawlTime || null,
    crawledAs: index.crawledAs || null,
    sitemap: index.sitemap || [],
    referringUrls: index.referringUrls || []
  };
}

async function listSearchConsoleSitemaps(accessToken, property) {
  const site = encodeURIComponent(property);
  const body = await fetchJson(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps`, {
    headers: googleHeaders(accessToken)
  });
  return (body.sitemap || []).map((item) => ({
    path: item.path,
    lastSubmitted: item.lastSubmitted || null,
    isPending: Boolean(item.isPending),
    isSitemapsIndex: Boolean(item.isSitemapsIndex),
    errors: item.errors || 0,
    warnings: item.warnings || 0
  }));
}

async function submitSearchConsoleSitemap(accessToken, property, sitemapUrl) {
  const site = encodeURIComponent(property);
  const feedpath = encodeURIComponent(sitemapUrl);
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${feedpath}`, {
    method: "PUT",
    headers: googleHeaders(accessToken)
  });
  if (!response.ok) throw new Error(`Sitemap submission failed with HTTP ${response.status}`);
  return true;
}

function dateDaysAgo(days) {
  const date = new Date(Date.now() - days * 86400000);
  return date.toISOString().slice(0, 10);
}

async function querySearchAnalytics(accessToken, property, dimensions) {
  const site = encodeURIComponent(property);
  return fetchJson(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: "POST",
    headers: googleHeaders(accessToken),
    body: JSON.stringify({
      startDate: dateDaysAgo(29),
      endDate: dateDaysAgo(1),
      dimensions,
      type: "web",
      rowLimit: 25000,
      dataState: "all"
    })
  });
}

function normalizeAnalytics(rows = [], dimensions = []) {
  return rows.map((row) => {
    const mapped = {};
    dimensions.forEach((dimension, index) => { mapped[dimension] = row.keys?.[index] || null; });
    return {
      ...mapped,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    };
  });
}

async function runSearchConsole(entries, { property, submitSitemap, sitemapUrl }) {
  const serviceAccount = await loadServiceAccount();
  if (!serviceAccount) return { configured: false, skippedReason: "No Google service-account credentials configured" };
  const scopes = [submitSitemap ? WEBMASTERS_WRITE : WEBMASTERS_READONLY];
  const accessToken = await getGoogleAccessToken(serviceAccount, scopes);
  const inspection = await mapLimit(entries, 8, async (entry) => {
    try {
      const result = await inspectUrl(accessToken, property, entry.url);
      await sleep(35);
      return result;
    } catch (error) {
      return { url: entry.url, error: error.message, status: error.status || null };
    }
  });
  const [pageAnalyticsRaw, queryAnalyticsRaw, sitemaps] = await Promise.all([
    querySearchAnalytics(accessToken, property, ["page"]),
    querySearchAnalytics(accessToken, property, ["query"]),
    listSearchConsoleSitemaps(accessToken, property)
  ]);
  let submitted = false;
  if (submitSitemap) submitted = await submitSearchConsoleSitemap(accessToken, property, sitemapUrl);
  const pages = normalizeAnalytics(pageAnalyticsRaw.rows, ["page"]);
  const queries = normalizeAnalytics(queryAnalyticsRaw.rows, ["query"]);
  const opportunities = pages
    .filter((row) => row.impressions >= 10 && row.position >= 4 && row.position <= 20 && row.ctr < 0.08)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30);
  return {
    configured: true,
    property,
    inspected: inspection.length,
    inspection,
    sitemaps,
    sitemapSubmitted: submitted,
    analytics: {
      period: { startDate: dateDaysAgo(29), endDate: dateDaysAgo(1), dataState: "all" },
      pages,
      queries: queries.slice(0, 250),
      opportunities
    }
  };
}

async function runPageSpeed(priorityUrls) {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { configured: false, skippedReason: "PAGESPEED_API_KEY is not configured" };
  const results = await mapLimit(priorityUrls, 2, async (url) => {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.append("category", "performance");
    endpoint.searchParams.append("category", "seo");
    endpoint.searchParams.set("key", key);
    try {
      const body = await fetchJson(endpoint);
      const audits = body.lighthouseResult?.audits || {};
      const categories = body.lighthouseResult?.categories || {};
      return {
        url,
        performance: categories.performance?.score != null ? Math.round(categories.performance.score * 100) : null,
        seo: categories.seo?.score != null ? Math.round(categories.seo.score * 100) : null,
        lcpMs: audits["largest-contentful-paint"]?.numericValue || null,
        cls: audits["cumulative-layout-shift"]?.numericValue || null,
        tbtMs: audits["total-blocking-time"]?.numericValue || null,
        speedIndexMs: audits["speed-index"]?.numericValue || null,
        fetchedAt: body.analysisUTCTimestamp || null
      };
    } catch (error) {
      return { url, error: error.message, status: error.status || null };
    }
  });
  return { configured: true, strategy: "mobile", results };
}

async function runCrux(origin, priorityUrls) {
  const key = process.env.CRUX_API_KEY || process.env.PAGESPEED_API_KEY;
  if (!key) return { configured: false, skippedReason: "CRUX_API_KEY (or PAGESPEED_API_KEY) is not configured" };
  const metrics = [
    "largest_contentful_paint",
    "interaction_to_next_paint",
    "cumulative_layout_shift",
    "experimental_time_to_first_byte"
  ];
  const targets = [{ origin }, ...priorityUrls.slice(0, 3).map((url) => ({ url }))];
  const results = await mapLimit(targets, 2, async (target) => {
    try {
      const body = await fetchJson(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...target, formFactor: "PHONE", metrics })
      });
      const record = body.record || {};
      const p75 = {};
      for (const metric of metrics) p75[metric] = record.metrics?.[metric]?.percentiles?.p75 ?? null;
      return { target, formFactor: "PHONE", p75, collectionPeriod: record.collectionPeriod || null };
    } catch (error) {
      return { target, error: error.message, status: error.status || null };
    }
  });
  return { configured: true, results };
}

function deriveIssues(publicAudit, searchConsole) {
  const issues = [];
  for (const page of publicAudit) {
    if (!page || page.error) {
      issues.push({ severity: "high", type: "fetch_error", url: page?.url || null, detail: page?.error || "Unknown fetch error" });
      continue;
    }
    if (page.status !== 200) issues.push({ severity: "high", type: "http_status", url: page.url, detail: `HTTP ${page.status}` });
    if (page.redirected) issues.push({ severity: "medium", type: "sitemap_redirect", url: page.url, detail: `Final URL: ${page.finalUrl}` });
    if (/noindex/i.test(`${page.robots || ""} ${page.xRobotsTag || ""}`)) issues.push({ severity: "high", type: "noindex", url: page.url, detail: `${page.robots || ""} ${page.xRobotsTag || ""}`.trim() });
    if (page.canonical && page.canonical !== page.url) issues.push({ severity: "high", type: "canonical_mismatch", url: page.url, detail: page.canonical });
    if (page.h1Count !== 1) issues.push({ severity: "medium", type: "h1_count", url: page.url, detail: `Found ${page.h1Count}` });
  }
  if (searchConsole?.configured) {
    for (const item of searchConsole.inspection || []) {
      if (item.error) {
        issues.push({ severity: "medium", type: "gsc_inspection_error", url: item.url, detail: item.error });
        continue;
      }
      if (item.verdict && item.verdict !== "PASS") issues.push({ severity: "high", type: "gsc_verdict", url: item.url, detail: item.coverageState || item.verdict });
      if (item.googleCanonical && item.userCanonical && item.googleCanonical !== item.userCanonical) {
        issues.push({ severity: "high", type: "google_canonical_differs", url: item.url, detail: `Google: ${item.googleCanonical} | User: ${item.userCanonical}` });
      }
    }
  }
  return issues;
}

export function buildMarkdown(report) {
  const gsc = report.searchConsole;
  const indexed = gsc?.configured ? gsc.inspection.filter((item) => item.verdict === "PASS").length : null;
  const lines = [
    "# SEO Control Center Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Sitemap URLs: ${report.summary.sitemapUrls}`,
    `Public HTTP 200: ${report.summary.public200}/${report.summary.sitemapUrls}`,
    `Critical/high issues: ${report.summary.highIssues}`,
    `Total issues: ${report.issues.length}`,
    ""
  ];
  if (gsc?.configured) {
    lines.push(`Search Console inspected: ${gsc.inspected}`, `PASS verdicts: ${indexed}/${gsc.inspected}`, `SEO opportunities: ${gsc.analytics.opportunities.length}`, "");
  } else {
    lines.push(`Search Console: SKIPPED — ${gsc?.skippedReason || "not configured"}`, "");
  }
  lines.push(`PageSpeed: ${report.pageSpeed.configured ? "enabled" : `SKIPPED — ${report.pageSpeed.skippedReason}`}`);
  lines.push(`CrUX: ${report.crux.configured ? "enabled" : `SKIPPED — ${report.crux.skippedReason}`}`, "");
  if (report.issues.length) {
    lines.push("## Issues", "");
    for (const issue of report.issues.slice(0, 100)) lines.push(`- [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.url || "site"} — ${issue.detail}`);
    lines.push("");
  }
  if (gsc?.configured && gsc.analytics.opportunities.length) {
    lines.push("## Search opportunities", "");
    for (const row of gsc.analytics.opportunities.slice(0, 20)) {
      lines.push(`- ${row.page} — ${Math.round(row.impressions)} impressions, position ${row.position.toFixed(1)}, CTR ${(row.ctr * 100).toFixed(1)}%`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export async function runSeoControlCenter(options = {}) {
  const origin = options.origin || process.env.SEO_ORIGIN || DEFAULT_ORIGIN;
  const sitemapUrl = options.sitemapUrl || process.env.SEO_SITEMAP_URL || DEFAULT_SITEMAP;
  const property = options.property || process.env.GSC_SITE_PROPERTY || DEFAULT_PROPERTY;
  const priorityUrls = (process.env.SEO_PRIORITY_URLS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const selectedPriorityUrls = priorityUrls.length ? priorityUrls : PRIORITY_URLS;
  const sitemap = await fetchSitemap(sitemapUrl);
  const publicAudit = await mapLimit(sitemap.entries, Number(process.env.SEO_HTTP_CONCURRENCY || 6), auditPublicUrl);
  const searchConsole = await runSearchConsole(sitemap.entries, {
    property,
    submitSitemap: Boolean(options.submitSitemap),
    sitemapUrl
  });
  const [pageSpeed, crux] = await Promise.all([
    runPageSpeed(selectedPriorityUrls),
    runCrux(origin, selectedPriorityUrls)
  ]);
  const issues = deriveIssues(publicAudit, searchConsole);
  const report = {
    version: 1,
    generatedAt: todayIso(),
    origin,
    sitemapUrl,
    property,
    summary: {
      sitemapUrls: sitemap.entries.length,
      public200: publicAudit.filter((page) => page?.status === 200).length,
      highIssues: issues.filter((issue) => issue.severity === "high").length,
      gscConfigured: Boolean(searchConsole.configured),
      pageSpeedConfigured: Boolean(pageSpeed.configured),
      cruxConfigured: Boolean(crux.configured)
    },
    sitemap: { contentType: sitemap.contentType, entries: sitemap.entries },
    publicAudit,
    searchConsole,
    pageSpeed,
    crux,
    issues
  };
  return report;
}

async function writeReport(report, output, summary) {
  if (output) {
    const path = resolve(output);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (summary) {
    const path = resolve(summary);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, buildMarkdown(report));
  }
}

async function selfTest() {
  const fixture = `<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc><lastmod>2026-08-30</lastmod></url><url><loc>https://example.com/a/</loc></url></urlset>`;
  const entries = parseSitemap(fixture);
  if (entries.length !== 2 || entries[0].lastmod !== "2026-08-30") throw new Error("Sitemap parser self-test failed");
  const signals = extractHtmlSignals('<html><head><title>Test page</title><link rel="canonical" href="/a/"><meta name="robots" content="index, follow"><meta name="description" content="Description"></head><body><h1>Hello</h1><p>Useful text here</p></body></html>', "https://example.com/a/");
  if (signals.canonical !== "https://example.com/a/" || signals.h1Count !== 1 || signals.title !== "Test page") throw new Error("HTML signal self-test failed");
  const markdown = buildMarkdown({ generatedAt: todayIso(), summary: { sitemapUrls: 2, public200: 2, highIssues: 0 }, issues: [], searchConsole: { configured: false, skippedReason: "test" }, pageSpeed: { configured: false, skippedReason: "test" }, crux: { configured: false, skippedReason: "test" } });
  if (!markdown.includes("Sitemap URLs: 2")) throw new Error("Markdown self-test failed");
  console.log("SEO Control Center self-test passed.");
}

async function cli() {
  const args = parseArgs(process.argv.slice(2));
  if (args["self-test"]) return selfTest();
  const report = await runSeoControlCenter({ submitSitemap: Boolean(args["submit-sitemap"]) });
  await writeReport(report, args.output || "seo-reports/latest.json", args.summary || "seo-reports/latest.md");
  console.log(buildMarkdown(report));
  if (report.summary.public200 !== report.summary.sitemapUrls || report.summary.highIssues > 0) process.exitCode = 2;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCli) cli().catch((error) => {
  console.error(`SEO Control Center failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
