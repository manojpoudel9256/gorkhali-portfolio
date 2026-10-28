// Renders one full page (EN or JA) from channel data. Shared by the build (static fallback copy)
// and /api/page (the live page, re-rendered from fresh YouTube numbers and cached for a few minutes).
import { seriesOf } from "./youtube.js";
import { CHANNEL, T } from "../scripts/content.js";
import { LOGO_SPRITE, SPARK, logo } from "../scripts/logo.js";
import { aicon } from "../scripts/icons.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- small pieces ---------- */
const thumb = (id, size = "mqdefault") => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
const watch = (id) => `https://www.youtube.com/watch?v=${id}`;
// most titles are English; ones with kana/kanji are Japanese (screen readers switch voice)
const titleLang = (title) => (/[\u3040-\u30ff\u4e00-\u9fff]/.test(title) ? "ja" : "en");
const locale = (t) => (t.lang === "ja" ? "ja-JP" : "en-US");
const num = (n, t) => Number(n).toLocaleString(locale(t));
/** Views the way each language says them: 20K / 2万. */
function short(n, t) {
  if (n == null) return "";
  if (t.lang === "ja") return n >= 10000 ? `${+(n / 10000).toFixed(1)}万` : num(n, t);
  return n >= 1000 ? `${+(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);
}
/** Upload date as people read it: "Aug 31, 2026" / "2026年8月31日" (falls back to "1mo ago"). */
function when(v, t) {
  if (!v.published) return t.ago(v.ago || "");
  return new Date(v.published + "T00:00:00Z").toLocaleDateString(locale(t), { year: "numeric", month: t.lang === "ja" ? "long" : "short", day: "numeric", timeZone: "UTC" });
}
const seconds = (len) => (len || "0:0").split(":").reduce((a, x) => a * 60 + +x, 0);

function videoCard(v, t, { featured = false } = {}) {
  const s = seriesOf(v.title);
  return `<a class="vcard${featured ? " featured" : ""}" href="${watch(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}">
  <span class="frame"><img src="${thumb(v.id, featured ? "hqdefault" : "mqdefault")}" srcset="${thumb(v.id, "mqdefault")} 320w, ${thumb(v.id, "hqdefault")} 480w${featured ? `, ${thumb(v.id, "sddefault")} 640w` : ""}" sizes="${featured ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"}" width="${featured ? 480 : 320}" height="${featured ? 270 : 180}" alt="" loading="${featured ? "eager" : "lazy"}" decoding="async"${featured ? ' fetchpriority="high"' : ""}>
  <span class="dur mono" aria-hidden="true">${esc(v.length)}</span><span class="playbtn" aria-hidden="true"></span></span>
  <span class="vmeta"><span class="vseries mono">${esc(t.series[s])}${v.ago ? " · " + esc(t.ago(v.ago)) : ""}</span><span class="vtitle" lang="${titleLang(v.title)}">${esc(v.title)}</span></span>
</a>`;
}

const ICON = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
  ext: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
const SERIES = ["shuukatsu", "senmon", "life", "projects"];

/* ---------- numbers & charts ---------- */
function channelStats(data, t) {
  const vids = data.videos;
  const sumViews = vids.reduce((a, v) => a + (v.viewCount || 0), 0);
  const totalViews = data.totalViews || sumViews;
  const subsN = /^\d+$/.test(String(data.subscribers || "").replace(/,/g, "")) ? +String(data.subscribers).replace(/,/g, "") : null;
  const hours = vids.reduce((a, v) => a + seconds(v.length), 0) / 3600;
  const joined = data.joined ? new Date(data.joined + "T00:00:00Z") : null;
  const since = joined
    ? t.lang === "ja"
      ? `${joined.getUTCFullYear()}年${joined.getUTCMonth() + 1}月`
      : joined.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    : null;
  return { totalViews, sumViews, subsN, hours, since };
}

function statsBlock(data, t, st) {
  const count = data.videoCount || data.videos.length;
  const tiles = [
    ["eye", st.totalViews, 0],
    ["users", st.subsN ?? data.subscribers, 0],
    ["film", count, 0],
    ["clock", +st.hours.toFixed(1), 1],
  ];
  return `<ul class="stats">${tiles
    .map(
      ([ic, n, dec], i) => `<li class="stat"><span class="stat-ico">${aicon(ic)}</span>
      <span class="stat-n"${typeof n === "number" ? ` data-count="${n}" data-dec="${dec}"` : ""}>${typeof n === "number" ? (dec ? n.toFixed(dec) : num(n, t)) : esc(n)}</span>
      <span class="stat-k mono">${esc(t.numbers.stats[i])}</span></li>`,
    )
    .join("")}</ul>`;
}

function shareChart(data, t) {
  const by = Object.fromEntries(SERIES.map((k) => [k, 0]));
  for (const v of data.videos) by[seriesOf(v.title)] += v.viewCount || 0;
  const total = Object.values(by).reduce((a, b) => a + b, 0) || 1;
  const rows = SERIES.filter((k) => by[k] > 0).sort((a, b) => by[b] - by[a]);
  return `<figure class="chart chart-share">
    <figcaption><h3>${esc(t.numbers.seriesTitle)}</h3><p class="mono">${esc(t.numbers.seriesSub)}</p></figcaption>
    <div class="share" aria-hidden="true">${rows.map((k, i) => `<span class="seg s-${k} p${Math.round((by[k] / total) * 100)}${i === rows.length - 1 ? " last" : ""}" data-tip="${esc(t.series[k])}" data-tip-meta="${esc(num(by[k], t))} ${esc(t.numbers.views)} · ${Math.round((by[k] / total) * 100)}%"></span>`).join("")}</div>
    <ul class="share-legend">${rows
      .map((k) => `<li><span class="key s-${k}" aria-hidden="true"></span><span class="lg-name">${esc(t.series[k])}</span><span class="lg-v mono">${Math.round((by[k] / total) * 100)}%</span><span class="lg-n mono">${esc(num(by[k], t))}</span></li>`)
      .join("")}</ul>
  </figure>`;
}

function columnsChart(data, t) {
  const vids = [...data.videos].reverse(); // oldest → newest
  const max = Math.max(1, ...vids.map((v) => v.viewCount || 0));
  const mag = 10 ** Math.floor(Math.log10(max / 4));
  const step = [1, 2, 2.5, 5, 10, 20].map((m) => m * mag).find((s) => Math.ceil(max / s) <= 5);
  const lines = Math.max(1, Math.ceil(max / step));
  const top = step * lines;
  const leaders = [...vids].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 2).map((v) => v.id);
  const years = [];
  for (const v of vids) {
    const y = (v.month || "").slice(0, 4) || "—";
    if (years.length && years.at(-1)[0] === y) years.at(-1)[1]++;
    else years.push([y, 1]);
  }
  return `<figure class="chart chart-cols">
    <figcaption><h3>${esc(t.numbers.colsTitle)}</h3><p class="mono">${esc(t.numbers.colsSub)}</p></figcaption>
    <div class="cols-wrap" aria-hidden="true">
      <ol class="axis mono">${Array.from({ length: lines + 1 }, (_, k) => lines - k).map((i) => `<li>${esc(short(step * i, t))}</li>`).join("")}</ol>
      <div class="cols-area">
        <ol class="cols g${lines} n${vids.length}">${vids
          .map((v, i) => {
            const p = Math.max(1, Math.round(((v.viewCount || 0) / top) * 100));
            return `<li class="col s-${seriesOf(v.title)} p${p} d${Math.min(i, 24)}" data-tip="${esc(v.title)}" data-tip-meta="${esc(num(v.viewCount ?? 0, t))} ${esc(t.numbers.views)} · ${esc(when(v, t))}"><i></i>${leaders.includes(v.id) ? `<b class="col-v mono">${esc(num(v.viewCount ?? 0, t))}</b>` : ""}</li>`;
          })
          .join("")}</ol>
        <ol class="years mono n${vids.length}">${years.map(([y, n]) => `<li class="span${n}">${esc(y)}</li>`).join("")}</ol>
      </div>
    </div>
    <ul class="share-legend small">${SERIES.filter((k) => vids.some((v) => seriesOf(v.title) === k)).map((k) => `<li><span class="key s-${k}" aria-hidden="true"></span><span class="lg-name">${esc(t.series[k])}</span></li>`).join("")}</ul>
  </figure>`;
}

function dataTable(data, t) {
  return `<details class="table-view"><summary>${esc(t.numbers.tableToggle)}</summary>
    <div class="table-scroll"><table><thead><tr>${t.numbers.th.map((h, i) => `<th scope="col"${i === 3 ? ' class="num"' : ""}>${esc(h)}</th>`).join("")}</tr></thead><tbody>${data.videos
      .map((v) => `<tr><td lang="${titleLang(v.title)}">${esc(v.title)}</td><td>${esc(t.series[seriesOf(v.title)])}</td><td class="mono">${esc(when(v, t))}</td><td class="num mono">${v.viewCount != null ? num(v.viewCount, t) : "—"}</td></tr>`)
      .join("")}</tbody></table></div></details>`;
}

function mostWatched(data, t) {
  const top = [...data.videos].filter((v) => v.viewCount != null).sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  if (!top.length) return "";
  const [first, ...rest] = top;
  const s1 = seriesOf(first.title);
  return `<div class="mw">
    <a class="top-1" href="${watch(first.id)}" data-play="${esc(first.id)}" data-title="${esc(first.title)}">
      <span class="frame"><img src="${thumb(first.id, "hqdefault")}" srcset="${thumb(first.id, "hqdefault")} 480w, ${thumb(first.id, "sddefault")} 640w" sizes="(min-width: 960px) 620px, 100vw" width="480" height="270" alt="" loading="lazy" decoding="async"><span class="dur mono" aria-hidden="true">${esc(first.length)}</span><span class="playbtn" aria-hidden="true"></span></span>
      <span class="rank-stamp" aria-hidden="true"><span class="mono">${esc(t.top.no)}</span>1</span>
      <span class="top-meta"><span class="vseries mono">${esc(t.series[s1])}</span><span class="top-title" lang="${titleLang(first.title)}">${esc(first.title)}</span>
      <span class="top-views"><span class="big" data-count="${first.viewCount}" data-dec="0">${esc(num(first.viewCount, t))}</span> <span class="mono">${esc(t.numbers.views)}</span></span></span>
    </a>
    <ol class="lb" start="2">${rest
      .map((v, i) => `<li><a class="lb-row" href="${watch(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}">
        <span class="lb-rank mono" aria-hidden="true">0${i + 2}</span>
        <img src="${thumb(v.id)}" width="320" height="180" alt="" loading="lazy" decoding="async">
        <span class="lb-main"><span class="lb-title" lang="${titleLang(v.title)}">${esc(v.title)}</span>
          <span class="lb-bar" aria-hidden="true"><span class="s-${seriesOf(v.title)} p${Math.max(2, Math.round((v.viewCount / first.viewCount) * 100))}"></span></span></span>
        <span class="lb-v mono">${esc(num(v.viewCount, t))}<span class="vh"> ${esc(t.numbers.views)}</span></span></a></li>`)
      .join("")}</ol>
  </div>`;
}

const findVideo = (data, pattern) => data.videos.find((v) => new RegExp(pattern, "i").test(v.title));

/* ---------- the page ---------- */
const IDS = ["numbers", "videos", "roadmap", "guide", "about", "work"];

function page(t, data) {
  const other = t.lang === "en" ? T.ja : T.en;
  const st = channelStats(data, t);
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
      {
        "@type": "FAQPage",
        inLanguage: t.htmlLang,
        mainEntity: t.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
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
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/plex-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jetbrains-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://i.ytimg.com">
<link rel="stylesheet" href="/css/site.css">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>
<script src="/js/site.js" defer></script>
</head>
<body class="lang-${t.lang}">
${LOGO_SPRITE}
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="top" id="top">
  <a class="mark" href="${t.path}">${logo("mark-logo")}<span class="mark-name">Gorkhali in Japan</span></a>
  <nav class="nav" aria-label="${esc(t.navLabel)}">
    ${IDS.map((id, i) => `<a href="#${id}"><span class="mono">0${i + 1}</span> ${esc(t.nav[i])}</a>`).join("")}
  </nav>
  <div class="top-right">
    <div class="langs" role="group" aria-label="${esc(t.langLabel)}"><a href="/" ${t.lang === "en" ? 'aria-current="true"' : ""} hreflang="en" lang="en" data-lang="en">EN</a><a href="/ja/" ${t.lang === "ja" ? 'aria-current="true"' : ""} hreflang="ja" lang="ja" data-lang="ja">日本語</a></div>
    <a class="btn btn-red btn-sm" href="${CHANNEL.url}?sub_confirmation=1" rel="noopener" aria-label="${esc(t.subscribe)}">${ICON.play}<span>${esc(t.subscribe)}</span></a>
    <details class="menu"><summary aria-label="${esc(t.menu)}"><span></span><span></span></summary>
      <nav aria-label="${esc(t.menu)}">${IDS.map((id, i) => `<a href="#${id}"><span class="mono">0${i + 1}</span>${esc(t.nav[i])}</a>`).join("")}</nav>
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
    <ul class="facts mono">${t.facts(subs, count, num(st.totalViews, t)).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
  </div>
  <figure class="hero-fig">
    <picture><source type="image/webp" srcset="/img/manoj-640.webp 640w, /img/manoj-768.webp 768w" sizes="(min-width: 1024px) 560px, 92vw"><img src="/img/manoj-768.webp" width="768" height="1024" alt="${esc(t.photoAlt)}" fetchpriority="high"></picture>
    <svg class="dims" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="draw" d="M-4 0V100M-6 0H-2M-6 100H-2"/></svg>
    <span class="dim-label mono" aria-hidden="true">2022 → 2026</span>
    <ul class="callouts mono" aria-label="${esc(t.milestones)}">${t.callouts.map((c, i) => `<li class="c${i + 1}">${esc(c)}</li>`).join("")}</ul>
  </figure>
</section>

<section class="sec" id="numbers" aria-labelledby="numbers-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.numbers.kicker)}</p><h2 id="numbers-h">${esc(t.numbers.title)}</h2><p class="sec-note">${esc(t.numbers.note)}</p></div>
  ${statsBlock(data, t, st)}
  ${st.since ? `<p class="since mono">${logo("since-logo")}<span>${esc(t.numbers.since(st.since))}</span></p>` : ""}
  <div class="charts">${shareChart(data, t)}${columnsChart(data, t)}</div>
  ${dataTable(data, t)}
</section>

<section class="sec" id="videos" aria-labelledby="videos-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.videosKicker)}</p><h2 id="videos-h">${esc(t.videosTitle)}</h2><p class="sec-note">${esc(t.videosNote)}</p></div>
  <div class="videos">
    ${videoCard(latest, t, { featured: true })}
    <div class="vgrid" id="vgrid">${grid.map((v) => videoCard(v, t)).join("")}</div>
  </div>
  <a class="more" href="${CHANNEL.url}/videos" rel="noopener">${esc(t.allVideos(count))}${ICON.ext}</a>
</section>

<section class="sec" id="most-watched" aria-labelledby="top-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.top.kicker)}</p><h2 id="top-h">${esc(t.top.title)}</h2><p class="sec-note">${esc(t.top.note)}</p></div>
  ${mostWatched(data, t)}
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

<section class="sec" id="guide" aria-labelledby="guide-h">
  <div class="sec-head"><p class="kicker mono">${esc(t.guide.kicker)}</p><h2 id="guide-h">${esc(t.guide.title)}</h2><p class="sec-note">${esc(t.guide.note)}</p></div>
  <dl class="legend">${t.guide.items
    .map((g, i) => `<div class="term"><span class="term-ico">${aicon(g.icon)}<span class="term-n mono" aria-hidden="true">${String.fromCharCode(65 + i)}</span></span>
      <dt><span class="term-jp" lang="ja">${esc(g.jp)}</span><span class="term-ro mono">${esc(g.ro)}</span></dt><dd>${esc(g.text)}</dd></div>`)
    .join("")}</dl>
</section>

<section class="sec about" id="about" aria-labelledby="about-h">
  <div class="about-copy"><p class="kicker mono">${esc(t.aboutKicker)}</p><h2 id="about-h">${esc(t.aboutTitle)}</h2>${t.about.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p class="speaks"><span class="mono">${esc(t.speaks)}</span> ${esc(t.langs)}</p></div>
  <ol class="timeline">${t.timeline.map(([y, s]) => `<li><span class="year mono">${esc(y)}</span><span>${esc(s)}</span></li>`).join("")}</ol>
</section>

<section class="sec faq" id="faq" aria-labelledby="faq-h">
  <div class="sec-head faq-head"><p class="kicker mono">${esc(t.faq.kicker)}</p><h2 id="faq-h">${esc(t.faq.title)}</h2></div>
  <div class="faq-list">${t.faq.items
    .map((f, i) => {
      const v = findVideo(data, f.video);
      return `<div class="qa"><p class="qa-n mono" aria-hidden="true">Q${i + 1}</p><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>${v ? `<a class="qa-video" href="${watch(v.id)}" data-play="${esc(v.id)}" data-title="${esc(v.title)}"><img src="${thumb(v.id)}" width="320" height="180" alt="" loading="lazy" decoding="async"><span><span class="mono">${esc(t.faq.watch)} · ${esc(v.length)}</span><span class="qa-vt" lang="${titleLang(v.title)}">${esc(v.title)}</span></span></a>` : ""}</div>`;
    })
    .join("")}</div>
</section>

<section class="sec follow" id="follow" aria-labelledby="follow-h">
  <div class="follow-card">
    <div class="follow-copy">
      <p class="kicker mono">${esc(t.follow.kicker)}</p><h2 id="follow-h">${esc(t.follow.title)}</h2><p>${esc(t.follow.text)}</p>
      <a class="btn btn-red btn-bell" href="${CHANNEL.url}?sub_confirmation=1" rel="noopener">${aicon("bell")}<span>${esc(t.follow.cta)}</span></a>
    </div>
    <ul class="platforms">${CHANNEL.socials
      .map(([n, u]) => {
        const [handle, what] = t.follow.platforms[n] || [n, ""];
        return `<li><a href="${u}" rel="me noopener"><span class="pf-ico">${aicon(n)}</span><span class="pf-main"><span class="pf-name">${esc(n)}</span><span class="pf-what">${esc(what)}</span></span><span class="pf-handle mono">${esc(handle)}</span>${ICON.arrow}</a></li>`;
      })
      .join("")}</ul>
  </div>
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
  <div class="foot-brand">
    <div class="emblem" aria-hidden="true">
      <svg class="sparks" viewBox="0 0 200 200">${[[18, 40, 1], [182, 58, 0.8], [26, 150, 0.7], [176, 160, 1.1], [100, 8, 0.6], [150, 20, 0.5], [44, 192, 0.6]]
        .map(([x, y, s], i) => `<path class="spark k${i}" transform="translate(${x} ${y}) scale(${s})" d="${SPARK}"/>`)
        .join("")}</svg>
      <div class="emblem-tilt">${logo("emblem-logo")}</div>
    </div>
    <div class="foot-word">
      <p class="wordmark">Gorkhali <em>in</em> Japan</p>
      <p class="foot-tag">${esc(t.footTag)}</p>
      <p class="foot-since mono">${esc(t.footSince)}</p>
    </div>
  </div>
  <div class="foot-row">
    <ul class="socials">${CHANNEL.socials.map(([n, u]) => `<li><a href="${u}" rel="me noopener">${esc(n)}</a></li>`).join("")}</ul>
    <a class="build" href="${CHANNEL.github}" rel="me noopener">${esc(t.build)} → GitHub</a>
  </div>
  <div class="foot-row small"><span>${esc(t.footerLine)}</span><span>${esc(t.rights)}</span><a href="${other.path}" lang="${other.htmlLang}" hreflang="${other.htmlLang}">${other.lang === "ja" ? "日本語で見る" : "View in English"}</a></div>
</footer>

<div class="tip" role="presentation" hidden><b></b><span class="mono"></span></div>
<dialog class="player" id="player" aria-labelledby="player-title">
  <div class="player-bar"><span class="player-title" id="player-title"></span><a class="player-yt" href="#" rel="noopener">${esc(t.openYoutube)}${ICON.ext}</a><button class="player-close" type="button" aria-label="${esc(t.close)}">${ICON.close}</button></div>
  <div class="player-frame"></div>
</dialog>
<script type="application/json" id="i18n">${JSON.stringify({ series: t.series, locale: locale(t) }).replace(/</g, "\\u003c")}</script>
</body>
</html>
`;
}


/** Full HTML for "en" or "ja". */
export const renderPage = (lang, data) => page(T[lang] || T.en, data);
