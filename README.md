# Wedding Gallery — Edward & Cathy · 林葆華 · 裴彩依

A static website sharing our wedding photographs with friends and family,
organized by theme. Each themed page is styled to match the photos it holds.

- **Landing** (`index.html`) — the hub linking to every gallery
- **Traditional Chinese** (`traditional-chinese.html`) — red & gold, 囍
- **Modern Chinese** (`modern-chinese.html`) — minimal 新中式, ink
- **Classic & Timeless** (`western-classic.html`) — ivory, bordeaux, gold
- **Modern & Airy** (`western-modern.html`) — light, sage, clean grid
- **Every Photo** (`all-photos.html`) — the whole archive, filterable

No framework, no build server. Just HTML/CSS/JS plus one small script that
optimizes photos. It runs anywhere and will keep working for years.

---

## Adding your photos

1. **Install the image tool once** (needs [Node.js](https://nodejs.org)):
   ```
   npm install
   ```

2. **Sort your photos into these folders** (create them if missing):
   ```
   photos-src/traditional-chinese/
   photos-src/modern-chinese/
   photos-src/western-classic/
   photos-src/western-modern/
   ```
   (The "Every Photo" page is built automatically from all four — no folder needed.)
   JPG, PNG, HEIC, TIFF and WebP are all accepted.

3. **Optimize them** — resizes to fast web sizes + thumbnails and rebuilds the
   galleries:
   ```
   npm run build:images
   ```
   Your originals in `photos-src/` are never uploaded (they're git-ignored). Only
   the optimized versions in `assets/images/` and the lists in `data/` are published.

4. **Preview locally:**
   ```
   npm run serve
   ```
   then open the printed address (e.g. http://localhost:3000).

> The site currently ships with **placeholder tiles** so you can see the layout.
> Running `build:images` replaces them with your real photos.

## Editing the words

Names, the welcome message, and each theme's blurb live in **`data/site.json`** —
edit that one file. Photo captions can be added per-photo in the generated
`data/<theme>.json` files (add a `"caption": "..."` to any entry).

---

## Publishing (GitHub Pages + your own domain)

1. Create a **public** GitHub repository and push this folder to it.
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**,
   pick your `main` branch and the root folder. Save. Your site goes live at
   `https://<username>.github.io/<repo>/` within a minute.
3. **Custom subdomain** (reuses the domain you already own — no purchase):
   - Add a file named `CNAME` in this folder containing just your subdomain, e.g.
     `wedding.yourdomain.com`
   - At your domain's DNS settings, add a **CNAME record**:
     `wedding` → `<username>.github.io`
   - Back in Settings → Pages, enter the same subdomain under "Custom domain."
     GitHub issues HTTPS automatically.

To update the site later: add photos → `npm run build:images` → `git add -A` →
`git commit` → `git push`. GitHub Pages redeploys on its own.

## Why photos live in the repo (not Google Drive)

Google Drive throttles and blocks image hotlinking, so it's unreliable for a
website. Optimized to web sizes, ~200 photos total only about 70 MB — well within
GitHub's limits and served fast from its global CDN.
