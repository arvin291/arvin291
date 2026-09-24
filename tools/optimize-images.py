#!/usr/bin/env python3
"""Regenerate the optimised image set in site/assets/img from the masters in brand/.
Requires Pillow:  pip install pillow
Usage:            python3 tools/optimize-images.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "assets" / "img"
BRAND = ROOT / "brand"
OUT.mkdir(parents=True, exist_ok=True)

def save(im, name, q=82):
    p = OUT / name
    if name.endswith(".webp"): im.save(p, "WEBP", quality=q, method=6)
    elif name.endswith(".png"): im.save(p, "PNG", optimize=True)
    else: im.convert("RGB").save(p, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"{p.stat().st_size/1024:7.1f} KB  {name}")

# --- emblem (transparent PNG master) ---
src = Image.open(BRAND / "emblem-master-1070.png").convert("RGBA")
bbox = src.getchannel("A").getbbox(); em = src.crop(bbox)
w, h = em.size; side = max(w, h) + int(max(w, h) * 0.04)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0)); sq.paste(em, ((side - w) // 2, (side - h) // 2), em)
for s in (96, 160, 320, 480, 720, 1040):
    im = sq.resize((s, s), Image.Resampling.LANCZOS)
    save(im, f"emblem-{s}.webp", 84)
    if s <= 320: save(im, f"emblem-{s}.png")

def on_bg(size, pad, color=(20, 8, 12, 255)):
    im = Image.new("RGBA", (size, size), color); inner = int(size * (1 - 2 * pad))
    e = sq.resize((inner, inner), Image.Resampling.LANCZOS); im.paste(e, ((size - inner) // 2, (size - inner) // 2), e); return im

save(sq.resize((32, 32), Image.Resampling.LANCZOS), "favicon-32.png")
sq.resize((48, 48), Image.Resampling.LANCZOS).save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
(ROOT / "site" / "favicon.ico").write_bytes((OUT / "favicon.ico").read_bytes())
save(on_bg(180, 0.10), "apple-touch-icon.png"); save(on_bg(192, 0.10), "icon-192.png")
save(on_bg(512, 0.10), "icon-512.png"); save(on_bg(512, 0.20), "icon-512-maskable.png")

# --- Open Graph card 1200x630 ---
og = Image.new("RGB", (1200, 630), (17, 8, 12)); d = ImageDraw.Draw(og)
for x in range(0, 1200, 60): d.line([(x, 0), (x, 630)], fill=(28, 16, 20))
for y in range(0, 630, 60): d.line([(0, y), (1200, y)], fill=(28, 16, 20))
glow = Image.new("RGBA", (1200, 630), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse([120, 60, 640, 580], fill=(196, 120, 40, 90))
og.paste(glow.filter(ImageFilter.GaussianBlur(90)), (0, 0), glow.filter(ImageFilter.GaussianBlur(90)))
e = sq.resize((420, 420), Image.Resampling.LANCZOS); og.paste(e, (120, 105), e)
def font(size, bold=False):
    for cand in ("/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else ""), "C:/Windows/Fonts/%s" % ("arialbd.ttf" if bold else "arial.ttf")):
        if Path(cand).exists(): return ImageFont.truetype(cand, size)
    return ImageFont.load_default()
d.text((600, 200), "Shalvi", font=font(64, True), fill=(250, 244, 236)); d.text((600, 272), "Technologies", font=font(64, True), fill=(250, 244, 236))
d.text((600, 370), "IT · Security · Audio-visual · Networks", font=font(30), fill=(212, 172, 90))
d.text((600, 415), "GeM-listed supplier, Lucknow", font=font(30), fill=(212, 172, 90))
d.text((600, 500), "www.shalvitechnologies.com", font=font(24), fill=(180, 168, 156))
save(og, "og-image.jpg", 82)

# --- flyer ---
fl = Image.open(BRAND / "product-flyer-original.jpeg").convert("RGB")
save(fl, "flyer-1024.jpg", 78); save(fl, "flyer-1024.webp", 76)
save(fl.resize((640, int(fl.height * 640 / fl.width)), Image.Resampling.LANCZOS), "flyer-640.webp", 76)
