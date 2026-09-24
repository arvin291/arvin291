"""Crop, key cream, and write 256 / 512 capability marks."""
from pathlib import Path
from PIL import Image

src_dir = Path(r"C:\Users\arvin\.cursor\projects\d-Util-Apps-New-folder-Shalvi-Tech\assets")
out = Path(__file__).resolve().parents[1] / "assets" / "img" / "caps"
out.mkdir(parents=True, exist_ok=True)

names = [
    "products", "solutions", "networking", "integration", "specialized",
    "security", "web", "cyber", "forensic-lab", "forensic-ws", "drones", "av",
]


def is_cream_or_white(r, g, b, a):
    if a < 12:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    if mn > 230 and (mx - mn) < 28:
        return True
    # ivory / paper of the site
    if r > 232 and g > 228 and b > 218 and (mx - mn) < 36:
        return True
    return False


def process(src: Path, stem: str):
    img = Image.open(src).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_cream_or_white(r, g, b, a):
                px[x, y] = (r, g, b, 0)
    box = img.getbbox()
    if box:
        img = img.crop(box)
    pad = int(max(img.size) * 0.08)
    side = max(img.size) + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)

    one = canvas.copy()
    one.thumbnail((256, 256), Image.Resampling.LANCZOS)
    square = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    square.paste(one, ((256 - one.width) // 2, (256 - one.height) // 2), one)
    dest = out / f"{stem}.png"
    square.save(dest, "PNG", optimize=True)

    two = canvas.copy()
    two.thumbnail((512, 512), Image.Resampling.LANCZOS)
    square2 = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    square2.paste(two, ((512 - two.width) // 2, (512 - two.height) // 2), two)
    dest2 = out / f"{stem}@2x.png"
    square2.save(dest2, "PNG", optimize=True)
    print(stem, dest.stat().st_size, dest2.stat().st_size)


for name in names:
    src = src_dir / f"cap-{name}.png"
    if not src.exists():
        raise SystemExit(f"missing {src}")
    process(src, name)

print("wrote", out)
