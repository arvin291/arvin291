#!/usr/bin/env python3
"""Inline the shared header, footer and icon sprite into every page in site/.

Pages carry marker comments:
    <!-- @@icons -->  ... <!-- @@/icons -->
    <!-- @@header --> ... <!-- @@/header -->
    <!-- @@footer --> ... <!-- @@/footer -->
Run this after editing anything in tools/partials/:
    python3 tools/sync-partials.py
It also marks the current page's link in the navigation (aria-current="page").
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
PARTIALS = ROOT / "tools" / "partials"

def load(name):
    text = (PARTIALS / f"{name}.html").read_text(encoding="utf-8").strip()
    return text

def set_current(header_html, slug):
    # add aria-current to the nav link whose data-page matches this page
    pattern = re.compile(r'(<a\b[^>]*\bdata-page="%s"[^>]*)(>)' % re.escape(slug))
    return pattern.sub(lambda m: m.group(1) + ' aria-current="page"' + m.group(2), header_html, count=1)

def main():
    icons, header, footer = load("icons"), load("header"), load("footer")
    changed = 0
    for page in sorted(SITE.glob("*.html")):
        html = page.read_text(encoding="utf-8")
        slug = "home" if page.stem == "index" else page.stem
        new = html
        for name, block in (("icons", icons), ("header", set_current(header, slug)), ("footer", footer)):
            rx = re.compile(r"<!-- @@%s -->.*?<!-- @@/%s -->" % (name, name), re.S)
            if not rx.search(new):
                print(f"  ! {page.name}: no @@{name} marker — skipped that block", file=sys.stderr)
                continue
            new = rx.sub(lambda m, b=block: b, new, count=1)
        if new != html:
            page.write_text(new, encoding="utf-8")
            changed += 1
            print(f"  updated {page.name}")
    print(f"done: {changed} page(s) updated")

if __name__ == "__main__":
    main()
