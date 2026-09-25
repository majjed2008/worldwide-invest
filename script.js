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

  const film = document.querySelector(".hero-film");
  if (film) {
    if (reduceMotion || hero?.getAttribute("data-hero-film") !== "on") {
      film.pause?.();
      film.removeAttribute("autoplay");
    } else {
      const play = () => {
        film.play().catch(() => {});
      };
      play();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) film.pause();
        else play();
      });
    }
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
  const storyBgs = [...document.querySelectorAll("[data-story-bg]")];
  let storyIndex = -1;
  const updateStory = () => {
    if (!story || !storyLines.length) return;
    const rect = story.getBoundingClientRect();
    const total = Math.max(rect.height - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    const index = Math.min(storyLines.length - 1, Math.floor(progress * storyLines.length));
    storyLines.forEach((line, i) => {
      line.classList.toggle("is-on", i <= index);
    });
    if (index !== storyIndex) {
      storyIndex = index;
      storyBgs.forEach((img, i) => {
        img.classList.toggle("is-on", i === index);
      });
    }
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

  const canvas = document.querySelector("[data-globe]");
  if (canvas instanceof HTMLCanvasElement && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let rotation = 0;
    let hoverBoost = 0;
    let targetBoost = 0;
    let raf = 0;

    const resize = () => {
      const size = Math.min(560, Math.floor(canvas.clientWidth * window.devicePixelRatio || 560));
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    canvas.addEventListener("pointerenter", () => {
      targetBoost = 1;
    });
    canvas.addEventListener("pointerleave", () => {
      targetBoost = 0;
    });
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      targetBoost = 0.55 + Math.min(0.45, Math.abs(x) * 1.2);
    });

    const project = (x, y, z, rot) => {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const xr = x * cos - z * sin;
      const zr = x * sin + z * cos;
      return { x: xr, y, z: zr };
    };

    const draw = (time) => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = w * 0.38;
      hoverBoost += (targetBoost - hoverBoost) * 0.08;
      rotation += 0.004 + hoverBoost * 0.006;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = Math.max(1, w * 0.0022);
      const brass = `rgba(208, 176, 122, ${0.45 + hoverBoost * 0.4})`;
      const brassSoft = `rgba(184, 149, 95, ${0.18 + hoverBoost * 0.2})`;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = brass;
      ctx.stroke();

      for (let i = -2; i <= 2; i += 1) {
        const lat = (i / 3) * (Math.PI / 2);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
          const x = Math.cos(lat) * Math.cos(a);
          const y = Math.sin(lat);
          const z = Math.cos(lat) * Math.sin(a);
          const p = project(x, y, z, rotation);
          if (p.z < -0.05) continue;
          const px = cx + p.x * r;
          const py = cy - p.y * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = brassSoft;
        ctx.stroke();
      }

      for (let m = 0; m < 6; m += 1) {
        const base = (m / 6) * Math.PI * 2;
        ctx.beginPath();
        for (let t = -Math.PI / 2; t <= Math.PI / 2 + 0.01; t += 0.06) {
          const x = Math.cos(t) * Math.cos(base);
          const y = Math.sin(t);
          const z = Math.cos(t) * Math.sin(base);
          const p = project(x, y, z, rotation);
          if (p.z < -0.02) {
            ctx.moveTo(cx + p.x * r, cy - p.y * r);
            continue;
          }
          const px = cx + p.x * r;
          const py = cy - p.y * r;
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = brass;
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.15);
      glow.addColorStop(0, `rgba(208, 176, 122, ${0.05 + hoverBoost * 0.08})`);
      glow.addColorStop(1, "rgba(208, 176, 122, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      const marker = project(0.55, 0.15, 0.75, rotation);
      if (marker.z > 0) {
        ctx.beginPath();
        ctx.arc(cx + marker.x * r, cy - marker.y * r, 3 + hoverBoost * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 239, 232, ${0.7 + hoverBoost * 0.3})`;
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
      void time;
    };

    raf = window.requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.cancelAnimationFrame(raf);
      else raf = window.requestAnimationFrame(draw);
    });
  }
})();
