#!/usr/bin/env python3
"""Generate OG image 1200x630 via headless Chromium screenshot.

Brief 005 — Option B (HTML template + Playwright).

Run from fenapi/scripts/:
    python3 generate_og_image.py
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "og-image-template.html"
OUT_PNG = HERE.parent / "frontend" / "images" / "og-fenapi-torino-1200x630.png"


def main() -> int:
    if not TEMPLATE.exists():
        print(f"Template not found: {TEMPLATE}", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": 1200, "height": 630},
            device_scale_factor=1,
        )
        page.goto("file://" + str(TEMPLATE))
        # Wait for Google Fonts + logo to load
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        page.screenshot(
            path=str(OUT_PNG),
            full_page=False,
            omit_background=False,
            clip={"x": 0, "y": 0, "width": 1200, "height": 630},
        )
        browser.close()

    print(f"Wrote {OUT_PNG} ({OUT_PNG.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
