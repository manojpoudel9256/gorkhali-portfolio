// The live pages: "/" and "/ja/" are rewritten here (vercel.json). Each request renders the page from
// fresh YouTube numbers; the CDN caches it for 5 minutes and keeps serving the previous copy while it
// re-renders in the background, so visitors always get an instant page with near-real-time views.
// If YouTube cannot be reached, the page is rendered from the last good copy (data/channel.json).
import fs from "node:fs";
import path from "node:path";
import { fetchChannel } from "../lib/youtube.js";
import { renderPage } from "../lib/render.js";
import { CHANNEL } from "../scripts/content.js";

const FRESH_MS = 5 * 60 * 1000;
let memo = null; // { at, data } — reused by warm function instances

function fallback() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "channel.json"), "utf8"));
}

async function channel() {
  if (memo && Date.now() - memo.at < FRESH_MS) return memo.data;
  try {
    const live = await Promise.race([
      fetchChannel(CHANNEL.handle, { timeoutMs: 7000, channelId: CHANNEL.id }),
      new Promise((_, no) => setTimeout(() => no(new Error("TIMEOUT")), 9000)),
    ]);
    memo = { at: Date.now(), data: live };
    return live;
  } catch {
    return memo?.data || fallback();
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method not allowed");
  }
  const lang = req.query.lang === "ja" ? "ja" : "en";
  const data = await channel();
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  res.setHeader("Content-Language", lang);
  return res.status(200).send(renderPage(lang, data));
}
