/* Tasteful, restrained motion — scroll reveal + gentle hero parallax.
   Everything here no-ops when the visitor prefers reduced motion. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  /* ---- Scroll reveal, lightly staggered per row ---------------- */
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger by horizontal position so a row eases in left-to-right.
        const rect = el.getBoundingClientRect();
        const col = Math.max(0, Math.round(rect.left / Math.max(220, rect.width)));
        el.style.transitionDelay = Math.min(col * 70, 260) + "ms";
        el.classList.add("is-visible");
        obs.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );

  function observeAll() {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
  }
  observeAll();
  document.addEventListener("gallery:rendered", observeAll);

  /* ---- Gentle parallax on [data-parallax] elements ------------- */
  const layers = Array.from(document.querySelectorAll("[data-parallax]"));
  if (layers.length) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        layers.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
