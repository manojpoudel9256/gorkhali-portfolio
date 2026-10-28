// Guards the new site's rules. Run: npm test (builds offline from data/channel.json first).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { parseVideosPage, parseAboutPage, seriesOf } from "../lib/youtube.js";
import { T } from "../scripts/content.js";

execFileSync(process.execPath, ["scripts/build.js"], { env: { ...process.env, OFFLINE: "1" }, stdio: "ignore" });
const en = fs.readFileSync("dist/index.html", "utf8");
const ja = fs.readFileSync("dist/ja/index.html", "utf8");

test("YouTube page parser: ids, titles (|| cleaned), lengths, channel numbers", () => {
  const html = `"608 subscribers" "21 videos" {"contentId":"abcdefghijk","x":{"lockupMetadataViewModel":{"title":{"content":"Salary in Japan || Real \u0026 honest"},"m":[{"content":"1.2K views"},{"content":"1 month ago"}]}},"text":"13:55"}`;
  const d = parseVideosPage(html, new Date("2026-10-28"));
  assert.equal(d.subscribers, "608");
  assert.equal(d.videoCount, 21);
  assert.deepEqual(d.videos[0], { id: "abcdefghijk", title: "Salary in Japan — Real & honest", length: "13:55", views: "1.2K", viewCount: 1200, ago: "1 month ago", month: "2026-09" });
  assert.equal(seriesOf("Japanese IT Job Hunting Reality | How I Got 内定"), "shuukatsu");
  assert.equal(seriesOf("My 2 Years IT College Journey in Japan"), "senmon");
  assert.equal(seriesOf("Otaru Vlog"), "life");
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

test("YouTube page parser: modern short view counts + accessibility labels", () => {
  const mk = (id, a, b, c) =>
    `{"contentId":"${id}","x":{"lockupMetadataViewModel":{"title":{"content":"T ${id}"},"metadata":{"contentMetadataViewModel":{"metadataRows":[{"metadataParts":[{"text":{"content":"${a}"},"accessibilityLabel":"${b}"},{"text":{"content":"${c}"},"accessibilityLabel":"x"}]}]}}}},"text":"1:02"}`;
  const html = [
    mk("aaaaaaaaaaa", "20K", "20 thousand views", "1mo ago"),
    mk("bbbbbbbbbbb", "8.2K", "8.2 thousand views", "2 years ago"),
    mk("ccccccccccc", "315", "379 views", "3 weeks ago"),
    mk("ddddddddddd", "1.2M", "1.2 million views", "5 days ago"),
  ].join(" ");
  const v = parseVideosPage(html, new Date("2026-10-28")).videos;
  assert.deepEqual(v.map((x) => x.views), ["20K", "8.2K", "315", "1.2M"]);
  assert.deepEqual(v.map((x) => x.viewCount), [20000, 8200, 379, 1200000]);
  assert.deepEqual(v.map((x) => x.ago), ["1mo ago", "2 years ago", "3 weeks ago", "5 days ago"]);
});

test("YouTube about parser: total views, joined date, subscribers", () => {
  const html = `{"aboutChannelViewModel":{"subscriberCountText":"608 subscribers","viewCountText":"40,821 views","joinedDateText":{"content":"Joined Jan 28, 2023"}}}`;
  assert.deepEqual(parseAboutPage(html), { totalViews: 40821, joined: "2023-01-28", subscribers: "608" });
  assert.deepEqual(parseAboutPage("<html></html>"), { totalViews: null, joined: null, subscribers: null });
});
