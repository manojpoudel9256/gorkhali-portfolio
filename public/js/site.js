/* Gorkhali in Japan — small, dependency-free behaviour:
   video player (facade → privacy-enhanced embed on click), section reveals, contact form,
   live refresh of the latest videos between deploys, and remembering the language. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
  document.addEventListener("click", (e) => { if (menu?.open && !menu.contains(e.target)) menu.open = false; });

  /* ---------- reveal sections once ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    const items = $$(".sec-head, .videos, .road, .about-copy, .timeline, .work-copy, .contact, .more");
    items.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
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

  /* ---------- fresh videos between deploys ---------- */
  const grid = $("#vgrid"), featured = $(".vcard.featured");
  const strings = JSON.parse($("#i18n")?.textContent || "{}");
  if (grid && featured && strings.series) {
    fetch("/api/videos", { signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.videos?.length || d.videos[0].id === featured.dataset.play) return;
        const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
        const card = (v, big) => `<a class="vcard${big ? " featured" : ""}" href="https://www.youtube.com/watch?v=${esc(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}"><span class="frame"><img src="https://i.ytimg.com/vi/${esc(v.id)}/${big ? "hqdefault" : "mqdefault"}.jpg" alt="" width="${big ? 480 : 320}" height="${big ? 270 : 180}" loading="lazy" decoding="async"><span class="dur mono" aria-hidden="true">${esc(v.length)}</span><span class="playbtn" aria-hidden="true"></span></span><span class="vmeta"><span class="vseries mono">${esc(strings.series[v.series] || "")}</span><span class="vtitle" lang="${/[぀-ヿ一-鿿]/.test(v.title) ? "ja" : "en"}">${esc(v.title)}</span></span></a>`;
        featured.outerHTML = card(d.videos[0], true);
        grid.innerHTML = d.videos.slice(1, 7).map((v) => card(v)).join("");
      })
      .catch(() => {});
  }
})();
