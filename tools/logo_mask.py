"""Build the bevel mask the liquid metal shader samples (assets/img/logo-mask.png).

Same idea as parse-logo-image.ts in paper-design/liquid-logo: solve a Poisson
equation inside the shape so the red channel falls from white at the edge to
dark in the middle. Done once here instead of on every page load.

Usage: python tools/logo_mask.py [text]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "logo-mask.png"
TEXT = sys.argv[1] if len(sys.argv) > 1 else "tee."
W, H = 900, 430
FONTS = ["C:/Windows/Fonts/seguibl.ttf", "C:/Windows/Fonts/ariblk.ttf", "DejaVuSans-Bold.ttf"]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    raise SystemExit("no usable font found")


def main() -> None:
    size = 400
    while True:
        font = load_font(size)
        box = ImageDraw.Draw(Image.new("L", (W, H))).textbbox((0, 0), TEXT, font=font)
        if box[2] - box[0] <= W * 0.9 and box[3] - box[1] <= H * 0.8:
            break
        size -= 6

    img = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(img)
    x = (W - (box[2] - box[0])) / 2 - box[0]
    y = (H - (box[3] - box[1])) / 2 - box[1]
    draw.text((x, y), TEXT, font=font, fill=255)

    shape = np.asarray(img) > 127
    padded = np.pad(shape, 1)
    interior = shape.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            interior &= padded[1 + dy:1 + dy + H, 1 + dx:1 + dx + W]

    u = np.zeros((H, W), dtype=np.float32)
    for _ in range(300):
        p = np.pad(u, 1)
        u = np.where(interior, (0.01 + p[1:-1, 2:] + p[1:-1, :-2] + p[2:, 1:-1] + p[:-2, 1:-1]) / 4, 0)

    gray = 255 * (1 - (u / u.max()) ** 2.0)
    gray = np.where(shape, gray, 255).astype(np.uint8)
    Image.merge("RGBA", [Image.fromarray(gray)] * 3 + [Image.new("L", (W, H), 255)]).save(OUT, optimize=True)
    print(f"{OUT.name}: {W}x{H}, font size {size}, {OUT.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
