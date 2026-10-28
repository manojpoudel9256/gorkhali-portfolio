// Channel numbers and latest videos as JSON (exact view counts). Cached at the edge for 5 minutes.
import { fetchChannel, seriesOf } from "../lib/youtube.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
  try {
    const d = await fetchChannel("gorkhaliinjapan", { timeoutMs: 7000, channelId: "UCBKB2A3BcpOb8YQAHgBEHcw" });
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return res.status(200).json({
      subscribers: d.subscribers,
      videoCount: d.videoCount,
      totalViews: d.totalViews,
      joined: d.joined,
      videos: d.videos.map((v) => ({ id: v.id, title: v.title, length: v.length, viewCount: v.viewCount, published: v.published || null, series: seriesOf(v.title) })),
    });
  } catch {
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(502).json({ error: "UNAVAILABLE" });
  }
}
