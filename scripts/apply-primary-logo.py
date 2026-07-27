from __future__ import annotations

import base64
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260727-2"
LOGO_PATH = ROOT / "assets/brand/eslam-elshikh-logo.webp"

if not LOGO_PATH.exists():
    raise SystemExit(f"Official logo is missing: {LOGO_PATH}")

brand_dir = ROOT / "assets/brand"
icons_dir = ROOT / "assets/icons"
og_dir = ROOT / "assets/og"
css_dir = ROOT / "assets/css"
for directory in (brand_dir, icons_dir, og_dir, css_dir):
    directory.mkdir(parents=True, exist_ok=True)

logo = Image.open(LOGO_PATH).convert("RGB")


def fit_logo(size: int, inset: int = 8) -> Image.Image:
    canvas = Image.new("RGB", (size, size), "#000000")
    artwork = ImageOps.contain(logo, (size - inset * 2, size - inset * 2), Image.Resampling.LANCZOS)
    canvas.paste(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    return canvas


# Keep the complete uploaded artwork in every icon. Never crop it to the ES letters.
icon_512 = fit_logo(512, 6)
icon_192 = fit_logo(192, 4)
apple_icon = fit_logo(180, 4)

for image, destination in (
    (icon_512, icons_dir / "icon-512.png"),
    (icon_192, icons_dir / "icon-192.png"),
    (apple_icon, icons_dir / "apple-touch-icon.png"),
):
    image.quantize(colors=160, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(
        destination, optimize=True
    )

icon_192.resize((32, 32), Image.Resampling.LANCZOS).save(icons_dir / "favicon-32.png", optimize=True)
icon_192.convert("RGBA").save(
    ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)

# 1200x630 official sharing image using the complete uploaded logo.
og = Image.new("RGBA", (1200, 630), (2, 4, 7, 255))
art = ImageOps.contain(logo.convert("RGBA"), (570, 570), Image.Resampling.LANCZOS)
mask = art.getchannel("A")
for colour, offset, blur, opacity in (
    ((239, 35, 52), (-22, 0), 42, 95),
    ((56, 169, 255), (22, 0), 42, 85),
):
    glow_mask = mask.filter(ImageFilter.GaussianBlur(blur)).point(lambda p: p * opacity // 255)
    glow = Image.new("RGBA", art.size, colour + (255,))
    layer = Image.new("RGBA", og.size, (0, 0, 0, 0))
    layer.paste(glow, ((1200 - art.width) // 2 + offset[0], (630 - art.height) // 2), glow_mask)
    og = Image.alpha_composite(og, layer)
og.alpha_composite(art, ((1200 - art.width) // 2, (630 - art.height) // 2))
draw = ImageDraw.Draw(og)
draw.rounded_rectangle((18, 18, 1181, 611), radius=32, outline=(45, 18, 26, 255), width=2)
og.convert("RGB").quantize(
    colors=160, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG
).save(og_dir / "eslam-elshikh-og.png", optimize=True)

# Self-contained SVGs ensure the full logo works in the header and browser tab.
logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode("ascii")
mark_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" role="img" aria-labelledby="title desc">
  <title id="title">شعار المهندس إسلام الشيخ</title>
  <desc id="desc">الشعار الرسمي الكامل للأمن السيبراني وتطوير البرمجيات وخبرة Google</desc>
  <rect width="640" height="640" rx="44" fill="#000000"/>
  <image width="640" height="640" href="data:image/webp;base64,{logo_b64}" preserveAspectRatio="xMidYMid meet"/>
</svg>\n'''
(brand_dir / "eslam-elshikh-mark.svg").write_text(mark_svg, encoding="utf-8")

icon_b64 = base64.b64encode((icons_dir / "icon-192.png").read_bytes()).decode("ascii")
favicon_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-labelledby="title">
  <title id="title">شعار المهندس إسلام الشيخ</title>
  <image width="192" height="192" href="data:image/png;base64,{icon_b64}"/>
</svg>\n'''
(icons_dir / "favicon.svg").write_text(favicon_svg, encoding="utf-8")

# Preserve the existing refinements once, then install the official-brand override as the public stylesheet.
base_css = css_dir / "improvements-base.css"
public_css = css_dir / "improvements.css"
if not base_css.exists() and public_css.exists():
    base_css.write_text(public_css.read_text(encoding="utf-8"), encoding="utf-8")

brand_css = f'''@import url("/assets/css/improvements-base.css?v={VERSION}");

/* Official Eslam Elshikh identity — full uploaded logo, never the former ES mark. */
:root{{--official-red:#ef2334;--official-blue:#38a9ff;--official-green:#34d399;--official-black:#020407}}
.brand-logo{{content:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}")!important;width:70px!important;height:70px!important;max-width:none!important;flex:0 0 70px;object-fit:contain!important;border-radius:18px;padding:2px;background:var(--official-black);filter:none!important;box-shadow:0 0 0 1px rgba(239,35,52,.35),0 12px 30px rgba(0,0,0,.38),0 0 24px rgba(56,169,255,.16);transition:transform .24s ease,box-shadow .24s ease!important}}
.brand:hover .brand-logo{{transform:translateY(-2px) scale(1.025)!important;box-shadow:0 0 0 1px rgba(239,35,52,.62),0 16px 36px rgba(0,0,0,.46),0 0 30px rgba(56,169,255,.24)}}
.site-header .brand{{position:relative;gap:13px}}.site-header .brand::after{{content:"";position:absolute;inset-inline-start:83px;bottom:-5px;width:94px;height:2px;border-radius:20px;background:linear-gradient(90deg,var(--official-red),var(--official-blue),var(--official-green));opacity:.78}}
.hero{{position:relative;overflow:hidden}}.hero::before{{content:""!important;position:absolute!important;z-index:0!important;width:min(62vw,780px)!important;height:auto!important;aspect-ratio:1!important;inset-inline-end:-17vw!important;top:-15%!important;border:0!important;border-radius:0!important;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat!important;opacity:.055!important;filter:grayscale(.12) drop-shadow(0 0 48px rgba(239,35,52,.18))!important;box-shadow:none!important;pointer-events:none}}.hero-grid,.stats-bar{{position:relative;z-index:1}}
.profile-hero-card::before{{content:"";position:absolute;z-index:0;width:78%;aspect-ratio:1;inset-inline-end:-25%;bottom:-28%;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat;opacity:.07;pointer-events:none}}.profile-photo-wrap::after{{content:"";position:absolute;z-index:4;inset-inline-end:16px;bottom:16px;width:112px;aspect-ratio:1;border:1px solid rgba(239,35,52,.42);border-radius:24px;background:rgba(2,4,7,.92) url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/94% no-repeat;box-shadow:0 18px 38px rgba(0,0,0,.5),0 0 26px rgba(56,169,255,.14);backdrop-filter:blur(10px)}}
.page-hero-mark{{border-color:rgba(239,35,52,.28)!important;background:radial-gradient(circle,rgba(56,169,255,.08),transparent 70%);box-shadow:0 0 70px rgba(239,35,52,.08)}}.page-hero-mark span{{display:block!important;width:82%!important;height:82%!important;font-size:0!important;color:transparent!important;-webkit-text-stroke:0!important;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat!important;filter:drop-shadow(0 18px 35px rgba(0,0,0,.34))}}.page-hero-mark>div{{display:none!important}}
.core-logo,.bio-logo{{content:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}")!important;object-fit:contain!important}}.bio-monogram{{width:min(84%,320px);aspect-ratio:1;font-size:0!important;-webkit-text-stroke:0!important;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat;filter:drop-shadow(0 20px 40px rgba(0,0,0,.36))}}.cta-panel::after{{content:""!important;left:2%!important;bottom:-38%!important;width:320px!important;height:320px!important;font-size:0!important;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat!important;opacity:.08!important}}
.credential-card,.primary-service-card,.service-card,.case-study-card,.knowledge-hub-card,.project-card,.post-card{{position:relative;overflow:hidden}}.credential-card::before,.primary-service-card::before,.service-card::before,.case-study-card::before,.knowledge-hub-card::before,.project-card::before,.post-card::before{{content:"";position:absolute;inset:0 auto auto 0;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--official-red),var(--official-blue),transparent);opacity:.5;pointer-events:none}}
.site-footer{{position:relative;overflow:hidden}}.site-footer::before{{content:"";position:absolute;width:420px;aspect-ratio:1;inset-inline-start:-180px;bottom:-225px;background:url("/assets/brand/eslam-elshikh-logo.webp?v={VERSION}") center/contain no-repeat;opacity:.04;filter:grayscale(.35);pointer-events:none}}.site-footer>.container{{position:relative;z-index:1}}
:root[data-theme="light"] .brand-logo{{background:#020407;box-shadow:0 0 0 1px rgba(141,17,27,.24),0 10px 26px rgba(5,15,25,.16)}}:root[data-theme="light"] .hero::before,:root[data-theme="light"] .site-footer::before{{opacity:.035!important;mix-blend-mode:multiply}}
@media(max-width:820px){{.brand-logo{{width:58px!important;height:58px!important;flex-basis:58px;border-radius:15px}}.site-header .brand::after{{inset-inline-start:70px;width:74px}}.profile-photo-wrap::after{{width:92px;border-radius:20px}}}}
@media(max-width:620px){{.brand-logo{{width:50px!important;height:50px!important;flex-basis:50px;border-radius:13px}}.site-header .brand::after{{display:none}}.hero::before{{width:116vw!important;inset-inline-end:-50vw!important;top:-3%!important;opacity:.032!important}}.profile-photo-wrap::after{{width:76px;inset-inline-end:12px;bottom:12px;border-radius:17px}}.page-hero-mark{{width:min(74vw,280px)!important}}.cta-panel::after{{width:220px!important;height:220px!important;bottom:-25%!important}}}}
@media(prefers-reduced-motion:reduce){{.brand-logo{{transition:none!important}}.brand:hover .brand-logo{{transform:none!important}}}}
'''
public_css.write_text(brand_css, encoding="utf-8")

# Update every HTML page so metadata and direct brand references use the complete logo.
for html_path in ROOT.rglob("*.html"):
    if any(part.startswith(".") for part in html_path.relative_to(ROOT).parts):
        continue
    text = html_path.read_text(encoding="utf-8")
    text = re.sub(
        r'/assets/brand/(?:eslam-elshikh-mark\.svg|eslam-elshikh-logo\.webp)(?:\?v=[^"\']+)?',
        f'/assets/brand/eslam-elshikh-logo.webp?v={VERSION}',
        text,
    )
    text = re.sub(
        r'https://eslam-elshikh\.com/assets/og/eslam-elshikh-og\.png(?:\?v=[^"\']+)?',
        f'https://eslam-elshikh.com/assets/og/eslam-elshikh-og.png?v={VERSION}',
        text,
    )
    text = re.sub(r'/assets/icons/favicon\.svg(?:\?v=[^"\']+)?', f'/assets/icons/favicon.svg?v={VERSION}', text)
    text = re.sub(
        r'/assets/icons/apple-touch-icon\.png(?:\?v=[^"\']+)?',
        f'/assets/icons/apple-touch-icon.png?v={VERSION}',
        text,
    )
    if 'property="og:image:alt"' not in text and 'property="og:image"' in text:
        alt = "Eslam Elshikh official full brand logo" if 'lang="en"' in text[:300] else "الشعار الرسمي الكامل للمهندس إسلام الشيخ"
        text = re.sub(r'(<meta property="og:image"[^>]*>)', rf'\1\n  <meta property="og:image:alt" content="{alt}">', text, count=1)
    if 'name="twitter:image:alt"' not in text and 'name="twitter:image"' in text:
        alt = "Eslam Elshikh official full brand logo" if 'lang="en"' in text[:300] else "الشعار الرسمي الكامل للمهندس إسلام الشيخ"
        text = re.sub(r'(<meta name="twitter:image"[^>]*>)', rf'\1\n  <meta name="twitter:image:alt" content="{alt}">', text, count=1)
    html_path.write_text(text, encoding="utf-8")

manifest = {
    "id": "/",
    "name": "المهندس إسلام الشيخ",
    "short_name": "إسلام الشيخ",
    "description": "المهندس إسلام الشيخ، مهندس أمن سيبراني ومطور برمجيات وخبير منتجات Google وGoogle Developer Expert.",
    "start_url": "/",
    "display": "standalone",
    "lang": "ar",
    "dir": "rtl",
    "background_color": "#020407",
    "theme_color": "#07111b",
    "icons": [
        {"src": f"/assets/icons/icon-192.png?v={VERSION}", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
        {"src": f"/assets/icons/icon-512.png?v={VERSION}", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
    ],
}
(ROOT / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

vercel = {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "framework": None,
    "cleanUrls": True,
    "trailingSlash": True,
    "headers": [
        {"source": "/(.*)", "headers": [
            {"key": "X-Content-Type-Options", "value": "nosniff"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
            {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"},
            {"key": "X-Frame-Options", "value": "DENY"},
        ]},
        {"source": "/assets/brand/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}]},
        {"source": "/assets/icons/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}]},
        {"source": "/assets/og/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}]},
        {"source": "/assets/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
        {"source": "/sitemap.xml", "headers": [{"key": "Content-Type", "value": "application/xml; charset=utf-8"}, {"key": "Cache-Control", "value": "public, max-age=3600"}]},
        {"source": "/robots.txt", "headers": [{"key": "Content-Type", "value": "text/plain; charset=utf-8"}, {"key": "Cache-Control", "value": "public, max-age=3600"}]},
    ],
}
(ROOT / "vercel.json").write_text(json.dumps(vercel, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / ".vercelignore").write_text(".git\n.github\nscripts\n*.pdf\n*.zip\nREADME.md\n", encoding="utf-8")

(brand_dir / "BRAND.md").write_text(
    """# الهوية الرسمية للمهندس إسلام الشيخ

الشعار الكامل المرفوع من المالك هو الهوية الأساسية الوحيدة للموقع. لا يُستبدل بعلامة ES مختصرة في الهيدر أو الفوتر أو صفحات الموقع.

- `eslam-elshikh-logo.webp`: الشعار الكامل في الواجهة.
- `eslam-elshikh-mark.svg`: نسخة كاملة متوافقة.
- `../icons/favicon.svg`: أيقونة التبويب المبنية من الشعار الكامل.
- `../icons/icon-192.png` و`icon-512.png`: أيقونات التطبيق والبحث.
- `../og/eslam-elshikh-og.png`: صورة المشاركة الرسمية.

يُحافظ على نسب الشعار وألوانه وخلفيته السوداء، ولا يُقص إلى حروف ES.
""",
    encoding="utf-8",
)

print("Official full logo integrated across HTML, icons, metadata, Vercel and responsive styling.")
