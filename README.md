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
| `assets/css/style.css` | Styles (burgundy and rose palette, serious and goofy modes) |
| `assets/js/main.js` | Mood toggle, menu, scroll reveals, liquid logo setup |
| `assets/js/glass.js` | Wires liquid glass into the hero buttons and status card |
| `assets/vendor/liquid-glass/` | [dashersw/liquid-glass-js](https://github.com/dashersw/liquid-glass-js) (MIT) |
| `assets/vendor/liquid-logo/` | Liquid metal shader from [paper-design/liquid-logo](https://github.com/paper-design/liquid-logo) (PolyForm Shield 1.0.0), ported to plain JS |
| `assets/vendor/html2canvas.min.js` | [html2canvas](https://html2canvas.hertzen.com/) 1.4.1 (MIT), needed by liquid glass |
| `tools/photos.py` | Makes the web copies of the two portrait PNGs |
| `tools/logo_mask.py` | Builds the `tee.` mask the liquid logo shader uses |
| `tools/og_image.py` | Builds the social share image |

## Updating things

- **Text:** edit `index.html`. Elements with a `data-goofy` attribute swap to that text in goofy mode.
- **Photos:** replace `assets/img/tee-pro.png` or `assets/img/tee-smile.png` (transparent background), then run `python tools/photos.py`. Needs `pip install pillow`.
- **Domain:** the canonical URL is `https://teelmarh.github.io/`. If the site moves, replace that string in `index.html`, `robots.txt` and `sitemap.xml`.
