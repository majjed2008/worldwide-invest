(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector("[data-header]");
  const onScroll = () => {
    if (header) header.classList.toggle("is-on", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menu = document.querySelector("[data-menu]");
  const drawer = document.querySelector("[data-drawer]");
  if (menu && drawer) {
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", String(!open));
      drawer.hidden = open;
    });
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.setAttribute("aria-expanded", "false");
        drawer.hidden = true;
      });
    });
  }

  const targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("in"));
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = document.querySelectorAll("[data-parallax]");
  if (!reduceMotion && layers.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight || 1;
      layers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const offset = ((mid - vh / 2) / vh) * -18;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.06)`;
      });
      ticking = false;
    };
    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
  }
})();
