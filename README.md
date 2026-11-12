# Telma Aneke: portfolio

Personal portfolio for Telma Aneke (Tee), full stack developer (Node.js and Laravel).

Plain HTML, CSS and JavaScript. No build step: open `index.html` or serve the folder.

```bash
python -m http.server 4173
```

## What is in here

| Path | Purpose |
| --- | --- |
| `index.html` | The whole site, with SEO meta tags and JSON-LD |
| `assets/css/style.css` | Styles (slate palette, serious and goofy modes) |
| `assets/js/main.js` | Mood toggle, menu, scroll reveals, liquid logo setup |
| `assets/js/glass.js` | Wires liquid glass into the hero buttons and status card |
| `assets/vendor/liquid-glass/` | [dashersw/liquid-glass-js](https://github.com/dashersw/liquid-glass-js) (MIT) |
| `assets/vendor/liquid-logo/` | Liquid metal shader from [paper-design/liquid-logo](https://github.com/paper-design/liquid-logo) (PolyForm Shield 1.0.0), ported to plain JS |
| `assets/vendor/html2canvas.min.js` | [html2canvas](https://html2canvas.hertzen.com/) 1.4.1 (MIT), needed by liquid glass |
| `tools/cutout.py` | Removes photo backgrounds and crops to the upper body |
| `tools/logo_mask.py` | Builds the `tee.` mask the liquid logo shader uses |
| `tools/og_image.py` | Builds the social share image |

## Updating things

- **Text:** edit `index.html`. Elements with a `data-goofy` attribute swap to that text in goofy mode.
- **Photos:** drop originals in `assets/img/raw/` (not committed), adjust `JOBS` in `tools/cutout.py`, then run `python tools/cutout.py`. Needs `pip install "rembg[cpu]" pillow`.
- **Domain:** the canonical URL is `https://teelmarh.github.io/`. If the site moves, replace that string in `index.html`, `robots.txt` and `sitemap.xml`.
