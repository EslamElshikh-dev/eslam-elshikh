import { access, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const root = resolve(rootArg ? rootArg.slice(7) : "../github-audit-OTf8yu");
const shouldWrite = args.has("--write");
const shouldInjectSchema = !args.has("--no-schema");
const canonicalUrl = "https://www.eslam-elshikh.com/";
const personId = `${canonicalUrl}#person`;
const ignoredDirectories = new Set([".git", "node_modules", "dist", ".next", "build", "coverage", ".vercel"]);
const textExtensions = new Set([".html", ".htm", ".php", ".js", ".jsx", ".ts", ".tsx", ".vue", ".mjs", ".cjs", ".md", ".py"]);
const legacyPhoneTest = /(?:\+?966|0)\s*5\s*4\s*7\s*1\s*9\s*4\s*7\s*8\s*8/;
const legacyWhatsAppPatterns = [
  /https?:\/\/(?:www\.)?wa\.me\/966547194788(?:\?[^\s"'<>]*)?/gi,
  /https?:\/\/api\.whatsapp\.com\/send\?[^\s"'<>]*phone=(?:%2B|\+)?966547194788[^\s"'<>]*/gi
];
const signatureMarker = /(?:إسلام\s*الشيخ|اسلام\s*الشيخ|Eslam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh)|Islam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh)|تم\s+(?:التصميم|التطوير)|تواصل\s+مع\s+المطور|الموقع\s+الرسمي\s+للمطور|Developed\s+By|Designed\s+(?:&\s*Developed\s+)?by|developer[-_\s]?(?:credit|card|signature)|designer[-_\s]?badge|royal[-_\s]?signature)/i;
const canonicalLinkPattern = /https:\/\/www\.eslam-elshikh\.com\//i;

const creator = {
  "@type": "Person",
  "@id": personId,
  name: "إسلام الشيخ",
  alternateName: [
    "المهندس إسلام الشيخ",
    "المهندس اسلام الشيخ",
    "اسلام الشيخ",
    "إسلام الشيخ | Eslam Elshikh",
    "Eslam Elshikh",
    "Islam Elshikh",
    "Eslam El Sheikh"
  ],
  url: canonicalUrl
};

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name).toLowerCase()) && (await stat(path)).size <= 3_000_000) files.push(path);
  }
  return files;
}

function normalizeSignatureText(content) {
  const normalized = content
    .replace(/👑\s*([^👑]*(?:إسلام\s*الشيخ|اسلام\s*الشيخ|Eslam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh)|Islam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh))[^👑]*)\s*👑/gi, "$1")
    .replace(/المهندس\s*\/\s*إسلام\s*الشيخ/g, "المهندس إسلام الشيخ")
    .replace(/المهندس\s*\/\s*اسلام\s*الشيخ/g, "المهندس اسلام الشيخ")
    .replace(/تم\s+التصميم\s+بواسطة\s+المهندس\s+إسلام\s*الشيخ/g, "تم التصميم والتطوير بواسطة المهندس إسلام الشيخ")
    .replace(/Developed\s+By(?=\s*(?:[:·-]?\s*)?(?:<[^>]+>\s*)?(?:Eng\.|Eslam|Islam))/gi, "Designed & developed by")
    .replace(/Designed\s+by\s+Eng\.\s*Islam\s+El(?:-|\s)?Sheikh/gi, "Designed & developed by Eng. Eslam Elshikh")
    .replace(/Designed\s+by\s+Eng\.\s*Islam\s+Elsheikh/gi, "Designed & developed by Eng. Eslam Elshikh")
    .replace(/Designed\s*&\s*Developed\s+by\s+Eng\.\s*Islam\s+El(?:-|\s)?Sheikh/gi, "Designed & developed by Eng. Eslam Elshikh")
    .replace(/Eng\.\s*Islam\s+Elsheikh/gi, "Eng. Eslam Elshikh")
    .replace(/(?:Designed\s*&\s*){2,}developed\s+by/gi, "Designed & developed by")
    .replace(/>\s*تواصل\s+مع\s+المطور\s*</gi, ">المهندس إسلام الشيخ<")
    .replace(/>\s*واتساب\s+المطور\s*</gi, ">المهندس إسلام الشيخ<")
    .replace(/\s*<a\b(?=[^>]*(?:className|class)=["'][^"']*(?:developer|dev[-_]|designer|signature)[^"']*whatsapp[^"']*["'])(?=[^>]*href=["']https?:\/\/(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/)[^"']*["'])[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/\s*<small\b[^>]*>\s*Cybersecurity Engineer\s*(?:\||·)\s*Web Developer\s*(?:\||·)\s*Google Product Expert\s*<\/small>/gi, "")
    .replace(/(?:<br\s*\/?>)?\s*Cybersecurity Engineer\s*(?:\||·)\s*Web Developer\s*(?:\||·)\s*Google Product Expert(?:\s*<br\s*\/?>)?/gi, "")
    .replace(/\s*<span\b[^>]*class=["'][^"']*dev-roles[^"']*["'][^>]*>\s*<\/span>/gi, "")
    .replace(/(?:<br\s*\/?>)?\s*(?:·\s*)?واتساب\s*:\s*0?54\s*719\s*4788/gi, "");
  return normalized
    .replace(/(<span\b[^>]*(?:class=["'](?:ar|en)["']|data-i18n=["']dev-sig["'])[^>]*>)\s*([\s\S]*?)\s*(<\/span>)/gi, (full, open, text, close) => signatureMarker.test(text) ? `${open}${text.trim()}${close}` : full)
    .replace(/\s*<a\b(?=[^>]*(?:className|class)=["'][^"']*developer[^"']*whatsapp[^"']*["'])[^>]*href=["']https:\/\/www\.eslam-elshikh\.com\/["'][^>]*>[\s\S]*?<\/a>/gi, "")
    .split("\n").map((line) => signatureMarker.test(line) ? line.trimEnd() : line).join("\n");
}

function normalizeDeveloperLinks(content) {
  let next = content.replace(/<a\b([^>]*?)href=(["'])https?:\/\/(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/)[^"']*\2([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, quote, after, inner) => {
    if (!signatureMarker.test(inner)) return full;
    const linkedText = inner
      .replace(/\s*<i\b[^>]*(?:fa-whatsapp|whatsapp)[^>]*><\/i>\s*/gi, "")
      .trim();
    const attributes = `${before}href=${quote}${canonicalUrl}${quote}${after}`
      .replace(/aria-label=(["'])[^"']*(?:واتساب|WhatsApp|المطور)[^"']*\1/gi, 'aria-label="الموقع الرسمي للمهندس إسلام الشيخ"');
    return `<a${attributes}>${linkedText}</a>`;
  });
  next = next.replace(/<a\b([^>]*?)href=(["'])https?:\/\/(?:www\.)?wa\.me\/966547194788(?:\?[^"']*)?\2([^>]*)>([\s\S]*?)<\/a>/gi, (_full, before, quote, after, inner) => {
    const linkedText = signatureMarker.test(inner) ? inner : "<span>المهندس إسلام الشيخ</span>";
    const attributes = `${before}href=${quote}${canonicalUrl}${quote}${after}`
      .replace(/aria-label=(["'])[^"']*(?:واتساب|المطور)[^"']*\1/gi, 'aria-label="الموقع الرسمي للمهندس إسلام الشيخ"');
    return `<a${attributes}>${linkedText}</a>`;
  });
  for (const pattern of legacyWhatsAppPatterns) next = next.replace(pattern, canonicalUrl);
  return next.replace(/https?:\/\/(?:www\.)?eslam-elshikh\.com\/?/gi, canonicalUrl);
}

function schemaNodes(value, nodes = []) {
  if (Array.isArray(value)) {
    for (const child of value) schemaNodes(child, nodes);
    return nodes;
  }
  if (!value || typeof value !== "object") return nodes;
  if (value["@type"]) nodes.push(value);
  for (const child of Object.values(value)) schemaNodes(child, nodes);
  return nodes;
}

function addCreatorSchema(html) {
  let merged = false;
  let identityAlreadyLinked = false;
  let blockedByExistingCreator = false;
  const updated = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (full, open, raw, close) => {
    if (merged) return full;
    try {
      const data = JSON.parse(raw);
      const nodes = schemaNodes(data);
      const website = nodes.find((node) => {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        return types.includes("WebSite");
      });
      if (!website) return full;
      if (website.creator?.["@id"] === personId) {
        if (JSON.stringify(website.creator) === JSON.stringify(creator)) {
          identityAlreadyLinked = true;
          return full;
        }
        website.creator = creator;
        merged = true;
        return `${open}${JSON.stringify(data)}${close}`;
      }
      if (website.creator && website.creator["@id"] !== personId) {
        blockedByExistingCreator = true;
        return full;
      }
      website.creator = creator;
      merged = true;
      return `${open}${JSON.stringify(data)}${close}`;
    } catch {
      return full;
    }
  });
  if (merged) return { content: updated, action: "merged" };
  if (identityAlreadyLinked) return { content: html, action: "existing" };
  if (blockedByExistingCreator) return { content: html, action: "manual-existing-creator" };
  if (!/<\/head>/i.test(html)) return { content: html, action: "manual-no-head" };
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...(title ? { name: title } : {}),
    ...(canonical ? { url: canonical } : {}),
    creator
  };
  const script = `  <script type="application/ld+json" data-creator="eslam-elshikh">${JSON.stringify(website)}</script>\n`;
  return { content: updated.replace(/<\/head>/i, `${script}</head>`), action: "injected" };
}

async function findHomepage(repoDir) {
  for (const path of [join(repoDir, "index.html"), join(repoDir, "Index.html"), join(repoDir, "public", "index.html")]) {
    if (await exists(path)) return path;
  }
  return null;
}

async function processRepository(repoDir) {
  const repo = basename(repoDir);
  if (["eslam-elshikh", "EslamElshikh-dev"].includes(repo)) return { repo, skipped: "canonical-identity-repository" };
  const files = await walk(repoDir);
  const contents = new Map();
  let signaturePresent = false;
  let legacyPresent = false;
  for (const file of files) {
    const content = await readFile(file, "utf8");
    contents.set(file, content);
    if (signatureMarker.test(content)) signaturePresent = true;
    if (legacyPhoneTest.test(content)) legacyPresent = true;
  }
  if (!signaturePresent && !legacyPresent) return { repo, skipped: "no-developer-identity" };

  const changedFiles = [];
  const manual = [];
  for (const file of files) {
    const original = contents.get(file);
    if (!signatureMarker.test(original) && !legacyPhoneTest.test(original)) continue;
    let next = normalizeDeveloperLinks(original);
    next = normalizeSignatureText(next);
    if (legacyPhoneTest.test(next)) manual.push(`${file}: legacy phone remains outside a recognized developer link`);
    if (next !== original) {
      changedFiles.push(file);
      contents.set(file, next);
    }
  }

  let schemaAction = "skipped";
  if (shouldInjectSchema) {
    const homepage = await findHomepage(repoDir);
    if (!homepage) manual.push(`${repo}: no static HTML homepage for safe creator schema injection`);
    else {
      const before = contents.get(homepage) ?? await readFile(homepage, "utf8");
      const result = addCreatorSchema(before);
      schemaAction = result.action;
      if (result.action.startsWith("manual-")) manual.push(`${homepage}: ${result.action}`);
      if (result.content !== before) {
        contents.set(homepage, result.content);
        if (!changedFiles.includes(homepage)) changedFiles.push(homepage);
      }
    }
  }

  if (shouldWrite) {
    for (const file of changedFiles) await writeFile(file, contents.get(file), "utf8");
  }

  const finalContents = [...contents.values()];
  return {
    repo,
    signaturePresent,
    legacyBefore: legacyPresent,
    legacyAfter: finalContents.some((content) => legacyPhoneTest.test(content)),
    canonicalLinkAfter: finalContents.some((content) => canonicalLinkPattern.test(content)),
    schemaAction,
    changedFiles: changedFiles.map((file) => file.slice(repoDir.length + 1)),
    manual
  };
}

const entries = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
const reports = [];
for (const entry of entries) reports.push(await processRepository(join(root, entry.name)));
const actionable = reports.filter((report) => !report.skipped);
const summary = {
  mode: shouldWrite ? "write" : "dry-run",
  root,
  repositoriesScanned: reports.length,
  repositoriesActionable: actionable.length,
  repositoriesChanged: actionable.filter((report) => report.changedFiles.length).length,
  filesChanged: actionable.reduce((sum, report) => sum + report.changedFiles.length, 0),
  legacyPhoneRemaining: actionable.filter((report) => report.legacyAfter).map((report) => report.repo),
  canonicalLinkMissing: actionable.filter((report) => !report.canonicalLinkAfter).map((report) => report.repo),
  schemaActions: Object.fromEntries(["merged", "injected", "existing", "skipped", "manual-existing-creator", "manual-no-head"].map((action) => [action, actionable.filter((report) => report.schemaAction === action).length])),
  manualReviewCount: actionable.reduce((sum, report) => sum + report.manual.length, 0)
};

console.log(JSON.stringify({ summary, repositories: actionable }, null, 2));
if (summary.legacyPhoneRemaining.length) process.exitCode = 2;
