/* Hazel Wedding Co. — site behaviour
   Vanilla JS, no dependencies. Every feature is opt-in via data attributes so
   pages stay plain HTML. Respects prefers-reduced-motion throughout. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  body.classList.remove("no-js");

  /* ------------------------------------------------------------------
     1. Page curtain: fade in on load, fade out on internal navigation
     ------------------------------------------------------------------ */
  const ready = () => body.classList.add("ready");
  if (reduce) ready();
  else {
    // wait for fonts + a beat so the wordmark can breathe, but never > 1.6s
    const t = setTimeout(ready, 1600);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      setTimeout(() => { clearTimeout(t); ready(); }, 650);
    });
  }
  window.addEventListener("pageshow", (e) => { if (e.persisted) ready(); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduce) return;
    const url = new URL(a.href, location.href);
    const internal = url.origin === location.origin && !a.hasAttribute("download") && a.target !== "_blank";
    const samePage = url.pathname === location.pathname && url.hash;
    if (!internal || samePage || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    body.classList.add("leaving");
    setTimeout(() => { location.href = url.href; }, 420);
  });

  /* ------------------------------------------------------------------
     2. Header: solid on scroll, mobile menu, current page marker
     ------------------------------------------------------------------ */
  const header = $(".site-header");
  const onScrollHeader = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  const toggle = $(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".label").textContent = open ? "Close" : "Menu";
    });
    $$(".nav a").forEach((a) => a.addEventListener("click", () => body.classList.remove("menu-open")));
  }

  const here = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "/");
  $$(".nav a").forEach((a) => {
    const p = new URL(a.href, location.href).pathname.replace(/\.html$/, "").replace(/\/index$/, "/");
    if (p === here || (p !== "/" && here.startsWith(p))) a.setAttribute("aria-current", "page");
  });

  /* ------------------------------------------------------------------
     3. Split text — wrap words so they can rise in one by one
     ------------------------------------------------------------------ */
  $$("[data-split]").forEach((el) => {
    if (reduce) return;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const inner = document.createElement("span"); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("w")) walk(n);
      });
    };
    walk(el);
    el.classList.add("split");
    $$(".w > span", el).forEach((s, i) => s.style.setProperty("--i", i));
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "split");
  });

  /* ------------------------------------------------------------------
     4. Scroll reveal (staggered inside [data-stagger] parents)
     ------------------------------------------------------------------ */
  $$("[data-stagger]").forEach((parent) => {
    const step = parseFloat(parent.dataset.stagger) || 0.08;
    Array.from(parent.children).forEach((c, i) => {
      if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", "");
      c.style.setProperty("--d", `${i * step}s`);
    });
  });
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((el) => {
    // things already in the viewport on load reveal after the curtain lifts
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      const delay = reduce ? 0 : 750;
      setTimeout(() => el.classList.add("in"), delay + (parseFloat(el.style.getPropertyValue("--d")) || 0) * 1000);
    } else revealIO.observe(el);
  });

  /* ------------------------------------------------------------------
     5. Parallax — hero media + any [data-parallax="0.15"] element
     ------------------------------------------------------------------ */
  const heroMedia = $(".hero-media img, .hero-media video");
  const px = $$("[data-parallax]");
  if (!reduce && (heroMedia || px.length)) {
    let ticking = false;
    const run = () => {
      ticking = false;
      const vh = window.innerHeight;
      if (heroMedia) heroMedia.style.setProperty("--py", `${Math.min(window.scrollY, vh) * 0.28}px`);
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const centre = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5-ish
        el.style.transform = `translateY(${(-centre * speed * 100).toFixed(2)}px)`;
      });
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener("resize", run);
    run();
  }

  /* ------------------------------------------------------------------
     6. Counters — <b class="count" data-to="120" data-suffix="+">
     ------------------------------------------------------------------ */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; countIO.unobserve(el);
      const to = parseFloat(el.dataset.to) || 0, suffix = el.dataset.suffix || "", prefix = el.dataset.prefix || "";
      const dur = reduce ? 0 : 1600, t0 = performance.now();
      const tick = (now) => {
        const p = dur ? Math.min(1, (now - t0) / dur) : 1;
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(to * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  $$(".count[data-to]").forEach((el) => countIO.observe(el));

  /* ------------------------------------------------------------------
     7. Film embeds — click-to-load YouTube / Vimeo / self-hosted MP4
        <div class="film" data-youtube="ID" data-poster="..." data-title="..."></div>
        <div class="film" data-vimeo="ID" ...></div>
        <div class="film" data-src="/media/film.mp4" ...></div>
        Leave every source attribute empty and it renders a "film coming soon" poster.
     ------------------------------------------------------------------ */
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z"/></svg>';
  $$(".film").forEach((film) => {
    const yt = film.dataset.youtube, vm = film.dataset.vimeo, src = film.dataset.src;
    const title = film.dataset.title || "Wedding film";
    const sub = film.dataset.sub || "";
    let poster = film.dataset.poster || (yt ? `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg` : "");
    const has = !!(yt || vm || src);
    if (!has) film.classList.add("is-empty");
    film.innerHTML = `
      ${poster ? `<img class="film-poster" src="${poster}" alt="" loading="lazy">` : `<div class="film-poster" style="background:linear-gradient(135deg,#3b2f28,#5a4a40)"></div>`}
      ${has ? "" : '<span class="film-empty-note">Film slot — add a YouTube ID</span>'}
      <button class="film-play" type="button" aria-label="Play ${title}"><span class="ring">${PLAY}</span></button>
      <div class="film-label"><span class="title">${title}</span><span>${sub}</span></div>`;
    const btn = $(".film-play", film);
    btn.addEventListener("click", () => {
      if (!has) { btn.classList.add("shake"); return; }
      let node;
      if (yt) {
        node = document.createElement("iframe");
        node.src = `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        node.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        node.allowFullscreen = true; node.title = title;
      } else if (vm) {
        node = document.createElement("iframe");
        node.src = `https://player.vimeo.com/video/${vm}?autoplay=1&title=0&byline=0&portrait=0`;
        node.allow = "autoplay; fullscreen; picture-in-picture"; node.allowFullscreen = true; node.title = title;
      } else {
        node = document.createElement("video");
        node.src = src; node.controls = true; node.autoplay = true; node.playsInline = true;
        if (poster) node.poster = poster;
      }
      film.innerHTML = ""; film.appendChild(node); film.classList.add("is-playing");
    });
  });

  /* ------------------------------------------------------------------
     8. Hero background video — <video data-hero-video src="...">. If the
        source fails (e.g. not uploaded yet) fall back to the poster image.
     ------------------------------------------------------------------ */
  $$("video[data-hero-video]").forEach((v) => {
    const fallback = $(".hero-media img");
    const fail = () => { v.remove(); if (fallback) fallback.hidden = false; };
    if (!v.getAttribute("src") && !v.querySelector("source")) { fail(); return; }
    v.addEventListener("error", fail, true);
    v.addEventListener("canplay", () => { if (fallback) fallback.hidden = true; v.play().catch(() => {}); }, { once: true });
  });

  /* ------------------------------------------------------------------
     9. Gallery filter + lightbox
     ------------------------------------------------------------------ */
  const filters = $$(".filters button");
  const filterables = $$("[data-tags]");
  const items = $$(".gallery-item");
  filters.forEach((b) => b.addEventListener("click", () => {
    filters.forEach((x) => x.classList.toggle("active", x === b));
    const f = b.dataset.filter;
    filterables.forEach((it) => {
      const show = f === "all" || (it.dataset.tags || "").split(" ").includes(f);
      it.classList.toggle("hide", !show);
      if (show) { it.classList.remove("in"); requestAnimationFrame(() => it.classList.add("in")); }
    });
  }));

  if (items.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `<button class="lightbox-close" type="button">Close</button>
      <button class="lightbox-prev" type="button" aria-label="Previous">←</button>
      <img alt=""><button class="lightbox-next" type="button" aria-label="Next">→</button>
      <div class="lightbox-cap"></div>`;
    body.appendChild(lb);
    const img = $("img", lb), cap = $(".lightbox-cap", lb);
    let idx = 0;
    const visible = () => items.filter((i) => !i.classList.contains("hide"));
    const show = (i) => {
      const list = visible(); idx = (i + list.length) % list.length;
      const it = list[idx], pic = $("img", it);
      img.src = pic.dataset.full || pic.currentSrc || pic.src; img.alt = pic.alt;
      cap.textContent = it.dataset.caption || pic.alt || "";
    };
    const open = (it) => { show(visible().indexOf(it)); lb.classList.add("open"); body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); body.style.overflow = ""; };
    items.forEach((it) => it.addEventListener("click", () => open(it)));
    $(".lightbox-close", lb).addEventListener("click", close);
    $(".lightbox-prev", lb).addEventListener("click", () => show(idx - 1));
    $(".lightbox-next", lb).addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ------------------------------------------------------------------
     10. In-page sub-nav scroll spy
     ------------------------------------------------------------------ */
  const subLinks = $$(".subnav a[href^='#']");
  if (subLinks.length) {
    const targets = subLinks.map((a) => $(a.hash)).filter(Boolean);
    const spy = () => {
      let current = targets[0];
      targets.forEach((t) => { if (t.getBoundingClientRect().top <= 140) current = t; });
      subLinks.forEach((a) => a.classList.toggle("active", current && a.hash === `#${current.id}`));
    };
    window.addEventListener("scroll", spy, { passive: true }); spy();
  }

  /* ------------------------------------------------------------------
     11. Inquiry form — posts to Formspree (set data-endpoint on <form>).
         Without an endpoint it opens a pre-filled email instead.
     ------------------------------------------------------------------ */
  const form = $("form[data-inquiry]");
  if (form) {
    const status = $(".form-status", form) || form.appendChild(Object.assign(document.createElement("p"), { className: "form-status" }));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("_gotcha")) return; // honeypot
      const endpoint = form.dataset.endpoint;
      const btn = $("button[type=submit]", form);
      const say = (msg) => { status.textContent = msg; status.classList.add("show"); };
      if (!endpoint) {
        const to = form.dataset.mailto || "hello@example.com";
        const lines = [];
        data.forEach((v, k) => { if (!k.startsWith("_") && v) lines.push(`${k}: ${v}`); });
        location.href = `mailto:${to}?subject=${encodeURIComponent("Wedding inquiry — " + (data.get("names") || ""))}&body=${encodeURIComponent(lines.join("\n"))}`;
        say("Opening your email app — if nothing happens, write to me directly at " + to + ".");
        return;
      }
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        form.reset(); say("Thank you — your note is on its way. I reply to every inquiry within two business days.");
        btn.textContent = "Sent";
      } catch {
        say("Something went wrong on my end. Please email me directly and I’ll get right back to you.");
        btn.disabled = false; btn.textContent = "Send inquiry";
      }
    });
  }

  /* ------------------------------------------------------------------
     12. Marquee — duplicate track so the loop is seamless
     ------------------------------------------------------------------ */
  $$(".marquee-track").forEach((t) => { t.innerHTML += t.innerHTML; });

  /* ------------------------------------------------------------------
     13. Footer year
     ------------------------------------------------------------------ */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
