from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

subprocess.run(["node", str(ROOT / "build.mjs")], cwd=ROOT, check=True)
subprocess.run([sys.executable, str(ROOT / "scripts/apply-primary-logo.py")], cwd=ROOT, check=True)

dist = ROOT / "dist"
if dist.exists():
    shutil.rmtree(dist)
dist.mkdir(parents=True)

excluded_names = {
    ".git",
    ".github",
    ".vercel",
    ".brand-source",
    "dist",
    "scripts",
    "node_modules",
}
excluded_suffixes = {".pdf", ".zip", ".pyc"}

for source in ROOT.iterdir():
    if source.name in excluded_names or source.suffix.lower() in excluded_suffixes:
        continue
    destination = dist / source.name
    if source.is_dir():
        shutil.copytree(source, destination, dirs_exist_ok=True)
    else:
        shutil.copy2(source, destination)

required = [
    dist / "index.html",
    dist / "assets/brand/eslam-elshikh-logo-transparent.png",
    dist / "assets/icons/favicon.svg",
    dist / "assets/og/eslam-elshikh-og-transparent.png",
    dist / "assets/css/improvements.css",
    dist / "assets/css/brand.css",
    dist / "assets/css/seo-cro.css",
    dist / "local-seo/riyadh/index.html",
    dist / "services/google-business-profile/index.html",
]
missing = [str(path.relative_to(dist)) for path in required if not path.is_file() or path.stat().st_size == 0]
if missing:
    raise SystemExit(f"Vercel output is incomplete: {', '.join(missing)}")

print(f"Vercel static output generated at {dist} with transparent identity and SEO routes.")
