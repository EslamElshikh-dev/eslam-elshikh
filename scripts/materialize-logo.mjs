import { access, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

const source = "assets/brand/eslam-elshikh-logo-transparent.png";
const output = "assets/brand/eslam-elshikh-logo.webp";

await access(source);
await mkdir(dirname(output), { recursive: true });

await sharp(source)
  .ensureAlpha()
  .resize(1024, 1024, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    withoutEnlargement: true
  })
  .webp({ quality: 94, alphaQuality: 100, smartSubsample: true })
  .toFile(output);

console.log(`Generated transparent WebP logo: ${output}`);
