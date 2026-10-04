#!/usr/bin/env python3
"""Inline the shared header, footer and icon sprite into every page in site/.

Pages carry marker comments:
    <!-- @@icons -->  ... <!-- @@/icons -->
    <!-- @@header --> ... <!-- @@/header -->
    <!-- @@footer --> ... <!-- @@/footer -->
Run this after editing anything in tools/partials/:
    python3 tools/sync-partials.py
It also marks the current page in the navigation (aria-current="page") and writes the
page name into the mobile section capsule. Exits with an error if a page lacks a marker.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
PARTIALS = ROOT / "tools" / "partials"
BLOCKS = ("icons", "header", "footer")

def read(path):
    with open(path, encoding="utf-8", newline="") as f:
        return f.read().replace("\r\n", "\n")

def write(path, text):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)

def personalise(header, slug):
    """Mark this page's nav link as current and name it in the capsule."""
    m = re.search(r'<a\b[^>]*\bdata-page="%s"[^>]*>([^<]*)' % re.escape(slug), header)
    if not m:
        return header.replace("data-where>Home<", "data-where>Menu<")
    tag = m.group(0)
    label_m = re.search(r'data-label="([^"]+)"', tag)
    label = label_m.group(1) if label_m else m.group(1).strip()
    header = header.replace(tag, tag.replace("data-page=", 'aria-current="page" data-page=', 1), 1)
    return header.replace("data-where>Home<", "data-where>%s<" % label)

def stamp_assets():
    """Rename site/assets css/js files to <name>.<content-hash>.<ext> and update references,
    so browsers and Cloudflare always fetch a changed file. Runs every time this tool runs."""
    import hashlib
    refs = list(SITE.glob("*.html")) + [PARTIALS / "footer.html", PARTIALS / "header.html"]
    for folder, base, ext in (("css", "site", "css"), ("js", "site", "js"), ("js", "desk", "js")):
        files = sorted((SITE / "assets" / folder).glob(f"{base}.*.{ext}"))
        if len(files) != 1:
            print(f"  ! expected one {base}.*.{ext} in assets/{folder}, found {len(files)}", file=sys.stderr)
            continue
        f = files[0]
        digest = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
        new = f.with_name(f"{base}.{digest}.{ext}")
        if new.name == f.name:
            continue
        f.rename(new)
        old_url, new_url = f"/assets/{folder}/{f.name}", f"/assets/{folder}/{new.name}"
        for r in refs:
            txt = read(r)
            if old_url in txt:
                write(r, txt.replace(old_url, new_url))
        print(f"  renamed {f.name} -> {new.name}")

def main():
    stamp_assets()
    parts = {name: read(PARTIALS / f"{name}.html").strip() for name in BLOCKS}
    changed, missing = 0, 0
    for page in sorted(SITE.glob("*.html")):
        html = read(page)
        slug = "home" if page.stem == "index" else page.stem
        new = html
        for name in BLOCKS:
            block = personalise(parts[name], slug) if name == "header" else parts[name]
            rx = re.compile(r"<!-- @@%s -->.*?<!-- @@/%s -->" % (name, name), re.S)
            if not rx.search(new):
                print(f"  ! {page.name}: missing <!-- @@{name} --> marker", file=sys.stderr)
                missing += 1
                continue
            new = rx.sub(lambda m, b=block: b, new, count=1)
        if new != html:
            write(page, new)
            changed += 1
            print(f"  updated {page.name}")
    print(f"done: {changed} page(s) updated")
    if missing:
        sys.exit(1)

if __name__ == "__main__":
    main()
