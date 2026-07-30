import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const outDir = process.argv[2] || "dist";
const approvedLogo = "/assets/brand/eslam-elshikh-logo.webp";
const legacyLogos = [
  "/assets/brand/eslam-elshikh-logo-transparent.png",
  "/assets/brand/eslam-elshikh-primary.svg",
  "/assets/brand/eslam-elshikh-logo-2026.svg"
];
const textExtensions = new Set([".html", ".js", ".mjs", ".json", ".webmanifest", ".xml", ".css"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

let updated = 0;
for (const path of await walk(outDir)) {
  if (!textExtensions.has(extname(path))) continue;
  let content = await readFile(path, "utf8");
  const original = content;
  for (const legacyLogo of legacyLogos) content = content.replaceAll(legacyLogo, approvedLogo);
  if (content !== original) {
    await writeFile(path, content, "utf8");
    updated += 1;
  }
}

console.log(`Applied the approved transparent WebP logo across ${updated} generated files.`);
