// Builds the static site into dist/: assets, plus a fallback copy of both pages (/ and /ja/)
// rendered from the latest channel data. On Vercel the pages are served live by /api/page instead
// (fresh view counts, cached for 5 minutes), so the static copies are only written for local preview.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchChannel } from "../lib/youtube.js";
import { renderPage } from "../lib/render.js";
import { CHANNEL } from "./content.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const dataFile = path.join(root, "data", "channel.json");

/* ---------- data: live from YouTube, or the last good copy ---------- */
async function loadChannel() {
  if (process.env.OFFLINE !== "1") {
    try {
      const live = await fetchChannel(CHANNEL.handle, { timeoutMs: 15000, channelId: CHANNEL.id });
      const data = { fetchedAt: new Date().toISOString(), ...live };
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + "\n");
      console.log(`channel: ${live.videos.length} videos, ${live.subscribers} subscribers, ${live.totalViews} views (live)`);
      return data;
    } catch (e) {
      console.warn("channel: live fetch failed (" + e.message + "), using data/channel.json");
    }
  }
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
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
if (process.env.VERCEL !== "1") {
  fs.writeFileSync(path.join(out, "index.html"), renderPage("en", data));
  fs.writeFileSync(path.join(out, "ja", "index.html"), renderPage("ja", data));
}
for (const f of fs.readdirSync(path.join(root, "public"), { recursive: true }))
  if (fs.statSync(path.join(root, "public", f)).isFile()) copy(path.join("public", f), f);
fs.writeFileSync(
  path.join(out, "site.webmanifest"),
  JSON.stringify({
    name: "Gorkhali in Japan",
    short_name: "Gorkhali",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3eb",
    theme_color: "#c8102e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }),
);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${["/", "/ja/"]
    .map((p) => `<url><loc>${CHANNEL.site}${p}</loc><lastmod>${today}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${CHANNEL.site}/"/><xhtml:link rel="alternate" hreflang="ja" href="${CHANNEL.site}/ja/"/></url>`)
    .join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${CHANNEL.site}/sitemap.xml\n`);
console.log("built dist/ (en + ja)");
