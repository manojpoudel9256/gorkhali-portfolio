# Gorkhali in Japan — website redesign plan (v2)

## What the research found (27–28 Oct 2026)

**The channel** (@gorkhaliinjapan, 608 subscribers, 21 videos) describes itself as *"The Blueprint for Your IT Career in Japan"*. Manoj Poudel is a Nepali software engineer in Tokyo who came as a student, went through senmon gakko in Sapporo and job hunting (shuukatsu), and now works in Tokyo. It has four series:
- Senmon Gakko Reality
- Shuukatsu Playbook
- Real Projects
- Life in Japan

The audience is Nepali students dreaming of Japan, students in senmon gakko, and engineers aiming for a Tokyo offer.

**The current site** mixes a channel site, a CV and a developer portfolio, so the first screen doesn't say who it's for.
- **Structure:** 10 stacked sections, with generic patterns (emoji icons, 4-card and 3-card grids, a tech-logo marquee).
- **Languages:** EN/JA only, with no Nepali UI even though Nepali viewers are the core audience.
- **Crawlability:** all content is injected by JavaScript.
- **Sharing and data:** no OG image, JSON-LD or sitemap; stats come from unofficial APIs; 2 unused images.

**What the best creator sites do** (Abroad in Japan, Kurzgesagt, Life Where I'm From…):
- Lead with **one** clear thing.
- Present videos as fast thumbnails that link or open, never a wall of embeds.
- Use one distinct visual identity.
- Keep a single plain "Work with me" page.

## Decisions (Manoj, 28 Oct 2026)

- **Design:** B · The Blueprint.
- **Developer portfolio:** a footer link to GitHub only.
- **Languages:** English + 日本語 (no Nepali UI).

## The new site

**Purpose:** "The honest roadmap to an IT career in Japan, from a Nepali who did it." Videos come first, the person second, and the developer portfolio becomes a single link.

**Structure (one page plus anchors, fully pre-rendered HTML):**
1. **Header:** wordmark, Videos · Roadmap · About · Work with me, an EN | 日本語 switch, and Subscribe.
2. **Hero:** the promise, plus the latest video (a click-to-play facade).
3. **Roadmap:** the 4 series as the journey (Senmon gakko → Shuukatsu → Real projects → Life in Japan), each opening its best videos. "Start here" for newcomers.
4. **Latest videos:** auto-updated from YouTube (a Vercel function with caching and a committed fallback list). Thumbnails, durations and dates; play in a lightbox (youtube-nocookie) or open on YouTube.
5. **About:** short story, real photo, a compact timeline (2022 Sapporo → 2026 Tokyo offer).
6. **Work with me:** collaborations and sponsorships, real channel facts, and a contact form (keep Formspree).
7. **Footer:** socials (YouTube, Instagram, TikTok, X, Facebook, GitHub), languages, "I also build things" → GitHub.

**Removed:**
- the skills logo marquee;
- the "Four honest lanes" and "Who this is for" card grids;
- fake "LIVE" stats;
- unused images.

## Foundations (new rules)

| Area | Rule |
|---|---|
| Design | One chosen direction (A, B or C below), documented in DESIGN.md with tokens, type, spacing, motion and an anti-slop checklist. |
| Type | Self-hosted OFL fonts. Devanagari and Japanese rendered properly. No Google Fonts request. |
| Languages | EN at `/` and 日本語 at `/ja/`, each pre-rendered with `lang` and hreflang (no JavaScript needed to read them). |
| Video | Facade embeds only (no iframe until play), privacy-enhanced domain, no autoplay, no layout shift. |
| SEO and sharing | Real HTML content, OG image (generated in the chosen style), Twitter card, JSON-LD (Person + VideoObject), sitemap, robots, canonical. |
| Speed | Images as AVIF/WebP at proper sizes. Targets: LCP < 2 s on 4G, CLS 0, Lighthouse ≥ 95 on all four categories. |
| Accessibility | WCAG 2.2 AA: contrast, focus, keyboard, 44px targets, reduced motion. |
| Security | CSP, HSTS, frame-ancestors and Referrer-Policy via vercel.json. No unofficial stats APIs. |
| Motion | One signature moment, plus small arrivals; nothing moves while scrolling. Respects reduced motion. |
| Tests | Playwright checks at 320/390/768/1024/1440/1920 in 3 languages; link check; Lighthouse run. |

## Team (as requested)

- **Opus:** design system, page build, motion, the videos function, final review.
- **Sonnet:** research, translations draft, screenshot and responsive verification, Lighthouse and accessibility audits, link checks.

## Phases

1. **You pick a direction** (mockups in Documents).
2. **Design system and DESIGN.md:** tokens, type, components.
3. **Build:** HTML structure in 3 languages, styles, video function and fallback.
4. **Motion, OG image, SEO and security headers.**
5. **Verify:** agents audit every screen size and language. Fix, then Lighthouse.
6. **Preview branch:** you check on your phone, then merge to `main` (Vercel).
