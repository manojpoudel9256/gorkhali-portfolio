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
    const meta = [...seg.matchAll(/"content":"([^"]*?(?:views?|ago))"/g)].map((x) => x[1]);
    const around = html.slice(Math.max(0, at - 6000), at + 6000);
    const len = /"text":"(\d{1,2}:\d{2}(?::\d{2})?)"/.exec(around);
    const ago = meta.find((x) => /ago$/.test(x)) || "";
    videos.push({
      id,
      title: unescapeJson(title[1]).replace(/\s*\|\|\s*/g, " — ").replace(/\s{2,}/g, " ").trim(),
      length: len ? len[1] : "",
      views: (meta.find((x) => /views?$/.test(x)) || "").replace(/\s*views?$/, ""),
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

export async function fetchChannel(handle, { fetcher = fetch, timeoutMs = 8000 } = {}) {
  const res = await fetcher(`https://www.youtube.com/@${handle}/videos`, {
    headers: { "User-Agent": UA, "Accept-Language": "en" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error("YOUTUBE_" + res.status);
  const data = parseVideosPage(await res.text());
  if (!data.videos.length) throw new Error("YOUTUBE_EMPTY");
  return data;
}

/** Which series a video belongs to (by its title). */
export function seriesOf(title) {
  const t = title.toLowerCase();
  if (/job hunt|shuukatsu|interview|salary|payslip|working in japanese it|naitei|内定/.test(t)) return "shuukatsu";
  if (/college|course|senmon|teacher|school|sports day|hjla|journey in japan \(/.test(t)) return "senmon";
  if (/project|coding|build|portfolio|system design|app\b/.test(t)) return "projects";
  return "life";
}
