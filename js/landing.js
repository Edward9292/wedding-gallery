/* Populates the landing hero from data/site.json and builds the theme
   portal cards. The HTML already contains sensible defaults, so the page
   is readable even before this runs (or if opened without a server). */
(async function () {
  let site;
  try {
    const res = await fetch("data/site.json", { cache: "no-cache" });
    site = await res.json();
  } catch (err) {
    return; // Keep the HTML defaults.
  }

  // Fill any [data-site="key"] element whose key exists.
  document.querySelectorAll("[data-site]").forEach((el) => {
    const key = el.dataset.site;
    if (site[key] != null && site[key] !== "") el.textContent = site[key];
  });

  const list = document.querySelector("[data-portals]");
  if (!list || !Array.isArray(site.themes)) return;

  list.innerHTML = site.themes
    .map((t, i) => {
      const wide = t.slug === "all-photos" ? " portal--wide" : "";
      const num = String(i + 1).padStart(2, "0");
      return `
      <li class="portal portal--${t.slug}${wide} reveal">
        <a class="portal__link" href="${t.page}">
          <span class="portal__swatch" aria-hidden="true">
            <img class="portal__preview" alt="" loading="lazy" decoding="async">
          </span>
          <span class="portal__body">
            <span class="portal__index">${num}</span>
            <span class="portal__zh">${t.titleZh}</span>
            <span class="portal__en">${t.titleEn}</span>
            <span class="portal__blurb">${t.blurb}</span>
            <span class="portal__go">View <span aria-hidden="true">→</span></span>
          </span>
        </a>
      </li>`;
    })
    .join("");

  document.dispatchEvent(new CustomEvent("gallery:rendered"));

  // Drop a random photo from each theme into its portal swatch. The gradient
  // palette underneath stays visible while this loads (or if it can't).
  site.themes.forEach(async (t) => {
    const img = list.querySelector(`.portal--${t.slug} .portal__preview`);
    if (!img) return;
    const manifest = t.manifest || `data/${t.slug}.json`;
    try {
      const res = await fetch(manifest, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const photos = await res.json();
      if (!Array.isArray(photos) || !photos.length) return;
      const pick = photos[Math.floor(Math.random() * photos.length)];
      const src = pick.thumb || pick.full;
      if (!src) return;
      img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
      img.src = src;
    } catch (err) {
      /* Leave the gradient swatch as-is. */
    }
  });
})();
