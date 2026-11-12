"""Remove photo backgrounds and crop to the upper body.

Usage: python tools/cutout.py
Reads assets/img/raw/*, writes transparent WebP files to assets/img/.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "img" / "raw"
OUT = ROOT / "assets" / "img"

# name -> fraction of the subject's height to keep, measured from the top
JOBS = {
    "2.jpg": ("tee-laugh", 0.56),
    "3.jpg": ("tee-lean", 0.56),
    "4.webp": ("tee-pro", 0.80),
    "5.jpg": ("tee-smile", 0.66),
}


def main() -> int:
    session = new_session(sys.argv[1] if len(sys.argv) > 1 else "silueta")
    for src, (name, keep) in JOBS.items():
        img = Image.open(RAW / src).convert("RGB")
        cut = remove(img, session=session, post_process_mask=True)
        # keep only the biggest blob so stray background objects are dropped
        a = np.asarray(cut.getchannel("A"))
        labels, count = ndimage.label(a > 24)
        if count > 1:
            sizes = ndimage.sum(a > 24, labels, range(1, count + 1))
            keep_mask = ndimage.binary_dilation(labels == (int(np.argmax(sizes)) + 1), iterations=3)
            cut.putalpha(Image.fromarray(np.where(keep_mask, a, 0).astype(np.uint8)))
        alpha = cut.getchannel("A").point(lambda v: 255 if v > 24 else 0)
        box = alpha.getbbox()
        if box is None:
            print(f"{src}: no subject found")
            continue
        left, top, right, bottom = box
        bottom = top + int((bottom - top) * keep)
        pad = 12
        crop = cut.crop((max(left - pad, 0), max(top - pad, 0), min(right + pad, cut.width), bottom))
        crop.thumbnail((1100, 1300), Image.LANCZOS)
        dest = OUT / f"{name}.webp"
        crop.save(dest, "WEBP", quality=88, method=6)
        print(f"{src} -> {dest.name} {crop.size} {dest.stat().st_size // 1024}KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
