/* Gorkhali in Japan — interactions: i18n, theme, reveals, live stats, count-ups.
   No libraries. */

/* ---------- state ---------- */
const LANG_KEY = "gj_lang", THEME_KEY = "gj_theme";
let lang = localStorage.getItem(LANG_KEY) || "en";
let theme = localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- render all language-dependent content ---------- */
function renderContent() {
  const t = COPY[lang];
  document.documentElement.lang = lang === "ja" ? "ja" : "en";
  localStorage.setItem(LANG_KEY, lang);
  // flag shows the language you'll switch TO
  $("#langFlag").textContent = lang === "ja" ? "🇬🇧" : "🇯🇵";
  $("#langBtn").title = lang === "ja" ? "Switch to English" : "日本語に切り替え";

  document.querySelectorAll("[data-i18n]").forEach(el => { const v = t[el.dataset.i18n]; if (v) el.textContent = v; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { const v = t[el.dataset.i18nHtml]; if (v) el.innerHTML = v; });

  $("#heroMeta").innerHTML = t.heroMeta.map(m => `<span class="hb-item">${m}</span>`).join("");

  $("#timeline").innerHTML = t.timeline.map(x => `
    <li class="reveal"><span class="t-year">${x.year}</span>
      <div><h3>${x.title}</h3><p>${x.text}</p></div></li>`).join("");

  $("#pillarGrid").innerHTML = t.pillars.map(p => `
    <article class="pillar reveal"><span class="p-num">${p.num}</span><h3>${p.title}</h3><p>${p.text}</p></article>`).join("");

  // Infinite logo marquee — real tool/tech logos, duplicated for a seamless loop.
  // Two rows scroll in opposite directions (row 2 reversed for variety).
  const chip = l =>
    `<span class="logo-chip"><span class="logo-ico"><img src="logos/${l.file}.svg" alt="" loading="lazy" width="26" height="26"></span><b>${l.name}</b></span>`;
  const row1 = LOGOS.map(chip).join("");
  const row2 = [...LOGOS].reverse().map(chip).join("");
  $("#logoTrack").innerHTML = row1 + row1;
  $("#logoTrack2").innerHTML = row2 + row2;

  $("#reposLinks").innerHTML = t.repos.map(r =>
    `<a href="https://github.com/manojpoudel9256/${r.repo}" target="_blank" rel="noopener">${r.name}</a>`
  ).join("<span class='dot-sep'>·</span>");

  $("#videoGrid").innerHTML = VIDEOS.map(v => {
    const title = lang === "ja" ? v.ja : v.en;
    return `
    <a class="vcard reveal" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
      <div class="vthumb">
        <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${esc(title)}" loading="lazy">
        <div class="vplay"></div>
        ${v.badge ? `<span class="vbadge">${v.badge === "new" ? t.vidBadgeNew : t.vidBadgeTop}</span>` : ""}
      </div>
      <div class="vbody">
        <h3>${esc(title)}</h3>
        <div class="vmeta">${v.year}${v.views ? ` · <b>${v.views} ${t.vidViews}</b>` : ""}</div>
      </div>
    </a>`;
  }).join("");

  $("#numbers").innerHTML = t.numbers.map(n => `
    <div><b id="num-${n.id}" data-count="${liveStats[n.id] ?? n.n}" data-plain="${n.plain ? 1 : 0}" data-suffix="${n.suffix || ""}">0</b>
    <span>${n.live ? `<i class="pulse-dot" style="display:inline-block;vertical-align:middle;margin-right:6px"></i>` : ""}${n.label}</span></div>`).join("");

  $("#audGrid").innerHTML = t.audience.map(a => `
    <div class="aud reveal"><h3>${a.icon} ${a.title}</h3><p>${a.text}</p></div>`).join("");

  // about: photo alt, language chips, fact row
  $("#aboutImg").alt = t.photoAlt;
  $("#langChips").innerHTML = t.aboutLangs.map(l => `<span class="lang-chip">${l}</span>`).join("");
  $("#factRow").innerHTML = t.aboutFacts.map(f => `<span class="fact">${f.icon} ${f.text}</span>`).join("");

  // most viewed card
  const mvUrl = `https://www.youtube.com/watch?v=${MOST_VIEWED.id}`;
  $("#mvThumbLink").href = mvUrl;
  $("#mvWatchBtn").href = mvUrl;
  $("#mvThumb").src = `https://i.ytimg.com/vi/${MOST_VIEWED.id}/hq720.jpg`;
  $("#mvThumb").onerror = function () { this.onerror = null; this.src = `https://i.ytimg.com/vi/${MOST_VIEWED.id}/hqdefault.jpg`; };
  $("#mvThumb").alt = t.mvVideoTitle;
  $("#mvYearNum").textContent = MOST_VIEWED.year;
  $("#mvViewsNum").dataset.count = liveStats.mvViews ?? MOST_VIEWED.fallbackViews;
  $("#mvLikesNum").dataset.count = liveStats.mvLikes ?? MOST_VIEWED.fallbackLikes;
  $("#mvViewsNum").textContent = "0";
  $("#mvLikesNum").textContent = "0";

  observeReveals();
  observeCounts();
}

/* ---------- live stats (real-time, with baked fallbacks) ---------- */
const liveStats = {}; // subs, views, vids, mvViews, mvLikes

async function fetchJson(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } finally { clearTimeout(timer); }
}

async function fetchLiveStats() {
  // channel: real-time subscribers / total views / video count
  try {
    const d = await fetchJson(`https://api.socialcounts.org/youtube-live-subscriber-count/${CHANNEL_ID}`, 6000);
    const api = d?.counters?.api || d?.counters?.estimation;
    if (api?.subscriberCount > 0) {
      liveStats.subs = api.subscriberCount;
      liveStats.views = api.viewCount;
      liveStats.vids = api.videoCount;
    }
  } catch (e) { /* keep fallbacks */ }

  // most-viewed video: views + likes
  try {
    const v = await fetchJson(`https://returnyoutubedislikeapi.com/votes?videoId=${MOST_VIEWED.id}`, 6000);
    if (v?.viewCount) liveStats.mvViews = Math.max(v.viewCount, MOST_VIEWED.fallbackViews);
    if (v?.likes) liveStats.mvLikes = Math.max(v.likes, MOST_VIEWED.fallbackLikes);
  } catch (e) { /* keep fallbacks */ }

  // refresh the counters that are already on screen (smoothly — never snap)
  if (Object.keys(liveStats).length) {
    const map = { subs: "#num-subs", views: "#num-views", vids: "#num-vids", mvViews: "#mvViewsNum", mvLikes: "#mvLikesNum" };
    for (const [k, sel] of Object.entries(map)) {
      const el = $(sel);
      if (el && liveStats[k]) {
        el.dataset.count = liveStats[k];
        if (el._started) animateCount(el, liveStats[k]); // visible: glide to the live value
      }
    }
  }
}
fetchLiveStats();

/* ---------- theme ---------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  $('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#0f0f17" : "#f1efe6");
}
$("#themeBtn").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(); });
$("#langBtn").addEventListener("click", () => { lang = lang === "ja" ? "en" : "ja"; renderContent(); });

/* ---------- mobile nav menu ---------- */
const navEl = document.querySelector(".nav");
const menuBtn = $("#menuBtn");
function closeMenu() { navEl.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", () => {
  const open = navEl.classList.toggle("menu-open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
});
document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", closeMenu));
document.addEventListener("click", (e) => { if (navEl.classList.contains("menu-open") && !navEl.contains(e.target)) closeMenu(); });

/* ---------- scroll reveals ---------- */
let io;
function observeReveals() {
  if (io) io.disconnect();
  io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ---------- count-up numbers (cancel-safe, no layout jump) ---------- */
function animateCount(el, target) {
  target = Number(target) || 0;
  const plain = el.dataset.plain === "1", suffix = el.dataset.suffix || "";
  const fmt = v => (plain ? String(v) : v.toLocaleString()) + suffix;
  // reserve the final width up front so neighbours never shift while counting
  el.style.minWidth = fmt(target).length + "ch";
  const from = Number(String(el.textContent).replace(/[^0-9]/g, "")) || 0;
  if (el._raf) cancelAnimationFrame(el._raf);
  if (from === target) { el.textContent = fmt(target); return; }
  const t0 = performance.now(), dur = 1200;
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(from + (target - from) * eased));
    el._raf = p < 1 ? requestAnimationFrame(tick) : null;
  })(t0);
  el._started = true;
}

let cio;
function observeCounts() {
  if (cio) cio.disconnect();
  cio = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      animateCount(e.target, e.target.dataset.count);
    }
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));
}

/* ---------- scroll progress bar ---------- */
function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  $("#progress").style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

/* ---------- footer year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- boot ---------- */
// ?lang=ja&theme=dark for testing/deep links; ?nofx=1 disables motion (testing)
const qs = new URLSearchParams(location.search);
if (["en", "ja"].includes(qs.get("lang"))) lang = qs.get("lang");
if (["light", "dark"].includes(qs.get("theme"))) theme = qs.get("theme");
if (qs.get("nofx")) document.documentElement.classList.add("nofx");
applyTheme();
renderContent();
