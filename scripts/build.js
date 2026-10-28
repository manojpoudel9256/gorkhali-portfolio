// Builds the static site into dist/: one fully rendered page per language (/ and /ja/),
// with the latest videos baked into the HTML (readable without JavaScript, crawlable).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchChannel, seriesOf } from "../lib/youtube.js";
import { CHANNEL, T } from "./content.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const dataFile = path.join(root, "data", "channel.json");

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- data: live from YouTube, or the last good copy ---------- */
async function loadChannel() {
  if (process.env.OFFLINE !== "1") {
    try {
      const live = await fetchChannel(CHANNEL.handle, { timeoutMs: 10000 });
      const data = { fetchedAt: new Date().toISOString(), ...live };
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + "\n");
      console.log(`channel: ${live.videos.length} videos, ${live.subscribers} subscribers (live)`);
      return data;
    } catch (e) {
      console.warn("channel: live fetch failed (" + e.message + "), using data/channel.json");
    }
  }
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

/* ---------- small pieces ---------- */
const thumb = (id, size = "mqdefault") => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
const watch = (id) => `https://www.youtube.com/watch?v=${id}`;

function videoCard(v, t, { featured = false } = {}) {
  const s = seriesOf(v.title);
  return `<a class="vcard${featured ? " featured" : ""}" href="${watch(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}">
  <span class="frame"><img src="${thumb(v.id, featured ? "hqdefault" : "mqdefault")}" srcset="${thumb(v.id, "mqdefault")} 320w, ${thumb(v.id, "hqdefault")} 480w${featured ? `, ${thumb(v.id, "sddefault")} 640w` : ""}" sizes="${featured ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"}" width="${featured ? 480 : 320}" height="${featured ? 270 : 180}" alt="" loading="${featured ? "eager" : "lazy"}" decoding="async"${featured ? ' fetchpriority="high"' : ""}>
  <span class="dur mono" aria-hidden="true">${esc(v.length)}</span><span class="playbtn" aria-hidden="true"></span></span>
  <span class="vmeta"><span class="vseries mono">${esc(t.series[s])}${v.ago ? " · " + esc(t.ago(v.ago)) : ""}</span><span class="vtitle" lang="${titleLang(v.title)}">${esc(v.title)}</span></span>
</a>`;
}

// most titles are English; ones with kana/kanji are Japanese (screen readers switch voice)
const titleLang = (title) => (/[぀-ヿ一-鿿]/.test(title) ? "ja" : "en");

const ICON = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
  ext: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

/* ---------- the page ---------- */
function page(t, data) {
  const other = t.lang === "en" ? T.ja : T.en;
  const subs = data.subscribers || "600+";
  const count = data.videoCount || data.videos.length;
  const latest = data.videos[0];
  const grid = data.videos.slice(1, 7);
  const bySeries = (key) => data.videos.filter((v) => seriesOf(v.title) === key).slice(0, 3);
  const url = CHANNEL.site + t.path;
  const person = {
    "@type": "Person",
    "@id": CHANNEL.site + "/#manoj",
    name: "Manoj Poudel",
    alternateName: "Gorkhali in Japan",
    jobTitle: "Software Engineer",
    url: CHANNEL.site + "/",
    image: CHANNEL.site + "/img/manoj-768.webp",
    homeLocation: { "@type": "Place", name: "Tokyo, Japan" },
    birthPlace: { "@type": "Place", name: "Nepal" },
    knowsLanguage: ["en", "ne", "ja", "hi"],
    sameAs: [...CHANNEL.socials.map((s) => s[1]), CHANNEL.github],
  };
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      person,
      { "@type": "WebSite", "@id": CHANNEL.site + "/#site", url: CHANNEL.site + "/", name: "Gorkhali in Japan", inLanguage: ["en", "ja"], publisher: { "@id": person["@id"] } },
      { "@type": "WebPage", url, name: t.title, description: t.description, inLanguage: t.htmlLang, isPartOf: { "@id": CHANNEL.site + "/#site" }, about: { "@id": person["@id"] } },
    ],
  };

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${CHANNEL.site}/">
<link rel="alternate" hreflang="ja" href="${CHANNEL.site}/ja/">
<link rel="alternate" hreflang="x-default" href="${CHANNEL.site}/">
<meta name="theme-color" content="#f6f3eb">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gorkhali in Japan">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${CHANNEL.site}/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.ogAlt)}">
<meta property="og:locale" content="${t.lang === "ja" ? "ja_JP" : "en_US"}">
<meta property="og:locale:alternate" content="${t.lang === "ja" ? "en_US" : "ja_JP"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@manojpoudel9256">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/plex-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jetbrains-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://i.ytimg.com">
<link rel="stylesheet" href="/css/site.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script src="/js/site.js" defer></script>
</head>
<body class="lang-${t.lang}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="top" id="top">
  <a class="mark" href="${t.path}"><span class="mark-box mono" aria-hidden="true">GiJ</span><span class="mark-name">Gorkhali in Japan</span></a>
  <nav class="nav" aria-label="${esc(t.navLabel)}">
    ${["videos", "roadmap", "about", "work"].map((id, i) => `<a href="#${id}"><span class="mono">0${i + 1}</span> ${esc(t.nav[i])}</a>`).join("")}
  </nav>
  <div class="top-right">
    <div class="langs" role="group" aria-label="${esc(t.langLabel)}"><a href="/" ${t.lang === "en" ? 'aria-current="true"' : ""} hreflang="en" lang="en" data-lang="en">EN</a><a href="/ja/" ${t.lang === "ja" ? 'aria-current="true"' : ""} hreflang="ja" lang="ja" data-lang="ja">日本語</a></div>
    <a class="btn btn-red btn-sm" href="${CHANNEL.url}?sub_confirmation=1" rel="noopener" aria-label="${esc(t.subscribe)}">${ICON.play}<span>${esc(t.subscribe)}</span></a>
    <details class="menu"><summary aria-label="${esc(t.menu)}"><span></span><span></span></summary>
      <nav aria-label="${esc(t.menu)}">${["videos", "roadmap", "about", "work"].map((id, i) => `<a href="#${id}"><span class="mono">0${i + 1}</span>${esc(t.nav[i])}</a>`).join("")}</nav>
    </details>
  </div>
</header>

<main id="main">
<section class="hero" aria-labelledby="h1">
  <div class="hero-copy">
    <p class="kicker mono">${esc(t.drawing(count))}</p>
    <h1 id="h1"><span>${t.h1[0]}</span> <span>${t.h1[1]}</span></h1>
    <p class="lede">${esc(t.lede)}</p>
    <div class="ctas">
      <a class="btn btn-ink" href="${watch(latest.id)}" data-play="${esc(latest.id)}" data-title="${esc(latest.title)}">${ICON.play}<span>${esc(t.watchLatest)}</span></a>
      <a class="btn btn-line" href="#roadmap"><span>${esc(t.seeRoadmap)}</span>${ICON.arrow}</a>
    </div>
    <ul class="facts mono">${t.facts(subs, count).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
  </div>
  <figure class="hero-fig">
    <picture><source type="image/webp" srcset="/img/manoj-640.webp 640w, /img/manoj-768.webp 768w" sizes="(min-width: 1024px) 560px, 92vw"><img src="/img/manoj-768.webp" width="768" height="1024" alt="${esc(t.photoAlt)}" fetchpriority="high"></picture>
    <svg class="dims" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="draw" d="M-4 0V100M-6 0H-2M-6 100H-2"/></svg>
    <span class="dim-label mono" aria-hidden="true">2022 → 2026</span>
    <ul class="callouts mono" aria-label="${esc(t.milestones)}">${t.callouts.map((c, i) => `<li class="c${i + 1}">${esc(c)}</li>`).join("")}</ul>
  </figure>
</section>

<section class="sec" id="videos" aria-labelledby="videos-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.videosKicker)}</p><h2 id="videos-h">${esc(t.videosTitle)}</h2><p class="sec-note">${esc(t.videosNote)}</p></div>
  <div class="videos">
    ${videoCard(latest, t, { featured: true })}
    <div class="vgrid" id="vgrid">${grid.map((v) => videoCard(v, t)).join("")}</div>
  </div>
  <a class="more" href="${CHANNEL.url}/videos" rel="noopener">${esc(t.allVideos(count))}${ICON.ext}</a>
</section>

<section class="sec" id="roadmap" aria-labelledby="road-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.roadKicker)}</p><h2 id="road-h">${esc(t.roadTitle)}</h2><p class="sec-note">${esc(t.roadIntro)}</p></div>
  <ol class="road">
    ${t.steps
      .map((s, i) => {
        const vids = bySeries(s.key);
        return `<li class="step"><p class="step-n mono">${esc(t.stepLabel(i + 1))}</p><h3>${esc(s.title)}</h3><p class="step-text">${esc(s.text)}</p>
      ${vids.length ? `<ul class="step-videos">${vids.map((v) => `<li><a href="${watch(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}"><span class="sv-title" lang="${titleLang(v.title)}">${esc(v.title)}</span><span class="mono" aria-hidden="true">${esc(v.length)}</span></a></li>`).join("")}</ul>` : `<p class="soon mono">${esc(s.soon || "")}</p>`}</li>`;
      })
      .join("")}
  </ol>
</section>

<section class="sec about" id="about" aria-labelledby="about-h">
  <div class="about-copy"><p class="kicker mono">${esc(t.aboutKicker)}</p><h2 id="about-h">${esc(t.aboutTitle)}</h2>${t.about.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p class="speaks"><span class="mono">${esc(t.speaks)}</span> ${esc(t.langs)}</p></div>
  <ol class="timeline">${t.timeline.map(([y, s]) => `<li><span class="year mono">${esc(y)}</span><span>${esc(s)}</span></li>`).join("")}</ol>
</section>

<section class="sec work" id="work" aria-labelledby="work-h">
  <div class="work-copy"><p class="kicker mono">${esc(t.workKicker)}</p><h2 id="work-h">${esc(t.workTitle)}</h2><p>${esc(t.workText)}</p>
    <ul class="formats">${t.workFormats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    <dl class="wfacts">${t.workFacts(subs, count).map(([v, k]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>
  <form class="contact" action="${CHANNEL.formspree}" method="POST" data-ok="${esc(t.form.ok)}" data-fail="${esc(t.form.fail)}" data-sending="${esc(t.form.sending)}">
    <h3>${esc(t.form.title)}</h3>
    <label><span>${esc(t.form.name)}</span><input name="name" autocomplete="name" required maxlength="100"></label>
    <label><span>${esc(t.form.email)}</span><input name="email" type="email" autocomplete="email" required maxlength="200"></label>
    <label><span>${esc(t.form.topic)}</span><select name="topic">${t.form.topics.map((o) => `<option>${esc(o)}</option>`).join("")}</select></label>
    <label><span>${esc(t.form.message)}</span><textarea name="message" rows="5" required maxlength="4000"></textarea></label>
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
    <input type="hidden" name="_language" value="${t.lang}">
    <button class="btn btn-red" type="submit">${esc(t.form.send)}${ICON.arrow}</button>
    <p class="form-status" role="status" aria-live="polite"></p>
    <p class="form-note">${esc(t.form.note)}</p>
  </form>
</section>
</main>

<footer class="foot">
  <p class="foot-mark mono" aria-hidden="true">GIJ-${count}</p>
  <div class="foot-row">
    <ul class="socials">${CHANNEL.socials.map(([n, u]) => `<li><a href="${u}" rel="me noopener">${esc(n)}</a></li>`).join("")}</ul>
    <a class="build" href="${CHANNEL.github}" rel="me noopener">${esc(t.build)} → GitHub</a>
  </div>
  <div class="foot-row small"><span>${esc(t.footerLine)}</span><span>${esc(t.rights)}</span><a href="${other.path}" lang="${other.htmlLang}" hreflang="${other.htmlLang}">${other.lang === "ja" ? "日本語で見る" : "View in English"}</a></div>
</footer>

<dialog class="player" id="player" aria-labelledby="player-title">
  <div class="player-bar"><span class="player-title" id="player-title"></span><a class="player-yt" href="#" rel="noopener">${esc(t.openYoutube)}${ICON.ext}</a><button class="player-close" type="button" aria-label="${esc(t.close)}">${ICON.close}</button></div>
  <div class="player-frame"></div>
</dialog>
<script type="application/json" id="i18n">${JSON.stringify({ series: t.series }).replace(/</g, "\u003c")}</script>
</body>
</html>
`;
}

/* ---------- write everything ---------- */
function copy(from, to) {
  fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true });
  fs.copyFileSync(path.join(root, from), path.join(out, to));
}

const data = await loadChannel();
// empty dist/ (not delete it: a running preview server may hold the folder open)
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) fs.rmSync(path.join(out, f), { recursive: true, force: true });
fs.mkdirSync(path.join(out, "ja"), { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), page(T.en, data));
fs.writeFileSync(path.join(out, "ja", "index.html"), page(T.ja, data));
for (const f of fs.readdirSync(path.join(root, "public"), { recursive: true }))
  if (fs.statSync(path.join(root, "public", f)).isFile()) copy(path.join("public", f), f);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${["/", "/ja/"]
    .map((p) => `<url><loc>${CHANNEL.site}${p}</loc><lastmod>${today}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${CHANNEL.site}/"/><xhtml:link rel="alternate" hreflang="ja" href="${CHANNEL.site}/ja/"/></url>`)
    .join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${CHANNEL.site}/sitemap.xml\n`);
console.log("built dist/ (en + ja)");
