/* Shared fullscreen photo viewer.
   Usage:  Lightbox.open(photos, index)
   where `photos` is an array of { full, alt, caption? }.
   Injects its own DOM once and is reused by every gallery page. */
const Lightbox = (() => {
  let photos = [];
  let index = 0;
  let root, imgEl, capEl, countEl, lastFocus;

  function build() {
    root = document.createElement("div");
    root.className = "lb";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Photo viewer");
    root.innerHTML = `
      <div class="lb__stage">
        <img class="lb__img" alt="">
        <button class="lb__btn lb__prev" aria-label="Previous photo">‹</button>
        <button class="lb__btn lb__next" aria-label="Next photo">›</button>
        <button class="lb__btn lb__close" aria-label="Close viewer">✕</button>
      </div>
      <div class="lb__caption"><span class="lb__text"></span> <span class="lb__count"></span></div>`;
    document.body.appendChild(root);

    imgEl = root.querySelector(".lb__img");
    capEl = root.querySelector(".lb__text");
    countEl = root.querySelector(".lb__count");

    root.querySelector(".lb__prev").addEventListener("click", () => step(-1));
    root.querySelector(".lb__next").addEventListener("click", () => step(1));
    root.querySelector(".lb__close").addEventListener("click", close);
    root.addEventListener("click", (e) => { if (e.target === root || e.target.classList.contains("lb__stage")) close(); });
    document.addEventListener("keydown", onKey);

    // Touch swipe.
    let x0 = null;
    root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  function show() {
    const p = photos[index];
    imgEl.classList.remove("is-shown");
    const next = new Image();
    next.onload = () => {
      imgEl.src = next.src;
      imgEl.alt = p.alt || "";
      requestAnimationFrame(() => imgEl.classList.add("is-shown"));
    };
    next.src = p.full;
    capEl.textContent = p.caption || p.alt || "";
    countEl.textContent = `${index + 1} / ${photos.length}`;
    // Preload neighbours.
    [index + 1, index - 1].forEach((i) => {
      if (photos[i]) { const im = new Image(); im.src = photos[i].full; }
    });
  }

  function step(dir) {
    index = (index + dir + photos.length) % photos.length;
    show();
  }

  function onKey(e) {
    if (!root || !root.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  }

  function open(list, i) {
    if (!root) build();
    photos = list;
    index = i || 0;
    lastFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    root.classList.add("is-open");
    show();
    root.querySelector(".lb__close").focus();
  }

  function close() {
    root.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  return { open };
})();

window.Lightbox = Lightbox;
