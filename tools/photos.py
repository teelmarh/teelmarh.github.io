"""Make the web copies of the two portrait PNGs.

assets/img/tee-pro.png and assets/img/tee-smile.png are the source photos
(background already removed). This writes smaller .webp copies next to them,
which are the files the page loads.

Usage: python tools/photos.py
"""
from pathlib import Path

from PIL import Image

IMG = Path(__file__).resolve().parent.parent / "assets" / "img"

for name in ("tee-pro", "tee-smile"):
    im = Image.open(IMG / f"{name}.png").convert("RGBA")
    im.thumbnail((1100, 983), Image.LANCZOS)
    out = IMG / f"{name}.webp"
    im.save(out, "WEBP", quality=88, method=6)
    print(f"{name}.png -> {out.name} {im.size} {out.stat().st_size // 1024}KB")
