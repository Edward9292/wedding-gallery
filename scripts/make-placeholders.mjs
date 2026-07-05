// Generate themed SVG placeholder images + manifests so the site is fully
// viewable before real photos are added. Zero dependencies.
//
//   npm run placeholders
//
// When real photos are ready, `npm run build:images` overwrites the manifests
// with the optimized WebP versions.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { THEMES } from "./themes.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const OUT = path.join(root, "assets", "images");
const DATA = path.join(root, "data");

// A spread of aspect ratios so masonry/grids look real.
const RATIOS = [
  [1600, 2000], [2000, 1400], [1600, 1600], [1400, 2000],
  [2000, 1600], [1600, 1900], [2000, 1500], [1500, 1500],
  [1600, 2100], [2000, 1333], [1800, 1600], [1400, 1800],
];
const PER_THEME = 11;

// Escape XML entities — theme titles contain "&" which is invalid raw in SVG.
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg(theme, i, w, h) {
  // Light neutral tile so placeholders read clearly on every themed page.
  // A ring in the theme accent keeps a hint of each palette.
  const n = String(i + 1).padStart(2, "0");
  const cx = 20 + ((i * 37) % 60);
  const cy = 24 + ((i * 53) % 52);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#efe9df"/>
      <stop offset="1" stop-color="#d6cdbe"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${(cx / 100) * w}" cy="${(cy / 100) * h}" r="${Math.min(w, h) * 0.3}"
    fill="none" stroke="${theme.accent}" stroke-width="6" opacity="0.55"/>
  <g fill="#4a453d" font-family="Georgia, 'Noto Serif SC', serif" text-anchor="middle">
    <text x="50%" y="47%" font-size="${Math.round(Math.min(w, h) * 0.14)}" opacity="0.85">${n}</text>
    <text x="50%" y="56%" font-size="${Math.round(Math.min(w, h) * 0.033)}" letter-spacing="4" opacity="0.7">${xml(theme.titleEn.toUpperCase())}</text>
    <text x="50%" y="62%" font-size="${Math.round(Math.min(w, h) * 0.026)}" letter-spacing="2" opacity="0.5">YOUR PHOTO HERE</text>
  </g>
</svg>`;
}

async function main() {
  await mkdir(DATA, { recursive: true });
  const all = [];
  console.log("Generating placeholder images…");

  for (const theme of THEMES) {
    const outDir = path.join(OUT, theme.slug);
    await mkdir(outDir, { recursive: true });
    const manifest = [];
    for (let i = 0; i < PER_THEME; i++) {
      const [w, h] = RATIOS[i % RATIOS.length];
      const name = `placeholder-${String(i + 1).padStart(2, "0")}.svg`;
      await writeFile(path.join(outDir, name), svg(theme, i, w, h));
      const entry = {
        full: `assets/images/${theme.slug}/${name}`,
        thumb: `assets/images/${theme.slug}/${name}`,
        w, h,
        alt: `${theme.titleEn} placeholder ${i + 1}`,
        theme: theme.slug,
        themeTitle: theme.titleEn,
        placeholder: true,
      };
      manifest.push(entry);
      all.push(entry);
    }
    await writeFile(path.join(DATA, `${theme.slug}.json`), JSON.stringify(manifest, null, 2));
    console.log(`  ✓ ${theme.slug}: ${manifest.length} placeholders`);
  }
  await writeFile(path.join(DATA, "all-photos.json"), JSON.stringify(all, null, 2));
  console.log(`Done. ${all.length} placeholders. Replace with real photos via npm run build:images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
