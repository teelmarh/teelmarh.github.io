"""Build the 1200x630 social share image (assets/img/og.png)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


def main() -> None:
    canvas = Image.new("RGB", (W, H), "#0F1B3D")
    glow = Image.new("RGB", (W, H), "#0F1B3D")
    g = ImageDraw.Draw(glow)
    for r, c in ((520, "#1B2850"), (400, "#2A3763"), (280, "#3A4775")):
        g.ellipse((900 - r, 380 - r, 900 + r, 380 + r), fill=c)
    from PIL import ImageFilter
    canvas = glow.filter(ImageFilter.GaussianBlur(90))
    d = ImageDraw.Draw(canvas)

    # arch + portrait
    d.rounded_rectangle((760, 120, 1120, 700), radius=180, fill="#DDE2F0", outline="#FFFFFF", width=2)
    photo = Image.open(IMG / "tee-pro.webp").convert("RGBA")
    ph = 600
    photo = photo.resize((int(photo.width * ph / photo.height), ph), Image.LANCZOS)
    canvas.paste(photo, (940 - photo.width // 2, H - ph + 20), photo)

    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((72, 78, 410, 118), radius=20, outline="#3A4775", width=2)
    d.text((92, 86), "FULL STACK DEVELOPER  /  API ENGINEER", font=font("consola.ttf", 15), fill="#DDE2F0")
    d.text((66, 150), "Telma", font=font("seguibl.ttf", 132), fill="#FFFFFF")
    d.text((66, 280), "Aneke", font=font("seguibl.ttf", 132), fill="#FFFFFF")
    d.text((72, 452), "I build and manage APIs teams can rely on.", font=font("segoeuib.ttf", 32), fill="#DDE2F0")
    d.text((72, 500), "Serious about systems. Curious about everything else.", font=font("georgiai.ttf", 28), fill="#9AA5C4")
    for i, c in enumerate(["#FF3D8B", "#FFFFFF", "#DDE2F0", "#9AA5C4", "#5B678C"]):
        d.rounded_rectangle((72 + i * 46, 566, 128 + i * 46, 588), radius=11, fill=c, outline="#0F1B3D")
    canvas.save(IMG / "og.png", optimize=True)
    print("og.png", (IMG / "og.png").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
