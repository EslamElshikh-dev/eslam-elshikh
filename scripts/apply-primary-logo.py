from __future__ import annotations

import base64
from collections import deque
from pathlib import Path
from statistics import median

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/brand/eslam-elshikh-logo.webp"
TRANSPARENT_LOGO = ROOT / "assets/brand/eslam-elshikh-logo-transparent.png"
OG_IMAGE = ROOT / "assets/og/eslam-elshikh-og-transparent.png"


def remove_connected_background(source: Image.Image) -> Image.Image:
    """Remove only the near-black background connected to the image border."""
    rgb = source.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    border = (
        [pixels[x, 0] for x in range(width)]
        + [pixels[x, height - 1] for x in range(width)]
        + [pixels[0, y] for y in range(height)]
        + [pixels[width - 1, y] for y in range(height)]
    )
    background = tuple(int(median(channel)) for channel in zip(*border))

    def is_background(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y]
        distance = ((red - background[0]) ** 2 + (green - background[1]) ** 2 + (blue - background[2]) ** 2) ** 0.5
        neutral_dark = max(red, green, blue) <= 78 and max(red, green, blue) - min(red, green, blue) <= 28
        return distance <= 76 and neutral_dark

    removed = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        offset = y * width + x
        if removed[offset] or not is_background(x, y):
            continue
        removed[offset] = 1
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    for y in range(height):
        for x in range(width):
            if removed[y * width + x]:
                alpha_pixels[x, y] = 0
    alpha = alpha.filter(ImageFilter.GaussianBlur(.55))

    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def fit_transparent(image: Image.Image, size: tuple[int, int], inset: int) -> Image.Image:
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    bbox = image.getchannel("A").getbbox()
    cropped = image.crop(bbox) if bbox else image
    artwork = ImageOps.contain(cropped, (size[0] - inset * 2, size[1] - inset * 2), Image.Resampling.LANCZOS)
    canvas.alpha_composite(artwork, ((size[0] - artwork.width) // 2, (size[1] - artwork.height) // 2))
    return canvas


if not SOURCE.is_file():
    raise SystemExit(f"Official logo source is missing: {SOURCE}")

cutout = remove_connected_background(Image.open(SOURCE))
logo_1024 = fit_transparent(cutout, (1024, 1024), 34)
logo_1024 = logo_1024.quantize(
    colors=256,
    method=Image.Quantize.FASTOCTREE,
    dither=Image.Dither.FLOYDSTEINBERG,
).convert("RGBA")
logo_1024.save(TRANSPARENT_LOGO, optimize=True, compress_level=9)

icon_512 = fit_transparent(cutout, (512, 512), 24)
icon_192 = fit_transparent(cutout, (192, 192), 10)
apple_icon = fit_transparent(cutout, (180, 180), 10)
for image, destination in (
    (icon_512, ROOT / "assets/icons/icon-512.png"),
    (icon_192, ROOT / "assets/icons/icon-192.png"),
    (apple_icon, ROOT / "assets/icons/apple-touch-icon.png"),
):
    image.save(destination, optimize=True)

icon_192.resize((32, 32), Image.Resampling.LANCZOS).save(ROOT / "assets/icons/favicon-32.png", optimize=True)
icon_192.save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

og = fit_transparent(cutout, (1200, 630), 34)
og.save(OG_IMAGE, optimize=True)

(ROOT / "assets/brand/eslam-elshikh-mark.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">
  <title id="title">شعار المهندس إسلام الشيخ</title>
  <desc id="desc">الشعار الرسمي المفرغ للأمن السيبراني وتطوير البرمجيات وخبرة Google</desc>
  <image width="1024" height="1024" href="./eslam-elshikh-logo-transparent.png" preserveAspectRatio="xMidYMid meet"/>
</svg>
""",
    encoding="utf-8",
)

favicon_b64 = base64.b64encode((ROOT / "assets/icons/icon-192.png").read_bytes()).decode("ascii")
(ROOT / "assets/icons/favicon.svg").write_text(
    f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-labelledby="title">
  <title id="title">شعار المهندس إسلام الشيخ</title>
  <image width="192" height="192" href="data:image/png;base64,{favicon_b64}"/>
</svg>
""",
    encoding="utf-8",
)

(ROOT / "assets/brand/BRAND.md").write_text(
    """# الهوية الرسمية للمهندس إسلام الشيخ

الشعار الكامل هو الهوية الأساسية الوحيدة للموقع، ويظهر بخلفية مفرغة دون استبداله بعلامة ES.

- `eslam-elshikh-logo.webp`: المصدر الأصلي المحفوظ دون تغيير.
- `eslam-elshikh-logo-transparent.png`: نسخة الواجهة المفرغة.
- `eslam-elshikh-mark.svg`: غلاف SVG للنسخة المفرغة.
- `../icons/favicon.svg`: أيقونة التبويب من الشعار الكامل.
- `../icons/icon-192.png` و`icon-512.png`: أيقونات شفافة.
- `../og/eslam-elshikh-og-transparent.png`: صورة المشاركة الشفافة بمقاس 1200×630.

يُحافظ على النصوص والألوان والنسب الأصلية، ولا يُقص الشعار إلى حروف ES.
""",
    encoding="utf-8",
)

if logo_1024.mode != "RGBA" or logo_1024.getpixel((0, 0))[3] != 0:
    raise SystemExit("Transparent logo validation failed")
if og.size != (1200, 630) or og.mode != "RGBA" or og.getpixel((0, 0))[3] != 0:
    raise SystemExit("Transparent sharing image validation failed")

print("Transparent official logo, icons, SVG wrapper, and 1200x630 sharing image generated.")
