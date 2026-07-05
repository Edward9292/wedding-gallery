// Shared config for the image scripts. The four source themes each map to a
// folder under photos-src/. The "all-photos" gallery is aggregated from them,
// so it has no source folder of its own.
export const THEMES = [
  {
    slug: "traditional-chinese",
    titleEn: "Traditional Chinese",
    // Placeholder palette: lacquer red + gold.
    bg: ["#7a1218", "#4d0d10"],
    accent: "#e8c577",
    ink: "#f5e6c8",
  },
  {
    slug: "modern-chinese",
    titleEn: "Modern Chinese",
    // Rice paper + ink + muted vermilion.
    bg: ["#f3efe9", "#e7e0d5"],
    accent: "#b23a34",
    ink: "#20201e",
  },
  {
    slug: "western-classic",
    titleEn: "Classic & Timeless",
    // Ivory + bordeaux + gold.
    bg: ["#f6f1e9", "#ece2d2"],
    accent: "#6e2233",
    ink: "#2b2724",
  },
  {
    slug: "western-modern",
    titleEn: "Modern & Airy",
    // White + greige + sage.
    bg: ["#fcfcfa", "#e7e3dc"],
    accent: "#9aa891",
    ink: "#3a3a36",
  },
];

// Web output sizes.
export const FULL_WIDTH = 1600; // long-edge target for the lightbox view
export const THUMB_WIDTH = 760; // grid thumbnail
export const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic"]);

// Turn "0042_first-look.jpg" into "First look" for alt text.
export function prettyName(file) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^[0-9]+[-_ ]*/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
