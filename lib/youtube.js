// Reads a channel's public YouTube pages (no API key needed) → videos + channel numbers.
// The /videos page gives the list (id, title, length, rounded views); each video's watch page gives
// its exact view count and publish date; the /about page gives total views and the join date.
// If YOUTUBE_API_KEY is set, the official Data API is used for the exact numbers instead.
// Used at build time (fallback copy) and by /api/page (the live, cached pages).

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEADERS = { "User-Agent": UA, "Accept-Language": "en" };

/** Turn "1mo ago" / "3 years ago" into a rough ISO month (used only when the exact date is unknown). */
function approxDate(ago, now = new Date()) {
  const m = /(\d+)\s*(seconds?|minutes?|min|hours?|hr|h|days?|d|weeks?|wk|w|months?|mo|years?|yr|y)\b/i.exec(ago || "");
  if (!m) return null;
  const n = +m[1],
    u = m[2].toLowerCase(),
    d = new Date(now);
  if (/^(y|yr|year)/.test(u)) d.setFullYear(d.getFullYear() - n);
  else if (/^(mo|month)/.test(u)) d.setMonth(d.getMonth() - n);
  else if (/^(w|wk|week)/.test(u)) d.setDate(d.getDate() - 7 * n);
  else if (/^d/.test(u)) d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 7);
}

const SCALE = { k: 1e3, thousand: 1e3, m: 1e6, million: 1e6, b: 1e9, billion: 1e9 };

/** "379 views" (exact) / "20 thousand views" / short text "8.2K" → integer. */
function toCount(label, short) {
  const l = /^([\d,]+(?:\.\d+)?)\s*(thousand|million|billion)?\s*views?$/i.exec(label || "");
  if (l && !l[2]) return +l[1].replace(/,/g, "");
  const t = /^([\d,]*\.?\d+)\s*([KMB])?(?:\s*views?)?$/i.exec(short || "");
  if (t) return Math.round(+t[1].replace(/,/g, "") * (t[2] ? SCALE[t[2].toLowerCase()] : 1));
  if (l) return Math.round(+l[1].replace(/,/g, "") * SCALE[l[2].toLowerCase()]);
  return 0;
}

const cleanTitle = (s) => s.replace(/\s*\|\|\s*/g, " — ").replace(/\s{2,}/g, " ").trim();

/** Every object stored under `key`, anywhere in a JSON tree. */
function findAll(node, key, out = []) {
  if (Array.isArray(node)) for (const v of node) findAll(v, key, out);
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) {
      if (k === key) out.push(v);
      findAll(v, key, out);
    }
  return out;
}

/** The page's `ytInitialData` JSON, or null. */
export function initialData(html) {
  const at = html.indexOf("ytInitialData = ");
  if (at < 0) return null;
  const start = html.indexOf("{", at);
  const end = html.indexOf(";</script>", start);
  try {
    return JSON.parse(html.slice(start, end));
  } catch {
    return null;
  }
}

/**
 * Parse the HTML of youtube.com/@handle/videos. Pure (testable).
 * Reads each video card as a whole object, so id, title, thumbnail, length and views always belong together.
 */
export function parseVideosPage(html, now = new Date()) {
  const data = initialData(html);
  const videos = [];
  for (const l of data ? findAll(data, "lockupViewModel") : []) {
    const id = l.contentId;
    const md = l.metadata?.lockupMetadataViewModel;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || "") || !md?.title?.content || videos.some((v) => v.id === id)) continue;
    const parts = findAll(md.metadata, "metadataParts").flat().map((p) => ({ text: p.text?.content || "", label: p.accessibilityLabel || "" }));
    const agoPart = parts.find((p) => /\bago$/i.test(p.text));
    const viewPart = parts.find((p) => /views?$/i.test(p.label) || /views?$/i.test(p.text) || /^\d[\d.,]*\s?[KMB]?$/i.test(p.text));
    const badge = findAll(l.contentImage, "thumbnailBadgeViewModel").map((b) => b.text).find((x) => /^\d{1,2}(:\d{2}){1,2}$/.test(x || ""));
    const views = viewPart ? viewPart.text.replace(/\s*views?$/i, "") : "";
    const ago = agoPart ? agoPart.text : "";
    videos.push({
      id,
      title: cleanTitle(md.title.content),
      length: badge || "",
      views,
      viewCount: viewPart ? toCount(viewPart.label, views) : null,
      ago,
      month: approxDate(ago, now),
    });
  }
  const subs = /"(\d[\d.,]*[KkMm]?) subscribers"/.exec(html);
  const count = /"(\d[\d,]*) videos"/.exec(html);
  return {
    videos,
    subscribers: subs ? subs[1] : null,
    videoCount: count ? +count[1].replace(/,/g, "") : null,
  };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Parse the HTML of youtube.com/@handle/about. Pure (testable). */
export function parseAboutPage(html) {
  const v = /"viewCountText":"([\d,]+) views?"/.exec(html);
  const j = /"joinedDateText":\{"content":"Joined ([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})"/.exec(html);
  const s = /"subscriberCountText":"([^"]*?)\s*subscribers?"/.exec(html);
  const mi = j ? MONTHS.indexOf(j[1].toLowerCase()) : -1;
  return {
    totalViews: v ? +v[1].replace(/,/g, "") : null,
    joined: j && mi >= 0 ? `${j[3]}-${String(mi + 1).padStart(2, "0")}-${j[2].padStart(2, "0")}` : null,
    subscribers: s ? s[1] : null,
  };
}

/**
 * Exact numbers from a watch page fragment. Pure (testable).
 * Two shapes: the normal page has `videoDetails.viewCount`; the page YouTube serves to cloud servers
 * ("confirm you're not a bot") drops it but still has the visible counter "20,775 views" and the date.
 */
export function parseWatchStats(text, id) {
  const at = text.indexOf(`"videoDetails":{"videoId":"${id}"`);
  const own = at >= 0 || text.includes(`"videoId":"${id}"`);
  if (!own) return null;
  const v = (at >= 0 && /"viewCount":"(\d+)"/.exec(text.slice(at, at + 40000))) || /"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([\d,]+) views?"/.exec(text);
  let published = (/"(?:publishDate|uploadDate)":"(\d{4}-\d{2}-\d{2})/.exec(text) || [])[1] || null;
  if (!published) {
    const d = /"dateText":\{"simpleText":"(?:Premiered |Streamed live on )?([A-Z][a-z]{2}) (\d{1,2}), (\d{4})"/.exec(text);
    const mi = d ? MONTHS.indexOf(d[1].toLowerCase()) : -1;
    if (mi >= 0) published = `${d[3]}-${String(mi + 1).padStart(2, "0")}-${d[2].padStart(2, "0")}`;
  }
  return v ? { viewCount: +v[1].replace(/,/g, ""), published } : null;
}

/**
 * Exact view count + publish date of one video. Streams the watch page and stops reading as soon as
 * both are found (they sit about 820 KB in), so a refresh never downloads whole pages.
 */
async function watchStats(id, { fetcher, timeoutMs }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(`https://www.youtube.com/watch?v=${id}`, { headers: HEADERS, signal: ctrl.signal });
    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (value) text += dec.decode(value, { stream: true });
      const s = parseWatchStats(text, id);
      if (s?.published || (s && done)) return s;
      if (done || text.length > 2_500_000) return s;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    ctrl.abort();
  }
}

/** Run `fn` over items with at most `n` at a time. */
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k]);
    }
  }));
  return out;
}

/** Exact numbers through the official YouTube Data API v3 (when a key is configured). */
async function dataApiStats(channelId, ids, key, { fetcher, timeoutMs }) {
  const get = (url) => fetcher(url, { signal: AbortSignal.timeout(timeoutMs) }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("YT_API_" + r.status))));
  const [vids, chan] = await Promise.all([
    get(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids.slice(0, 50).join(",")}&key=${encodeURIComponent(key)}`),
    get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${encodeURIComponent(key)}`),
  ]);
  const byId = Object.fromEntries((vids.items || []).map((v) => [v.id, { viewCount: +v.statistics.viewCount, published: (v.snippet.publishedAt || "").slice(0, 10) || null }]));
  const st = chan.items?.[0]?.statistics || {};
  return { byId, totalViews: st.viewCount ? +st.viewCount : null };
}

/**
 * Everything the site shows about the channel.
 * `exact: true` (default) replaces YouTube's rounded "20K" with the real count and adds the publish date.
 */
export async function fetchChannel(handle, { fetcher = fetch, timeoutMs = 8000, exact = true, channelId = null, apiKey = process.env.YOUTUBE_API_KEY } = {}) {
  const get = (path) => fetcher(`https://www.youtube.com/@${handle}/${path}`, { headers: HEADERS, signal: AbortSignal.timeout(timeoutMs) });
  const aboutP = get("about")
    .then((r) => (r.ok ? r.text() : null))
    .then((t) => (t ? parseAboutPage(t) : null))
    .catch(() => null);
  const res = await get("videos");
  if (!res.ok) throw new Error("YOUTUBE_" + res.status);
  const data = parseVideosPage(await res.text());
  if (!data.videos.length) throw new Error("YOUTUBE_EMPTY");
  const about = await aboutP;
  let totalViews = about?.totalViews ?? null;

  if (exact) {
    let byId = null;
    if (apiKey && channelId) {
      try {
        const api = await dataApiStats(channelId, data.videos.map((v) => v.id), apiKey, { fetcher, timeoutMs });
        byId = api.byId;
        totalViews = api.totalViews ?? totalViews;
      } catch {
        byId = null; // fall back to the watch pages
      }
    }
    if (!byId) {
      const stats = await pool(data.videos, 7, (v) => watchStats(v.id, { fetcher, timeoutMs }));
      byId = Object.fromEntries(data.videos.map((v, i) => [v.id, stats[i]]));
    }
    for (const v of data.videos) {
      const s = byId[v.id];
      if (!s) continue;
      if (s.viewCount != null) v.viewCount = s.viewCount;
      if (s.published) {
        v.published = s.published;
        v.month = s.published.slice(0, 7);
      }
    }
  }
  return { ...data, totalViews, joined: about?.joined ?? null };
}

/** Which series a video belongs to (by its title). */
export function seriesOf(title) {
  const t = title.toLowerCase();
  if (/job hunt|shuukatsu|interview|salary|payslip|working in japanese it|naitei|内定|it job/.test(t)) return "shuukatsu";
  if (/college|course|senmon|teacher|school|sports day|hjla|journey in japan \(/.test(t)) return "senmon";
  if (/project|coding|build|portfolio|system design|app\b/.test(t)) return "projects";
  return "life";
}
