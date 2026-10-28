// Reads a channel's public /videos page (no API key) → latest videos + channel numbers.
// YouTube's RSS feed currently returns 404 for this channel, so we parse the page's data instead.
// Used at build time (to bake real HTML) and by /api/videos (to keep the list fresh between deploys).

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** Turn "1mo ago" / "3 years ago" into a rough ISO month, for sorting and display. */
function approxDate(ago, now = new Date()) {
  const m = /(\d+)\s*(second|minute|hour|day|week|wk|month|mo|year|yr|y)\w*/i.exec(ago || "");
  if (!m) return null;
  const n = +m[1],
    u = m[2].toLowerCase(),
    d = new Date(now);
  if (/^(y|yr|year)/.test(u)) d.setFullYear(d.getFullYear() - n);
  else if (/^(mo|month)/.test(u)) d.setMonth(d.getMonth() - n);
  else if (/^(w|wk|week)/.test(u)) d.setDate(d.getDate() - 7 * n);
  else if (/^day/.test(u)) d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 7);
}

function unescapeJson(s) {
  try {
    return JSON.parse('"' + s + '"');
  } catch {
    return s;
  }
}

const SCALE = { k: 1e3, thousand: 1e3, m: 1e6, million: 1e6, b: 1e9, billion: 1e9 };

/** "379 views" / "20 thousand views" (exact-ish) or short text "8.2K" → integer. */
function toCount(label, short) {
  const l = /^([\d,]+(?:\.\d+)?)\s*(thousand|million|billion)?\s*views?$/i.exec(label || "");
  if (l && !l[2]) return +l[1].replace(/,/g, "");
  const t = /^([\d,]*\.?\d+)\s*([KMB])?$/i.exec(short || "");
  if (t) return Math.round(+t[1].replace(/,/g, "") * (t[2] ? SCALE[t[2].toLowerCase()] : 1));
  if (l) return Math.round(+l[1].replace(/,/g, "") * SCALE[l[2].toLowerCase()]);
  return 0;
}

/** Parse the HTML of youtube.com/@handle/videos. Pure (testable). */
export function parseVideosPage(html, now = new Date()) {
  const ids = [];
  for (const m of html.matchAll(/"contentId":"([A-Za-z0-9_-]{11})"/g)) if (!ids.includes(m[1])) ids.push(m[1]);
  const videos = [];
  for (const id of ids) {
    const at = html.indexOf(`"contentId":"${id}"`);
    const seg = html.slice(at, at + 12000);
    const title = /"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/.exec(seg);
    if (!title) continue;
    const mp = seg.indexOf('"metadataParts":[');
    const parts = [
      ...(mp < 0 ? seg : seg.slice(mp, mp + 3000)).matchAll(/"content":"([^"]*)"\}?(?:,"accessibilityLabel":"([^"]*)")?/g),
    ].map((x) => ({ text: x[1], label: x[2] || "" }));
    const agoPart = parts.find((x) => /\bago$/i.test(x.text));
    const viewPart = parts.find((x) => /views?$/i.test(x.label) || /views?$/i.test(x.text) || /^\d[\d.,]*\s?[KMB]?$/i.test(x.text));
    const views = viewPart ? viewPart.text.replace(/\s*views?$/i, "") : "";
    const viewCount = viewPart ? toCount(viewPart.label, views) : 0;
    const around = html.slice(Math.max(0, at - 6000), at + 6000);
    const len = /"text":"(\d{1,2}:\d{2}(?::\d{2})?)"/.exec(around);
    const ago = agoPart ? agoPart.text : "";
    videos.push({
      id,
      title: unescapeJson(title[1]).replace(/\s*\|\|\s*/g, " — ").replace(/\s{2,}/g, " ").trim(),
      length: len ? len[1] : "",
      views,
      viewCount,
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

export async function fetchChannel(handle, { fetcher = fetch, timeoutMs = 8000 } = {}) {
  const get = (path) =>
    fetcher(`https://www.youtube.com/@${handle}/${path}`, {
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(timeoutMs),
    });
  const aboutP = get("about")
    .then((r) => (r.ok ? r.text() : null))
    .then((t) => (t ? parseAboutPage(t) : null))
    .catch(() => null);
  const res = await get("videos");
  if (!res.ok) throw new Error("YOUTUBE_" + res.status);
  const data = parseVideosPage(await res.text());
  if (!data.videos.length) throw new Error("YOUTUBE_EMPTY");
  const about = await aboutP;
  return { ...data, totalViews: about?.totalViews ?? null, joined: about?.joined ?? null };
}

/** Which series a video belongs to (by its title). */
export function seriesOf(title) {
  const t = title.toLowerCase();
  if (/job hunt|shuukatsu|interview|salary|payslip|working in japanese it|naitei|内定/.test(t)) return "shuukatsu";
  if (/college|course|senmon|teacher|school|sports day|hjla|journey in japan \(/.test(t)) return "senmon";
  if (/project|coding|build|portfolio|system design|app\b/.test(t)) return "projects";
  return "life";
}
