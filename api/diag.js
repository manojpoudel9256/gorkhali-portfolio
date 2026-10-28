// TEMPORARY: what does YouTube return to Vercel for a watch page? (removed after diagnosis)
export default async function handler(req, res) {
  const r = await fetch("https://www.youtube.com/watch?v=YS0tl6RVFFI", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept-Language": "en" } });
  const t = await r.text();
  const i = t.indexOf('"videoDetails"');
  res.json({ status: r.status, url: r.url, len: t.length, videoDetailsAt: i, viewCount: (/"viewCount":"(\d+)"/.exec(t) || [])[1] || null, playability: (/"playabilityStatus":\{"status":"([A-Z_]+)"(?:,"reason":"([^"]*)")?/.exec(t) || []).slice(1), interaction: (/"interactionCount" content="(\d+)"/.exec(t) || [])[1] || null, videoViewCountRenderer: (/"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([^"]*)"/.exec(t) || [])[1] || null });
}
