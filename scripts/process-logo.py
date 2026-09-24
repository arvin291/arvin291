"""Knock black (and leftover white) off the official emblem and write site assets."""
from collections import deque
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / "assets" / "img"
src = Path(
    r"C:\Users\arvin\.cursor\projects\d-Util-Apps-New-folder-Shalvi-Tech"
    r"\assets\c__Users_arvin_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"611d662064d0bfa06b173d53954db7d1_images_logo_salvi-aa5c51fd-13ad-4521-be77-86bb00cc7428.jpg"
)
# Fallback: a copy already in the project
if not src.exists():
    for cand in (root / "logo.jpeg", root / "logo.jpg", out / "logo-source.jpg", out / "logo.jpg"):
        if cand.exists():
            src = cand
            break

img = Image.open(src).convert("RGBA")
px = img.load()
w, h = img.size


def is_near_black(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    chroma = mx - mn
    if mx < 14:
        return True
    if mx < 26 and chroma < 12:
        return True
    return False


def is_near_white(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    return mn > 238 and (mx - mn) < 18


def is_soft_white(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    return mn > 208 and (mx - mn) < 24


# Flood-fill only background connected to the frame so interior
# gold-orb highlights are not punched out.
bg = bytearray(w * h)
q = deque()


def mark(x, y):
    i = y * w + x
    if bg[i]:
        return
    r, g, b, _a = px[x, y]
    if is_near_black(r, g, b) or is_near_white(r, g, b) or is_soft_white(r, g, b):
        bg[i] = 1
        q.append((x, y))


for x in range(w):
    mark(x, 0)
    mark(x, h - 1)
for y in range(h):
    mark(0, y)
    mark(w - 1, y)

while q:
    x, y = q.popleft()
    if x > 0:
        mark(x - 1, y)
    if x + 1 < w:
        mark(x + 1, y)
    if y > 0:
        mark(x, y - 1)
    if y + 1 < h:
        mark(x, y + 1)

for y in range(h):
    row = y * w
    for x in range(w):
        r, g, b, a = px[x, y]
        mx, mn = max(r, g, b), min(r, g, b)
        chroma = mx - mn
        if bg[row + x]:
            if is_soft_white(r, g, b) and not is_near_white(r, g, b) and not is_near_black(r, g, b):
                px[x, y] = (r, g, b, max(0, min(255, (255 - mn) * 5)))
            else:
                px[x, y] = (r, g, b, 0)
            continue
        # Dark JPEG fringe sitting on the silhouette
        if mx < 36:
            edge = False
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and bg[ny * w + nx]:
                    edge = True
                    break
            if edge:
                px[x, y] = (r, g, b, max(0, min(255, int((mx - 8) * 12))))

box = img.getbbox()
if box:
    img = img.crop(box)
pad = int(max(img.size) * 0.04)
side = max(img.size) + pad * 2
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)

out.mkdir(parents=True, exist_ok=True)
# Keep the uploaded JPEG as a source copy
src_copy = out / "logo.jpg"
if src.resolve() != src_copy.resolve():
    src_copy.write_bytes(Path(src).read_bytes())

canvas.save(out / "logo.png", "PNG", optimize=True)

fav = canvas.copy()
fav.thumbnail((192, 192), Image.Resampling.LANCZOS)
fav.save(out / "favicon.png", "PNG", optimize=True)

hero = canvas.copy()
hero.thumbnail((720, 720), Image.Resampling.LANCZOS)
hero.save(out / "logo-hero.png", "PNG", optimize=True)

print("wrote", out / "logo.png", canvas.size)
print("wrote", out / "logo-hero.png", hero.size)
print("wrote", out / "favicon.png", fav.size)
print("wrote", src_copy)
