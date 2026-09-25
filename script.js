(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector(".hero");

  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-on", window.scrollY > 20);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

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

  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add("is-ready");
    });
  }

  const reveals = document.querySelectorAll("[data-reveal], .reveal");
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
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  const story = document.querySelector("[data-story]");
  const storyLines = [...document.querySelectorAll("[data-story-line]")];
  const updateStory = () => {
    if (!story || !storyLines.length) return;
    const rect = story.getBoundingClientRect();
    const total = Math.max(rect.height - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    const index = Math.min(storyLines.length - 1, Math.floor(progress * storyLines.length));
    storyLines.forEach((line, i) => {
      line.classList.toggle("is-on", i <= index);
    });
  };

  const layers = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;
  const updateMotion = () => {
    onScrollHeader();
    updateStory();
    if (!reduceMotion && layers.length) {
      const vh = window.innerHeight || 1;
      layers.forEach((el) => {
        const strength = Number(el.getAttribute("data-parallax-strength") || "18");
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const offset = ((mid - vh / 2) / vh) * -strength;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.08)`;
      });
    }
    ticking = false;
  };
  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateMotion);
    }
  };

  updateMotion();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
})();
