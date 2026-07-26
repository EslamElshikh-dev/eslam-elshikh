from __future__ import annotations

import base64
import hashlib
import json
import re
import tarfile
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".brand-source"
EXPECTED_SHA256 = "a4e65212f51a430def9cf795b668f0d9b81ed2d9835692fa53f89d9712fd6d9f"

parts = sorted(SOURCE.glob("brand-assets.part-*"))
if not parts:
    raise SystemExit("Brand asset source parts are missing")
archive_bytes = base64.b64decode("".join(p.read_text(encoding="ascii").strip() for p in parts), validate=True)
actual_hash = hashlib.sha256(archive_bytes).hexdigest()
if actual_hash != EXPECTED_SHA256:
    raise SystemExit(f"Brand archive checksum mismatch: {actual_hash}")

with tempfile.TemporaryDirectory() as tmp_dir:
    archive_path = Path(tmp_dir) / "brand-assets.tgz"
    archive_path.write_bytes(archive_bytes)
    with tarfile.open(archive_path, "r:gz") as archive:
        archive.extractall(tmp_dir, filter="data")

    mapping = {
        "full-logo-512-q64.webp": ROOT / "assets/brand/eslam-elshikh-logo.webp",
        "icon-512-final.png": ROOT / "assets/icons/icon-512.png",
        "icon-192-final.png": ROOT / "assets/icons/icon-192.png",
        "apple-touch-icon-final2.png": ROOT / "assets/icons/apple-touch-icon.png",
        "eslam-elshikh-og-opt.png": ROOT / "assets/og/eslam-elshikh-og.png",
    }
    for source_name, destination in mapping.items():
        source_path = Path(tmp_dir) / source_name
        if not source_path.exists():
            raise SystemExit(f"Missing extracted asset: {source_name}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(source_path.read_bytes())

logo_bytes = (ROOT / "assets/brand/eslam-elshikh-logo.webp").read_bytes()
icon_bytes = (ROOT / "assets/icons/icon-192.png").read_bytes()
logo_b64 = base64.b64encode(logo_bytes).decode("ascii")
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")

(ROOT / "assets/brand/eslam-elshikh-mark.svg").write_text(
    f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">شعار المهندس إسلام الشيخ</title>
  <desc id="desc">الهوية الرسمية للأمن السيبراني وتطوير البرمجيات وخبرة Google</desc>
  <rect width="512" height="512" rx="96" fill="#020407"/>
  <image width="512" height="512" href="data:image/webp;base64,{logo_b64}" preserveAspectRatio="xMidYMid meet"/>
</svg>\n''',
    encoding="utf-8",
)

(ROOT / "assets/icons/favicon.svg").write_text(
    f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-labelledby="title">
  <title id="title">إسلام الشيخ</title>
  <image width="192" height="192" href="data:image/png;base64,{icon_b64}"/>
</svg>\n''',
    encoding="utf-8",
)

brand_css = r'''/* Official Eslam Elshikh brand integration — 2026-07-26 */
:root{--brand-red:#ef2334;--brand-red-dark:#8d111b;--brand-blue:#38a9ff;--brand-silver:#eef3f7;--brand-black:#020407}
.brand-logo{width:62px!important;height:62px!important;object-fit:contain!important;flex:0 0 auto;border-radius:18px;background:var(--brand-black);padding:2px;box-shadow:0 0 0 1px rgba(239,35,52,.28),0 10px 28px rgba(0,0,0,.35),0 0 22px rgba(56,169,255,.13);transition:transform .24s ease,box-shadow .24s ease}
.brand:hover .brand-logo{transform:translateY(-2px) scale(1.025);box-shadow:0 0 0 1px rgba(239,35,52,.5),0 14px 34px rgba(0,0,0,.42),0 0 28px rgba(56,169,255,.22)}
.site-header .brand{position:relative;gap:13px}.site-header .brand:after{content:"";position:absolute;inset-inline-start:76px;bottom:-8px;width:86px;height:2px;border-radius:20px;background:linear-gradient(90deg,var(--brand-red),var(--brand-blue),#34d399);opacity:.72;transform-origin:right;transition:width .25s ease}.site-header .brand:hover:after{width:124px}
.hero{position:relative;overflow:hidden}.hero:before{content:"";position:absolute;z-index:0;width:min(58vw,760px);aspect-ratio:1;inset-inline-end:-13vw;top:-17%;background:url('/assets/brand/eslam-elshikh-logo.webp') center/contain no-repeat;opacity:.035;filter:grayscale(.18) drop-shadow(0 0 45px rgba(239,35,52,.2));pointer-events:none}.hero-grid,.stats-bar{position:relative;z-index:1}
.profile-hero-card:before{content:"";position:absolute;z-index:0;width:78%;aspect-ratio:1;inset-inline-end:-25%;bottom:-28%;background:url('/assets/brand/eslam-elshikh-logo.webp') center/contain no-repeat;opacity:.075;filter:saturate(.82);pointer-events:none}.profile-photo-wrap:after{content:"";position:absolute;z-index:4;inset-inline-end:17px;bottom:17px;width:112px;aspect-ratio:1;background:rgba(2,4,7,.9) url('/assets/brand/eslam-elshikh-logo.webp') center/92% no-repeat;border:1px solid rgba(239,35,52,.38);border-radius:24px;box-shadow:0 16px 34px rgba(0,0,0,.45),0 0 24px rgba(56,169,255,.12);backdrop-filter:blur(10px)}
.page-hero{position:relative;overflow:hidden}.page-hero:after{content:"";position:absolute;z-index:0;width:440px;aspect-ratio:1;inset-inline-end:-96px;top:50%;transform:translateY(-50%);background:url('/assets/brand/eslam-elshikh-logo.webp') center/contain no-repeat;opacity:.06;filter:grayscale(.25);pointer-events:none}.page-hero>.container{position:relative;z-index:1}
.site-footer{position:relative;overflow:hidden}.site-footer:before{content:"";position:absolute;width:430px;aspect-ratio:1;inset-inline-start:-180px;bottom:-230px;background:url('/assets/brand/eslam-elshikh-logo.webp') center/contain no-repeat;opacity:.035;filter:grayscale(.45);pointer-events:none}.site-footer>.container{position:relative;z-index:1}
.credential-card,.primary-service-card,.case-study-card,.knowledge-hub-card{position:relative;overflow:hidden}.credential-card:before,.primary-service-card:before,.case-study-card:before,.knowledge-hub-card:before{content:"";position:absolute;inset:0 auto auto 0;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--brand-red),var(--brand-blue),transparent);opacity:.46;pointer-events:none}
.button:not(.button-ghost){box-shadow:0 10px 28px rgba(56,169,255,.13),inset 0 0 0 1px rgba(255,255,255,.05)}.button:not(.button-ghost):hover{box-shadow:0 12px 34px rgba(239,35,52,.16),0 0 22px rgba(56,169,255,.12)}
:root[data-theme="light"] .brand-logo{background:#05080d;box-shadow:0 0 0 1px rgba(141,17,27,.22),0 10px 28px rgba(5,15,25,.15)}:root[data-theme="light"] .hero:before,:root[data-theme="light"] .page-hero:after,:root[data-theme="light"] .site-footer:before{opacity:.04;mix-blend-mode:multiply}
@media(max-width:820px){.brand-logo{width:52px!important;height:52px!important;border-radius:15px}.site-header .brand:after{inset-inline-start:64px}.profile-photo-wrap:after{width:92px;border-radius:20px}.page-hero:after{width:330px;inset-inline-end:-130px}}
@media(max-width:620px){.brand-logo{width:46px!important;height:46px!important;border-radius:13px}.site-header .brand:after{display:none}.hero:before{width:112vw;inset-inline-end:-48vw;top:-5%;opacity:.025}.profile-photo-wrap:after{width:76px;inset-inline-end:12px;bottom:12px;border-radius:17px}.page-hero:after{width:270px;inset-inline-end:-145px;opacity:.045}.site-footer:before{width:300px;inset-inline-start:-150px;bottom:-165px}}
@media(prefers-reduced-motion:reduce){.brand-logo{transition:none!important}.brand:hover .brand-logo{transform:none!important}}
'''
(ROOT / "assets/css/brand.css").write_text(brand_css, encoding="utf-8")

for html_path in ROOT.rglob("*.html"):
    if any(part.startswith(".") for part in html_path.relative_to(ROOT).parts):
        continue
    text = html_path.read_text(encoding="utf-8")
    text = text.replace('/assets/brand/eslam-elshikh-mark.svg', '/assets/brand/eslam-elshikh-logo.webp')
    text = text.replace('"image":"https://avatars.githubusercontent.com/u/264218940?v=4"', '"image":"https://eslam-elshikh.com/assets/brand/eslam-elshikh-logo.webp"')
    if '/assets/css/brand.css' not in text:
        text = text.replace(
            '<link rel="stylesheet" href="/assets/css/improvements.css">',
            '<link rel="stylesheet" href="/assets/css/improvements.css">\n  <link rel="stylesheet" href="/assets/css/brand.css?v=20260726">',
        )
    if 'rel="shortcut icon"' not in text:
        favicon_pattern = re.compile(r'(<link rel="icon"[^>]*>)')
        text = favicon_pattern.sub(r'\1\n  <link rel="shortcut icon" href="/favicon.ico">', text, count=1)
    if 'property="og:image:alt"' not in text and 'property="og:image"' in text:
        alt = "Eslam Elshikh official brand logo" if 'lang="en"' in text[:300] else "الشعار الرسمي للمهندس إسلام الشيخ"
        text = re.sub(r'(<meta property="og:image"[^>]*>)', rf'\1\n  <meta property="og:image:alt" content="{alt}">', text, count=1)
    if 'name="twitter:image:alt"' not in text and 'name="twitter:image"' in text:
        alt = "Eslam Elshikh official brand logo" if 'lang="en"' in text[:300] else "الشعار الرسمي للمهندس إسلام الشيخ"
        text = re.sub(r'(<meta name="twitter:image"[^>]*>)', rf'\1\n  <meta name="twitter:image:alt" content="{alt}">', text, count=1)
    html_path.write_text(text, encoding="utf-8")

manifest_path = ROOT / "manifest.webmanifest"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["id"] = "/"
manifest["icons"] = [
    {"src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
    {"src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

for data_path in [ROOT / "profile.json", ROOT / "assets/data/profile.json"]:
    if data_path.exists():
        text = data_path.read_text(encoding="utf-8")
        text = text.replace("https://avatars.githubusercontent.com/u/264218940?v=4", "https://eslam-elshikh.com/assets/brand/eslam-elshikh-logo.webp")
        data_path.write_text(text, encoding="utf-8")

(ROOT / "assets/brand/BRAND.md").write_text(
    """# الهوية الرسمية للمهندس إسلام الشيخ\n\nتم اعتماد شعار الدرع والرماح والرموز التقنية وهوية ES باعتباره الشعار الأساسي للموقع.\n\n- `eslam-elshikh-logo.webp`: الشعار الكامل للهيدر والهيرو والصفحات.\n- `eslam-elshikh-mark.svg`: نسخة متوافقة للاستخدامات المشتركة.\n- `../icons/favicon.svg`: أيقونة المتصفح.\n- `../icons/icon-192.png` و`icon-512.png`: أيقونات التطبيق والبحث.\n- `../og/eslam-elshikh-og.png`: صورة المشاركة الرسمية.\n\nيُحافظ على الخلفية الداكنة ومساحة تنفس واضحة حول الشعار، ولا تُغيّر نسبه أو ألوانه.\n""",
    encoding="utf-8",
)

print("Primary brand assets and site references updated successfully.")
