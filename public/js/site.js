/* Gorkhali in Japan — small, dependency-free behaviour:
   video player (facade → privacy-enhanced embed on click), section reveals, contact form,
   count-up numbers, chart tooltips, the footer emblem, and remembering the language.
   (Fresh view counts come from the server: the pages themselves are re-rendered every few minutes.) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const strings = JSON.parse($("#i18n")?.textContent || "{}");

  /* ---------- player ---------- */
  const dlg = $("#player");
  const frame = $(".player-frame", dlg);
  function play(id, title) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id) || !dlg.showModal) return false;
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = title || "YouTube video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    f.referrerPolicy = "strict-origin-when-cross-origin";
    frame.replaceChildren(f);
    $(".player-title", dlg).textContent = title || "";
    $(".player-yt", dlg).href = `https://www.youtube.com/watch?v=${id}`;
    dlg.showModal();
    return true;
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-play]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return; // new-tab clicks still go to YouTube
    if (play(a.dataset.play, a.dataset.title)) e.preventDefault();
  });
  $(".player-close", dlg).addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => frame.replaceChildren());

  /* ---------- the mobile menu closes after choosing a section ---------- */
  const menu = $(".menu");
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
  // the sheet sits right under the header and the page behind it stops scrolling
  const header = $(".top");
  const placeSheet = () => document.documentElement.style.setProperty("--top-h", header.getBoundingClientRect().bottom + "px");
  menu?.addEventListener("toggle", () => {
    if (menu.open) placeSheet();
    document.documentElement.classList.toggle("menu-open", menu.open);
  });
  addEventListener("resize", () => { if (menu?.open) placeSheet(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
  document.addEventListener("click", (e) => { if (menu?.open && !menu.contains(e.target)) menu.open = false; });

  /* ---------- reveal sections once ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    const items = $$(".sec-head, .stats, .charts, .videos, .mw, .road, .legend, .about-copy, .timeline, .faq-list, .follow-card, .work-copy, .contact, .more, .foot-brand");
    items.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) {
        en.target.classList.add("in");
        $$("[data-count]", en.target).forEach(countUp);
        io.unobserve(en.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- numbers count up once (the final value is already in the HTML) ---------- */
  function countUp(el) {
    const end = +el.dataset.count, dec = +el.dataset.dec || 0, fmt = new Intl.NumberFormat(strings.locale || "en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (!isFinite(end)) return;
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(end * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- chart tooltips (the same numbers are in the table view for keyboard / screen readers) ---------- */
  const tip = $(".tip");
  if (tip && matchMedia("(hover: hover)").matches) {
    let cur = null;
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest("[data-tip]");
      if (el === cur) return;
      cur = el;
      if (!el) { tip.hidden = true; return; }
      $("b", tip).textContent = el.dataset.tip;
      $(".mono", tip).textContent = el.dataset.tipMeta || "";
      tip.hidden = false;
    });
    document.addEventListener("pointermove", (e) => {
      if (tip.hidden) return;
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, e.clientX - w / 2)) + "px";
      tip.style.top = (e.clientY - h - 14 < 8 ? e.clientY + 18 : e.clientY - h - 14) + "px";
    });
    addEventListener("scroll", () => { tip.hidden = true; cur = null; }, { passive: true });
  }

  /* ---------- footer emblem tilts toward the pointer ---------- */
  const emblem = $(".emblem"), tilt = $(".emblem-tilt");
  if (emblem && tilt && !reduced && matchMedia("(hover: hover)").matches) {
    emblem.addEventListener("pointermove", (e) => {
      const r = emblem.getBoundingClientRect();
      tilt.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 24 + "deg");
      tilt.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 24 + "deg");
    });
    emblem.addEventListener("pointerleave", () => { tilt.style.setProperty("--rx", "0deg"); tilt.style.setProperty("--ry", "0deg"); });
  }

  /* ---------- language: remember the choice ---------- */
  $$("[data-lang]").forEach((a) => a.addEventListener("click", () => { try { localStorage.setItem("gij_lang", a.dataset.lang); } catch {} }));

  /* ---------- contact form (works without JS as a normal POST) ---------- */
  const form = $(".contact");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $(".form-status", form), btn = $("button[type=submit]", form);
    status.className = "form-status";
    status.textContent = form.dataset.sending;
    btn.disabled = true;
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error();
      status.textContent = form.dataset.ok;
      form.reset();
    } catch {
      status.classList.add("err");
      status.textContent = form.dataset.fail;
    } finally {
      btn.disabled = false;
    }
  });

})();
