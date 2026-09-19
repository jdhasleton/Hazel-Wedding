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
    // Inline validation: required fields + a sane email. Messages sit under the field,
    // clear as soon as the visitor starts typing, and the first bad field gets focus.
    const fieldOf = (input) => input.closest(".field");
    const mark = (input, msg) => {
      const f = fieldOf(input); if (!f) return;
      let err = $(".err", f);
      if (!err) { err = document.createElement("span"); err.className = "err"; err.setAttribute("aria-live", "polite"); f.appendChild(err); }
      err.textContent = msg || ""; f.classList.toggle("invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    const validate = () => {
      let first = null;
      $$("[required]", form).forEach((input) => {
        const v = (input.value || "").trim();
        let msg = "";
        if (!v) msg = "Please fill this in.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "That email doesn’t look right.";
        mark(input, msg); if (msg && !first) first = input;
      });
      if (first) first.focus({ preventScroll: false });
      return !first;
    };
    $$("[required]", form).forEach((input) => input.addEventListener("input", () => mark(input, "")));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;
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

  /* ------------------------------------------------------------------
     14. Header tuck — hides on scroll down, returns on scroll up.
         Never while the mobile menu is open, never near the top.
     ------------------------------------------------------------------ */
  if (header && !reduce) {
    let last = window.scrollY, acc = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY, dy = y - last; last = y;
      if (body.classList.contains("menu-open")) return;
      if (y < 160) { header.classList.remove("tucked"); acc = 0; return; }
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;   // only react to sustained movement
      if (acc > 60) header.classList.add("tucked");
      if (acc < -20) header.classList.remove("tucked");
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     15. Mobile menu — Escape closes it; a wide resize closes it too.
     ------------------------------------------------------------------ */
  const closeMenu = () => {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open");
    if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.querySelector(".label").textContent = "Menu"; toggle.focus(); }
  };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });

  /* ------------------------------------------------------------------
     16. Magnetic buttons — pills drift a few pixels toward the cursor.
         Pointer devices only; skipped under reduced motion.
     ------------------------------------------------------------------ */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".btn, .nav-cta").forEach((el) => {
      const strength = 0.18, max = 6;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.setProperty("--mx", `${Math.max(-max, Math.min(max, x)).toFixed(1)}px`);
        el.style.setProperty("--my", `${Math.max(-max, Math.min(max, y)).toFixed(1)}px`);
      });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
    });
  }

  /* ------------------------------------------------------------------
     17. FAQ accordion — one open at a time per group, with an animated
         height so the page doesn't jump. Falls back to native <details>.
     ------------------------------------------------------------------ */
  $$(".faq").forEach((group) => {
    const items = $$("details", group);
    const animate = (d, open) => {
      const bodyEl = $(".faq-body", d); if (!bodyEl || reduce) { d.open = open; return; }
      d.classList.add("animating");
      let finished = false;
      const finish = () => {
        if (finished) return; finished = true;
        if (!open) d.open = false;
        bodyEl.style.height = ""; bodyEl.style.opacity = "";
        d.classList.remove("animating");
      };
      const onEnd = (e) => { if (e.propertyName === "height") { bodyEl.removeEventListener("transitionend", onEnd); finish(); } };
      bodyEl.addEventListener("transitionend", onEnd);
      setTimeout(finish, 600);                      // safety net if the transition never fires
      if (open) {
        d.open = true;
        const h = bodyEl.scrollHeight;
        bodyEl.style.height = "0px"; bodyEl.style.opacity = "0";
        void bodyEl.offsetHeight;                   // flush so the 0 → h change actually transitions
        bodyEl.style.height = `${h}px`; bodyEl.style.opacity = "1";
      } else {
        bodyEl.style.height = `${bodyEl.scrollHeight}px`; bodyEl.style.opacity = "1";
        void bodyEl.offsetHeight;
        bodyEl.style.height = "0px"; bodyEl.style.opacity = "0";
      }
    };
    items.forEach((d) => {
      $("summary", d).addEventListener("click", (e) => {
        e.preventDefault();
        if (d.classList.contains("animating")) return;
        const willOpen = !d.open;
        items.forEach((o) => { if (o !== d && o.open && !o.classList.contains("animating")) animate(o, false); });
        animate(d, willOpen);
      });
    });
  });

  /* ------------------------------------------------------------------
     18. Image fade-in — real photos ease in once decoded. Placeholders
         are excluded in CSS so the slot labels stay visible.
     ------------------------------------------------------------------ */
  body.classList.add("js-fade");
  $$(".frame img").forEach((img) => {
    const done = () => img.classList.add("loaded");
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
  });

  /* ------------------------------------------------------------------
     19. Back to top — appears after the first screen, smooth-scrolls up.
     ------------------------------------------------------------------ */
  const top = document.createElement("button");
  top.className = "to-top"; top.type = "button"; top.setAttribute("aria-label", "Back to top");
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 19V5m0 0l-6 6m6-6l6 6"/></svg>';
  body.appendChild(top);
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  const onTop = () => top.classList.toggle("show", window.scrollY > window.innerHeight * 1.2);
  window.addEventListener("scroll", onTop, { passive: true }); onTop();

  /* ------------------------------------------------------------------
     20. External links — open in a new tab safely, without touching
         the mailto/tel links or anything already marked.
     ------------------------------------------------------------------ */
  $$("a[href^='http']").forEach((a) => {
    if (new URL(a.href).origin === location.origin) return;
    if (!a.target) a.target = "_blank";
    const rel = (a.rel || "").split(/\s+/).filter(Boolean);
    if (!rel.includes("noopener")) rel.push("noopener");
    a.rel = rel.join(" ");
  });

  /* ------------------------------------------------------------------
     21. Newsletter signup — <form data-newsletter data-endpoint="…">.
         Same contract as the inquiry form: Formspree-style POST when an
         endpoint is set, otherwise a pre-addressed email.
     ------------------------------------------------------------------ */
  $$("form[data-newsletter]").forEach((nf) => {
    const status = $(".form-status", nf) || nf.appendChild(Object.assign(document.createElement("p"), { className: "form-status" }));
    const input = $("input[type=email]", nf), btn = $("button[type=submit]", nf);
    const say = (msg) => { status.textContent = msg; status.classList.add("show"); };
    nf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(nf);
      if (data.get("_gotcha")) return;
      const v = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { input.focus(); say("Please enter a valid email address."); return; }
      const endpoint = nf.dataset.endpoint;
      if (!endpoint) {
        const to = nf.dataset.mailto || "planning@hazelwedding.com";
        location.href = `mailto:${to}?subject=${encodeURIComponent("Please add me to the Hazel Wedding list")}&body=${encodeURIComponent(v)}`;
        say("Opening your email app — if nothing happens, write to " + to + " and I’ll add you.");
        return;
      }
      btn.disabled = true; btn.textContent = "Subscribing…";
      try {
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        nf.reset(); say("You’re on the list. Thank you."); btn.textContent = "Subscribed";
      } catch {
        say("Something went wrong. Please try again, or email " + (nf.dataset.mailto || "planning@hazelwedding.com") + ".");
        btn.disabled = false; btn.textContent = "Subscribe";
      }
    });
  });

  /* ------------------------------------------------------------------
     22. Cookie consent + Google Analytics gate.
         - Essential cookies always on; analytics only after consent.
         - Choice stored in localStorage ("hazel-consent": {analytics, ts}).
         - Set GA_ID to the property's measurement ID (G-XXXXXXXXXX). While
           it is empty nothing loads, but the banner still records the choice.
         - Any element with [data-cookie-settings] reopens the preferences.
     ------------------------------------------------------------------ */
  const GA_ID = "";                                            // TODO: paste the GA4 measurement ID
  const KEY = "hazel-consent";
  const readConsent = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
  const writeConsent = (c) => { try { localStorage.setItem(KEY, JSON.stringify({ ...c, ts: Date.now() })); } catch {} };
  let gaLoaded = false;
  const loadGA = () => {
    if (gaLoaded || !GA_ID) return; gaLoaded = true;
    const sc = document.createElement("script"); sc.async = true; sc.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  };
  const applyConsent = (c) => { if (c && c.analytics) loadGA(); };

  const banner = document.createElement("aside");
  banner.className = "cookie-banner"; banner.setAttribute("role", "region"); banner.setAttribute("aria-label", "Cookie preferences");
  const privacyHref = (location.pathname.includes("/journal/") ? "../" : "./") + "privacy";
  banner.innerHTML = `
    <p>We use cookies and similar technologies, including Google Analytics, to understand how visitors use our website and improve the Hazel Wedding experience. You can accept or manage non-essential cookies. <a class="u" href="${privacyHref}">Privacy Policy</a></p>
    <div class="cookie-prefs">
      <div class="row"><div><b>Essential</b><small>Needed for the site to work: remembering this choice, keeping forms working.</small></div><button class="switch" type="button" role="switch" aria-checked="true" aria-label="Essential cookies, always on" disabled></button></div>
      <div class="row"><div><b>Analytics</b><small>Google Analytics, so I can see which pages are useful. Never sold, never shared for advertising.</small></div><button class="switch" type="button" role="switch" aria-checked="false" aria-label="Analytics cookies" data-analytics></button></div>
    </div>
    <div class="cookie-actions">
      <button class="btn btn-primary" type="button" data-accept>Accept</button>
      <button class="btn btn-outline" type="button" data-manage>Manage Cookies</button>
      <button class="btn btn-outline" type="button" data-save hidden>Save preferences</button>
    </div>`;
  body.appendChild(banner);
  const analyticsSwitch = $("[data-analytics]", banner), saveBtn = $("[data-save]", banner), manageBtn = $("[data-manage]", banner);
  const openBanner = (manage) => {
    const c = readConsent();
    analyticsSwitch.setAttribute("aria-checked", String(!!(c && c.analytics)));
    banner.classList.toggle("manage", !!manage); saveBtn.hidden = !manage; manageBtn.hidden = !!manage;
    banner.classList.add("show"); body.classList.add("cookie-open");
  };
  const closeBanner = () => { banner.classList.remove("show", "manage"); body.classList.remove("cookie-open"); };
  const decide = (analytics) => { const c = { analytics: !!analytics }; writeConsent(c); applyConsent(c); closeBanner(); };
  $("[data-accept]", banner).addEventListener("click", () => decide(true));
  manageBtn.addEventListener("click", () => openBanner(true));
  saveBtn.addEventListener("click", () => decide(analyticsSwitch.getAttribute("aria-checked") === "true"));
  analyticsSwitch.addEventListener("click", () => analyticsSwitch.setAttribute("aria-checked", String(analyticsSwitch.getAttribute("aria-checked") !== "true")));
  $$("[data-cookie-settings]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); openBanner(true); }));

  const existing = readConsent();
  if (existing) applyConsent(existing);
  else setTimeout(() => openBanner(false), reduce ? 0 : 1400);   // let the curtain lift first
})();
