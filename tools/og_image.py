"""Build the 1200x630 social share image (assets/img/og.png)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


def main() -> None:
    canvas = Image.new("RGB", (W, H), "#0F172A")
    glow = Image.new("RGB", (W, H), "#0F172A")
    g = ImageDraw.Draw(glow)
    for r, c in ((520, "#1E293B"), (400, "#334155"), (280, "#475569")):
        g.ellipse((900 - r, 380 - r, 900 + r, 380 + r), fill=c)
    from PIL import ImageFilter
    canvas = glow.filter(ImageFilter.GaussianBlur(90))
    d = ImageDraw.Draw(canvas)

    # arch + portrait
    d.rounded_rectangle((760, 120, 1120, 700), radius=180, fill="#64748B", outline="#CBD5E1", width=2)
    photo = Image.open(IMG / "tee-pro.webp").convert("RGBA")
    ph = 600
    photo = photo.resize((int(photo.width * ph / photo.height), ph), Image.LANCZOS)
    canvas.paste(photo, (940 - photo.width // 2, H - ph + 20), photo)

    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((72, 78, 424, 118), radius=20, outline="#475569", width=2)
    d.text((92, 86), "ABUJA, NIGERIA  /  FULL STACK DEVELOPER", font=font("consola.ttf", 15), fill="#E2E8F0")
    d.text((66, 150), "Telma", font=font("seguibl.ttf", 132), fill="#F8FAFC")
    d.text((66, 280), "Aneke", font=font("seguibl.ttf", 132), fill="#F8FAFC")
    d.text((72, 452), "Full Stack Developer, Node.js and Laravel", font=font("segoeuib.ttf", 32), fill="#E2E8F0")
    d.text((72, 500), "Serious about systems. Unserious about the rest.", font=font("georgiai.ttf", 28), fill="#94A3B8")
    for i, c in enumerate(["#F8FAFC", "#E2E8F0", "#94A3B8", "#64748B", "#334155"]):
        d.rounded_rectangle((72 + i * 46, 566, 128 + i * 46, 588), radius=11, fill=c, outline="#0F172A")
    canvas.save(IMG / "og.png", optimize=True)
    print("og.png", (IMG / "og.png").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
