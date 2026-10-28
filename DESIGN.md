# Design system — "The Blueprint"

The channel promises *"The Blueprint for Your IT Career in Japan"*, so the site is drawn like an engineer's technical drawing of that journey. Chosen by Manoj from three researched directions on 2026-10-28. Tokens live in `public/css/site.css` (`:root`).

## Principles

1. **One promise, one action.** The first screen says what the channel is for. The single primary action is red (crimson): *Watch the latest*, *Subscribe*, *Send*.
2. **Drawn, not decorated.** Graph paper, ink borders, dimension lines and lettered callouts carry the identity. There are no gradients, glows, glass or emoji.
3. **Videos are the content.** Thumbnails and titles come straight from YouTube. A video plays only when clicked, through a privacy-enhanced embed.
4. **Honest numbers.** Subscriber and video counts are read from the channel at build time, never invented or "live" from unofficial APIs.
5. **Readable without JavaScript.** Both pages are full HTML. JavaScript only adds the player, reveals, form sending and fresh videos.

## Colour

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f6f3eb` | page and surfaces |
| grid | blue at 7.5% / 14% | 16px and 80px graph-paper lines |
| `--ink` | `#151514` | text, borders, the dark button |
| `--ink-2` / `--ink-3` | `#3c3b37` / `#5d5b55` | body / secondary (≥ 4.5:1) |
| `--blue` | `#1f4a8c` | annotations: kickers, step numbers, timeline, dimension lines |
| `--crimson` | `#c8102e` | Nepal-flag red, the one action colour, callouts |
| `--hl` | `#ffe36b` | the single highlighter stroke in the headline |

## Type

- **Instrument Serif:** headlines, used large with tight tracking.
- **IBM Plex Sans:** text.
- **JetBrains Mono:** annotations (uppercase kickers, durations, labels).
- Japanese uses Hiragino/Yu Mincho for headings and Hiragino/Yu Gothic for text, with `palt` and 1.8 line height.
- All fonts are self-hosted (OFL, licences in `public/fonts/`); no Google Fonts.

## Shapes

Square corners and 1.5px ink borders. The dark button has an offset crimson shadow, like a print registration mark. Tap targets are at least 44px.

## Motion

| Element | Behaviour |
|---|---|
| Hero (on arrival) | Lines rise in a 640ms cascade. The highlighter sweeps across "blueprint". The dimension line draws itself. Callouts A, B and C stamp in one after another. |
| Sections | Rise once when they first come into view. |
| Thumbnails | Scale 3% on hover. |
| While scrolling | Nothing moves. |
| Reduced motion | `prefers-reduced-motion: reduce` turns all motion off. |

## Content model

- All words live in `scripts/content.js` (EN and JA; the tests check both have the same shape).
- Videos come from `lib/youtube.js` at build time, with `data/channel.json` as the last good copy. `/api/videos` refreshes the grid between deploys.

## Anti-slop checklist

- [ ] No purple/blue gradients, glows, glassmorphism or emoji icons.
- [ ] One red action per view; blue is for annotations only.
- [ ] No invented testimonials, logos or numbers.
- [ ] No tech-logo marquees or 3-equal-card "feature" rows.
- [ ] Real photos and real video thumbnails only.
