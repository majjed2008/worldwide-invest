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

  const mount = document.querySelector("[data-globe]");
  if (mount instanceof HTMLElement && !reduceMotion && window.THREE) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 3.15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x6a7a90, 0.55);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.35);
    sun.position.set(4.2, 1.4, 2.6);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x88aaff, 0.35);
    rim.position.set(-3, -1, -2);
    scene.add(rim);

    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const dayMap = loader.load("assets/earth-day.jpg");
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = maxAniso;
    const lightsMap = loader.load("assets/earth-lights.png");
    lightsMap.colorSpace = THREE.SRGBColorSpace;
    lightsMap.anisotropy = maxAniso;
    const normalMap = loader.load("assets/earth-normal.jpg");
    normalMap.anisotropy = maxAniso;

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: dayMap,
        bumpMap: normalMap,
        bumpScale: 0.035,
        specular: new THREE.Color(0x335566),
        shininess: 12,
        emissiveMap: lightsMap,
        emissive: new THREE.Color(0x88aacc),
        emissiveIntensity: 0.55,
      }),
    );
    earth.rotation.y = 0.8;
    earth.rotation.z = 0.25;
    scene.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x7eb6ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
      }),
    );
    scene.add(atmosphere);

    let hoverBoost = 0;
    let targetBoost = 0;
    let dragging = false;
    let lastX = 0;
    let spin = 0.0018;

    const sizeGlobe = () => {
      const side = Math.max(1, Math.floor(mount.clientWidth));
      renderer.setSize(side, side, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    sizeGlobe();
    window.addEventListener("resize", sizeGlobe, { passive: true });

    mount.addEventListener("pointerenter", () => {
      targetBoost = 1;
    });
    mount.addEventListener("pointerleave", () => {
      targetBoost = 0;
      dragging = false;
    });
    mount.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      mount.setPointerCapture?.(e.pointerId);
    });
    mount.addEventListener("pointerup", () => {
      dragging = false;
    });
    mount.addEventListener("pointermove", (e) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      targetBoost = 0.45 + Math.min(0.55, Math.abs(x) * 1.1);
      if (dragging) {
        earth.rotation.y += (e.clientX - lastX) * 0.005;
        lastX = e.clientX;
      }
    });

    let raf = 0;
    const tick = () => {
      hoverBoost += (targetBoost - hoverBoost) * 0.08;
      if (!dragging) earth.rotation.y += spin + hoverBoost * 0.0035;
      atmosphere.rotation.y = earth.rotation.y * 0.98;
      earth.material.emissiveIntensity = 0.45 + hoverBoost * 0.35;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.cancelAnimationFrame(raf);
      else raf = window.requestAnimationFrame(tick);
    });
  }
})();
