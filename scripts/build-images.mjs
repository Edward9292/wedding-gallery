// Optimize full-resolution originals into fast web images + thumbnails, and
// write the per-theme photo manifests the gallery pages read.
//
//   1. Drop your sorted photos into  photos-src/<theme-slug>/
//   2. Run  npm run build:images
//   3. Commit the generated assets/images/** and data/*.json, then push.
//
// Requires the `sharp` dependency (npm install).
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { THEMES, FULL_WIDTH, THUMB_WIDTH, IMAGE_EXTS, prettyName } from "./themes.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const SRC = path.join(root, "photos-src");
const OUT = path.join(root, "assets", "images");
const DATA = path.join(root, "data");

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  return entries
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function processTheme(theme) {
  const srcDir = path.join(SRC, theme.slug);
  const outDir = path.join(OUT, theme.slug);
  const files = await listImages(srcDir);
  if (files.length === 0) {
    console.log(`  · ${theme.slug}: no source photos found (skipped)`);
    return [];
  }
  await mkdir(outDir, { recursive: true });

  const manifest = [];
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const src = path.join(srcDir, file);
    const img = sharp(src, { failOn: "none" }).rotate(); // respect EXIF orientation
    const meta = await img.metadata();

    const fullName = `${base}.webp`;
    const thumbName = `${base}.thumb.webp`;

    const full = await img
      .clone()
      .resize({ width: FULL_WIDTH, height: FULL_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(path.join(outDir, fullName), full.data);

    await img
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(outDir, thumbName));

    manifest.push({
      full: `assets/images/${theme.slug}/${fullName}`,
      thumb: `assets/images/${theme.slug}/${thumbName}`,
      w: full.info.width,
      h: full.info.height,
      alt: prettyName(file),
      theme: theme.slug,
      themeTitle: theme.titleEn,
    });
    process.stdout.write(".");
  }
  console.log(`\n  ✓ ${theme.slug}: ${manifest.length} photos`);
  return manifest;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`\nNo photos-src/ folder found.\nCreate photos-src/<theme>/ folders and add your photos, then re-run.\n`);
    console.error(`Expected themes: ${THEMES.map((t) => t.slug).join(", ")}\n`);
    process.exit(1);
  }
  await mkdir(DATA, { recursive: true });
  console.log("Optimizing photos…");

  const all = [];
  for (const theme of THEMES) {
    const manifest = await processTheme(theme);
    await writeFile(path.join(DATA, `${theme.slug}.json`), JSON.stringify(manifest, null, 2));
    all.push(...manifest);
  }
  await writeFile(path.join(DATA, "all-photos.json"), JSON.stringify(all, null, 2));
  console.log(`\nDone. ${all.length} photos across ${THEMES.length} themes.`);
  console.log("Commit assets/images/ and data/*.json, then push to publish.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
