# Gorkhali in Japan — website

The website of [Gorkhali in Japan](https://www.youtube.com/@gorkhaliinjapan), the YouTube channel of Manoj Poudel, a Nepali software engineer in Tokyo. It is *the honest blueprint for an IT career in Japan*: senmon gakko, shuukatsu, real projects and life in Japan.

**Live:** https://gorkhali-portfolio.vercel.app · **日本語:** https://gorkhali-portfolio.vercel.app/ja/

## What's inside

- Two pre-rendered pages, English (`/`) and 日本語 (`/ja/`), with hreflang, Open Graph and JSON-LD. Content is readable without JavaScript.
- The latest videos from the channel, read at build time without an API key (`lib/youtube.js`), with `data/channel.json` as a fallback. `/api/videos` keeps the list fresh between deploys (cached for 6 hours).
- Videos play in a privacy-enhanced YouTube embed only when clicked.
- A contact form via Formspree.
- A strict Content Security Policy and security headers (`vercel.json`), self-hosted fonts, and no third-party scripts.
- The design system is documented in [DESIGN.md](DESIGN.md).

## Edit

| What | Where |
|---|---|
| Words (EN + JA) | `scripts/content.js` |
| Styles | `public/css/site.css` |
| Behaviour | `public/js/site.js` |
| Page structure | `scripts/build.js` |

## Run

```sh
npm run build   # fetches the latest videos, writes dist/
npm test        # builds offline and checks the site's rules
```

Preview `dist/` with any static server. Vercel runs `npm run build` and serves `dist/` (see `vercel.json`).
