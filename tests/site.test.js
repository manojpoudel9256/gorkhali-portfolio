// Guards the new site's rules. Run: npm test (builds offline from data/channel.json first).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { parseVideosPage, parseAboutPage, parseWatchStats, seriesOf } from "../lib/youtube.js";
import { T } from "../scripts/content.js";

execFileSync(process.execPath, ["scripts/build.js"], { env: { ...process.env, OFFLINE: "1" }, stdio: "ignore" });
const en = fs.readFileSync("dist/index.html", "utf8");
const ja = fs.readFileSync("dist/ja/index.html", "utf8");

// A /videos page shaped like YouTube's: each card is one lockupViewModel object.
const card = (id, title, views, label, ago, len) => ({
  richItemRenderer: { content: { lockupViewModel: {
    contentId: id,
    contentImage: { thumbnailViewModel: { overlays: [{ thumbnailBottomOverlayViewModel: { badges: [{ thumbnailBadgeViewModel: { text: len } }] } }] } },
    metadata: { lockupMetadataViewModel: { title: { content: title }, metadata: { contentMetadataViewModel: { metadataRows: [{ metadataParts: [{ text: { content: views }, accessibilityLabel: label }, { text: { content: ago } }] }] } } } },
  } } },
});
const videosPage = (cards) => `<html>"608 subscribers" "21 videos"<script>var ytInitialData = ${JSON.stringify({ contents: cards })};</script></html>`;

test("YouTube page parser: each video keeps its own title, length and views (no off-by-one)", () => {
  const html = videosPage([
    card("aaaaaaaaaaa", "How to Get an IT Job in Japan", "380", "380 views", "7d ago", "15:50"),
    card("bbbbbbbbbbb", "IT Engineer Salary in Japan || Real PaySlip", "20K", "20 thousand views", "1mo ago", "13:55"),
    card("ccccccccccc", "Snow festival", "1.2M", "1.2 million views", "3 years ago", "16:03"),
  ]);
  const d = parseVideosPage(html, new Date("2026-10-28"));
  assert.equal(d.subscribers, "608");
  assert.equal(d.videoCount, 21);
  assert.deepEqual(d.videos.map((v) => [v.id, v.title, v.length]), [
    ["aaaaaaaaaaa", "How to Get an IT Job in Japan", "15:50"],
    ["bbbbbbbbbbb", "IT Engineer Salary in Japan — Real PaySlip", "13:55"],
    ["ccccccccccc", "Snow festival", "16:03"],
  ]);
  assert.deepEqual(d.videos.map((v) => v.viewCount), [380, 20000, 1200000]);
  assert.deepEqual(d.videos.map((v) => v.month), ["2026-10", "2026-09", "2023-10"]);
  assert.equal(seriesOf("Japanese IT Job Hunting Reality | How I Got 内定"), "shuukatsu");
  assert.equal(seriesOf("My 2 Years IT College Journey in Japan"), "senmon");
  assert.equal(seriesOf("Otaru Vlog"), "life");
});

test("watch page parser: exact view count and publish date", () => {
  const html = `..."videoDetails":{"videoId":"YS0tl6RVFFI","title":"x","lengthSeconds":"835","viewCount":"20775","author":"y"}...{"publishDate":"2026-08-31T03:38:07-07:00"}`;
  assert.deepEqual(parseWatchStats(html, "YS0tl6RVFFI"), { viewCount: 20775, published: "2026-08-31" });
  assert.equal(parseWatchStats(html, "otherid0000"), null);
});

test("watch page parser: the 'confirm you're not a bot' page served to cloud servers", () => {
  const html = `{"playabilityStatus":{"status":"LOGIN_REQUIRED"},"videoDetails":{"videoId":"YS0tl6RVFFI","title":"x"}}...{"videoViewCountRenderer":{"viewCount":{"simpleText":"20,775 views"}}}...{"dateText":{"simpleText":"Aug 31, 2026"}}`;
  assert.deepEqual(parseWatchStats(html, "YS0tl6RVFFI"), { viewCount: 20775, published: "2026-08-31" });
});

test("English and Japanese content have the same shape", () => {
  const shape = (o) => Object.keys(o).sort().map((k) => k + ":" + (Array.isArray(o[k]) ? o[k].length : typeof o[k]));
  assert.deepEqual(shape(T.en), shape(T.ja));
  assert.deepEqual(Object.keys(T.en.series), Object.keys(T.ja.series));
  assert.deepEqual(shape(T.en.form), shape(T.ja.form));
});

test("both pages are real HTML in their language, linked to each other", () => {
  assert.match(en, /<html lang="en">/);
  assert.match(ja, /<html lang="ja">/);
  for (const p of [en, ja]) {
    assert.match(p, /hreflang="en" href="https:\/\/gorkhali-portfolio\.vercel\.app\/"/);
    assert.match(p, /hreflang="ja" href="https:\/\/gorkhali-portfolio\.vercel\.app\/ja\/"/);
    assert.match(p, /<h1 id="h1">/);
    assert.match(p, /og:image/);
    assert.equal((p.match(/<h1\b/g) || []).length, 1, "one h1");
  }
  assert.match(ja, /設計図/);
});

test("videos are baked into the HTML (works without JavaScript)", () => {
  const ids = [...en.matchAll(/data-play="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 7);
  assert.ok(ids.every((id) => /^[A-Za-z0-9_-]{11}$/.test(id)));
  assert.match(en, /href="https:\/\/www\.youtube\.com\/watch\?v=/);
});

test("security policy friendly: no inline scripts, no third-party scripts, no inline handlers", () => {
  for (const p of [en, ja]) {
    const scripts = [...p.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    for (const [, attrs, body] of scripts) {
      if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
      assert.match(attrs, /src="\/js\//, "only our own script files");
      assert.equal(body.trim(), "", "no inline JavaScript");
    }
    assert.doesNotMatch(p, /\son[a-z]+="/i, "no inline event handlers");
    assert.doesNotMatch(p, /fonts\.googleapis|socialcounts|returnyoutubedislike/);
  }
  const csp = JSON.parse(fs.readFileSync("vercel.json", "utf8")).headers[0].headers.find((h) => h.key === "Content-Security-Policy").value;
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /frame-src https:\/\/www\.youtube-nocookie\.com/);
});

test("every image has its size set (no layout shift) and an alt attribute", () => {
  for (const p of [en, ja]) for (const [img] of p.matchAll(/<img\b[^>]*>/g)) {
    assert.match(img, /width="\d+"/, img);
    assert.match(img, /height="\d+"/, img);
    assert.match(img, /\balt="/, img);
  }
});

test("YouTube about parser: total views, joined date, subscribers", () => {
  const html = `{"aboutChannelViewModel":{"subscriberCountText":"608 subscribers","viewCountText":"40,821 views","joinedDateText":{"content":"Joined Jan 28, 2023"}}}`;
  assert.deepEqual(parseAboutPage(html), { totalViews: 40821, joined: "2023-01-28", subscribers: "608" });
  assert.deepEqual(parseAboutPage("<html></html>"), { totalViews: null, joined: null, subscribers: null });
});

test("pages show exact view counts and each thumbnail belongs to its own video", () => {
  const data = JSON.parse(fs.readFileSync("data/channel.json", "utf8"));
  const ids = new Set(data.videos.map((v) => v.id));
  for (const [, id, title] of en.matchAll(/data-play="([^"]+)" data-title="([^"]+)"/g)) {
    assert.ok(ids.has(id), id);
    const v = data.videos.find((x) => x.id === id);
    assert.equal(title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), v.title, "title matches its id");
  }
  const top = [...data.videos].sort((a, b) => b.viewCount - a.viewCount)[0];
  assert.match(en, new RegExp(`class="big" data-count="${top.viewCount}"`));
});

test("live pages: / and /ja/ are rendered by /api/page with a short CDN cache", () => {
  const v = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  assert.deepEqual(v.rewrites.map((r) => r.source), ["/", "/ja", "/ja/"]);
  assert.match(fs.readFileSync("api/page.js", "utf8"), /s-maxage=300, stale-while-revalidate/);
});
