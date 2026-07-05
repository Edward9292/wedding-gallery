/* Renders a themed photo grid from a JSON manifest and wires each photo
   to the shared Lightbox. Drop a container on the page:

     <main class="gallery gallery--masonry" data-manifest="data/xxx.json"></main>

   Optional: data-layout is expressed via the gallery--masonry / gallery--grid
   class already on the element. */
(async function () {
  const el = document.querySelector("[data-manifest]");
  if (!el) return;

  let photos = [];
  try {
    const res = await fetch(el.dataset.manifest, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    photos = await res.json();
  } catch (err) {
    el.innerHTML = `<p class="gallery-empty">These photos are still being gathered — check back soon.</p>`;
    return;
  }

  if (!photos.length) {
    el.innerHTML = `<p class="gallery-empty">No photos here yet.</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  photos.forEach((p, i) => {
    const fig = document.createElement("figure");
    fig.className = "photo reveal";
    fig.style.setProperty("--w", p.w || 3);
    fig.style.setProperty("--h", p.h || 4);
    if (p.theme) fig.dataset.theme = p.theme;

    const btn = document.createElement("button");
    btn.className = "photo__btn";
    btn.type = "button";
    btn.setAttribute("aria-label", `Open photo ${i + 1}${p.alt ? ": " + p.alt : ""}`);

    const frame = document.createElement("span");
    frame.className = "photo__frame";

    const img = document.createElement("img");
    img.className = "photo__img";
    img.src = p.thumb || p.full;
    img.alt = p.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    if (p.w && p.h) { img.width = p.w; img.height = p.h; }

    frame.appendChild(img);
    btn.appendChild(frame);
    fig.appendChild(btn);
    btn.addEventListener("click", () => window.Lightbox.open(photos, i));
    frag.appendChild(fig);
  });

  el.innerHTML = "";
  el.appendChild(frag);

  // Let the reveal observer (motion.js) pick up the freshly added figures.
  document.dispatchEvent(new CustomEvent("gallery:rendered"));
})();
