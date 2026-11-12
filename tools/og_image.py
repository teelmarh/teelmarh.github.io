"""Build the 1200x630 social share image (assets/img/og.png)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


def main() -> None:
    canvas = Image.new("RGB", (W, H), "#4B0F1F")
    glow = Image.new("RGB", (W, H), "#4B0F1F")
    g = ImageDraw.Draw(glow)
    for r, c in ((520, "#5E2136"), (400, "#7A3F56"), (280, "#874C66")):
        g.ellipse((900 - r, 380 - r, 900 + r, 380 + r), fill=c)
    from PIL import ImageFilter
    canvas = glow.filter(ImageFilter.GaussianBlur(90))
    d = ImageDraw.Draw(canvas)

    # arch + portrait
    d.rounded_rectangle((760, 120, 1120, 700), radius=180, fill="#96607A", outline="#DDB5BE", width=2)
    photo = Image.open(IMG / "tee-pro.webp").convert("RGBA")
    ph = 600
    photo = photo.resize((int(photo.width * ph / photo.height), ph), Image.LANCZOS)
    canvas.paste(photo, (940 - photo.width // 2, H - ph + 20), photo)

    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((72, 78, 470, 118), radius=20, outline="#874C66", width=2)
    d.text((92, 86), "FULL STACK DEVELOPER  /  NODE.JS AND LARAVEL", font=font("consola.ttf", 15), fill="#E8C9D0")
    d.text((66, 150), "Telma", font=font("seguibl.ttf", 132), fill="#FFFCFA")
    d.text((66, 280), "Aneke", font=font("seguibl.ttf", 132), fill="#FFFCFA")
    d.text((72, 452), "Full Stack Developer, Node.js and Laravel", font=font("segoeuib.ttf", 32), fill="#E8C9D0")
    d.text((72, 500), "Serious about systems. Curious about everything else.", font=font("georgiai.ttf", 28), fill="#B78793")
    for i, c in enumerate(["#FFFCFA", "#E8C9D0", "#B78793", "#96607A", "#7A3F56"]):
        d.rounded_rectangle((72 + i * 46, 566, 128 + i * 46, 588), radius=11, fill=c, outline="#4B0F1F")
    canvas.save(IMG / "og.png", optimize=True)
    print("og.png", (IMG / "og.png").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
