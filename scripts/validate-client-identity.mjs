import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const root = resolve(rootArg ? rootArg.slice(7) : "../github-audit-OTf8yu");
const canonicalUrl = "https://www.eslam-elshikh.com/";
const personId = `${canonicalUrl}#person`;
const ignoredRepositories = new Set(["eslam-elshikh", "EslamElshikh-dev"]);
const ignoredDirectories = new Set([".git", "node_modules", "dist", ".next", "build", "coverage", ".vercel"]);
const textExtensions = new Set([".html", ".htm", ".php", ".js", ".jsx", ".ts", ".tsx", ".vue", ".mjs", ".cjs", ".md", ".py"]);
const signatureMarker = /(?:إسلام\s*الشيخ|اسلام\s*الشيخ|Eslam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh)|Islam\s+El(?:\s|-)?Sh(?:i|e)(?:kh|eikh)|تم\s+(?:التصميم|التطوير)|Developed\s+By|Designed\s+(?:&\s*developed\s+)?by|developer[-_\s]?(?:credit|card|signature)|designer[-_\s]?badge|royal[-_\s]?signature)/i;
const legacyPhone = /(?:\+?966|0)\s*5\s*4\s*7\s*1\s*9\s*4\s*7\s*8\s*8/;
const roleStack = /Cybersecurity Engineer\s*(?:\||·)\s*Web Developer\s*(?:\||·)\s*Google Product Expert/i;
const developerWhatsapp = /<a\b(?=[^>]*(?:className|class)=["'][^"']*(?:developer|dev[-_]|designer|signature)[^"']*["'])(?=[^>]*href=["']https?:\/\/(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/)[^"']*["'])[^>]*>/i;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name).toLowerCase()) && (await stat(path)).size <= 3_000_000) files.push(path);
  }
  return files;
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

function inspectJsonLd(content, relativePath, errors) {
  if (!/\.html?$/i.test(relativePath)) return;
  for (const match of content.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = match[1].trim();
    if (!raw.includes(personId)) continue;
    try {
      const data = JSON.parse(raw);
      const website = schemaNodes(data).find((node) => {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        return types.includes("WebSite") && node.creator?.["@id"] === personId;
      });
      if (!website) errors.push(`${relativePath}: Person identity is not attached as WebSite.creator`);
    } catch (error) {
      errors.push(`${relativePath}: invalid JSON-LD containing the canonical Person ID (${error.message})`);
    }
  }
}

const repositories = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !ignoredRepositories.has(entry.name));

const errors = [];
const actionable = [];
const creatorLinked = [];
for (const repository of repositories) {
  const repositoryPath = join(root, repository.name);
  const files = await walk(repositoryPath);
  let hasSignature = false;
  let hasCreator = false;
  for (const file of files) {
    const content = await readFile(file, "utf8");
    const relativePath = `${repository.name}/${file.slice(repositoryPath.length + 1)}`;
    if (signatureMarker.test(content)) hasSignature = true;
    if (content.includes(personId)) hasCreator = true;
    if (legacyPhone.test(content)) errors.push(`${relativePath}: retired developer phone remains`);
    if (roleStack.test(content)) errors.push(`${relativePath}: keyword-stacked developer role remains`);
    if (developerWhatsapp.test(content)) errors.push(`${relativePath}: developer WhatsApp link remains`);
    for (const match of content.matchAll(/<a\b[^>]*href=["']https?:\/\/(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      if (signatureMarker.test(match[1])) errors.push(`${relativePath}: name/signature still links to WhatsApp`);
    }
    for (const match of content.matchAll(/href=["'](https?:\/\/(?:www\.)?eslam-elshikh\.com\/[^"']*)["']/gi)) {
      if (match[1] !== canonicalUrl) errors.push(`${relativePath}: non-canonical visible identity link ${match[1]}`);
    }
    inspectJsonLd(content, relativePath, errors);
  }
  if (hasSignature) actionable.push(repository.name);
  if (hasCreator) creatorLinked.push(repository.name);
}

const missingCreator = actionable.filter((repository) => !creatorLinked.includes(repository));
const summary = {
  repositoriesScanned: repositories.length,
  repositoriesWithDeveloperCredit: actionable.length,
  repositoriesWithCanonicalCreator: creatorLinked.length,
  repositoriesMissingCreator: missingCreator,
  errors: errors.length
};

console.log(JSON.stringify({ summary, errors }, null, 2));
if (errors.length) process.exitCode = 1;
