# PaddleResults by PaddleStats

A single-screen, multilingual app landing page for **paddleresults.com**. Original PaddleStats / Plakaciarz artwork, six fully rendered language pages, real store links and an honest search handoff to PaddleStats.

## Local preview

Node 22+; no package installation or runtime dependencies required.

```sh
npm test
npm run build
npm run dev
```

Open http://localhost:4174/pl/ (English at `/`; also `/de/`, `/hu/`, `/es/`, `/pt-BR/`). The page uses `min-height: 100svh`: it fills a normal screen but may scroll on short screens, at increased text size, or with the keyboard open. Content is never cropped to force an exact height.

## Hosting on GitHub Pages

The included workflow builds and deploys the static `dist/` directory. Configure the repository Pages source as **GitHub Actions**. Initial preview: `https://adampachowicz.github.io/paddleresults-landing/`.

All asset paths, language navigation, canonical and sitemap URLs follow `SITE_URL`, so the project works under a GitHub Pages repository prefix and at a custom-domain root. Do not manually edit built HTML.

Previews are deliberately **noindex**, including every language. Before launch:

1. Verify ownership of `paddleresults.com` in GitHub Pages domain settings. Do not point an unclaimed domain to a repository.
2. Configure Pages custom domain and DNS according to GitHub's current instructions; verify apex and www, HTTPS and certificate issuance.
3. Set repository Actions variable `SITE_URL=https://paddleresults.com/`.
4. After HTTPS, store destinations, language pages and metadata have passed production checks, set Actions variable `INDEXABLE=true` and rebuild.
5. Submit `https://paddleresults.com/sitemap.xml` in its own verified Search Console property. This landing has its own six localized pages; it does not replace the PaddleStats sitemap.

No DNS configuration or API credentials are stored here. GitHub-hosted previews are not evidence that the custom domain is live.

## Campaign attribution

Both store links include:

- `utm_source=paddleresults.com`
- `utm_medium=referral`
- `utm_campaign=paddleresults_launch_v1`
- `utm_content=ios_hero_<locale>` or `android_hero_<locale>`

Apple also receives `pt=128893100`, `ct=paddleresults_v1_<locale>`, and `mt=8`, following PaddleStats' existing provider configuration. Google Play gets the same campaign in its encoded `referrer` payload as well as listing UTM fields. The application IDs are copied from the current PaddleStats store configuration: iOS `6822209038`; Android `eu.paddlestats.app`.

**A tagged link is not a measured installation or click counter.** Verify campaigns in App Store Connect / Play Console, subject to their attribution windows and reporting thresholds. Install Referrer requires the receiving Android app/analytics to read it for app-level reporting. This landing installs no analytics SDK and creates no cookies. It does not claim campaign reports have been verified.

Search sends the entered query, selected scope, locale and a separate `utm_content=search_<locale>` to the existing `/results?q=...` or `/athletes?q=...` routes. Its hint explicitly states that searches continue on paddlestats.eu and coverage varies. There are no fabricated results, availability claims, or competitor affiliations.

## Content and assets

- `src/locales.mjs`: English, Polish, German, Hungarian, Spanish and Brazilian Portuguese, matching PaddleStats' current language registry.
- `src/links.mjs`: campaign and destination construction.
- `public/style.css`: responsive layout, Sora / Inter, keyboard focus and reduced motion.
- `scripts/build.mjs`: initial HTML, title/description, canonical/hreflang, OG/Twitter, visible-content-aligned JSON-LD, sitemap and robots.
- `docs/art-direction.md`: original artwork brief, provenance and actual dimensions.

Official localized App Store and Google Play badge artwork is reused from PaddleStats' existing badge assets. Original PaddleStats branding is retained. These assets and trademarks are not offered under an open-source license; public source hosting does not grant redistribution rights.

The launch poster is decorative artwork, not a particular race result. No invented athlete counts, medal totals or race times are used. The limited content of an app landing page does not guarantee rankings for broad result queries.
