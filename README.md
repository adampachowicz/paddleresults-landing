# PaddleResults by PaddleStats

A responsive, multilingual app landing page for **paddleresults.com**. A coral PaddleResults mark derived from our Brand / Mark variants, actual localized app screenshots on desktop, six fully rendered language pages, store links and a live directory search integration. Mobile intentionally shows only the brand/language header, search and two store buttons in a viewport-height layout.

## Local preview

Node 22+. `qrcode` is a build-only development dependency; the published page has no framework runtime.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://localhost:4174/pl/ (English at `/`; also `/de/`, `/hu/`, `/es/`, `/pt-BR/`). Desktop can scroll on short screens. Mobile uses `100dvh` (with `100svh` fallback) and a scrollable results panel; the phone and marketing copy are hidden. Its picture source also avoids downloading a phone screenshot on mobile.

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

## Live directory API — activation required

The landing never ships a full-access API key. After the coordinated shared/API/admin PRs are deployed:

1. In admin → System → API Keys generate a new Free-tier key named `PaddleResults search` with role `search_only` / “Tylko wyszukiwanie — PaddleResults”. The role is a public client identifier; API restrictions must work even if someone copies it.
2. Configure API `FRONTEND_URLS` to include the exact landing origins used (preview `https://adampachowicz.github.io`; launch `https://paddleresults.com`; local `http://localhost:4174` only in development). Do not enable wildcard CORS. This setting does not replace authorization.
3. Set repository Actions variables `SEARCH_API_URL=https://api.paddlestats.eu/api/v1/discovery/search` (verify the actual API host in deployment), and `SEARCH_PUBLIC_KEY` to this **search-only** key. These values are deliberately public in HTML, not GitHub Secrets. No credential has been generated or installed by this source change.
4. Rebuild and verify real existing and absent names in all locales, response 403 for this key on `/athletes`, `/search`, `/results`, news/live and write routes; 429 on a burst; disable/revoke the key and check expiry of the 60-second authentication cache.

Typing triggers a 300ms debounced request with stale requests cancelled and an 8-second timeout. It returns up to six matching athletes or events, as real links. iOS opens the App Store; Android opens Google Play; desktop opens `/results?q=...` or `/athletes?q=...` on PaddleStats. iPad desktop-mode user agents are recognized. A match means a directory profile/competition is indexed; it does not promise complete results for every race. Desktop also shows separate, locally generated App Store and Google Play QR codes, with `ios_qr_<locale>` / `android_qr_<locale>` attribution. Search links use `*_search_<locale>`. No external QR service receives campaign URLs. Backend lookup uses a single main Meilisearch index without facet queries; published slalom and polo identities retain existing publication checks. No response cache or search-query logging is added. The role permits only GET `/api/v1/discovery/search`, with per-IP daily quota and burst throttling. Existing full/archive roles keep their behavior.

Without configuration the UI explicitly says the search is being connected. Service failure, no matches and throttling have separate messages. This is not a claim of verified production search or app installs. Tagged store attribution is unchanged.

## Content and assets

- `src/locales.mjs`: English, Polish, German, Hungarian, Spanish and Brazilian Portuguese, matching PaddleStats' current language registry.
- `src/links.mjs`: campaign and destination construction.
- `public/style.css`: responsive layout, Sora / Inter, keyboard focus and reduced motion.
- `scripts/build.mjs`: initial HTML, title/description, canonical/hreflang, OG/Twitter, visible-content-aligned JSON-LD, sitemap and robots.
- `docs/art-direction.md`: original artwork brief, provenance and actual dimensions.

Official localized App Store and Google Play badge artwork is reused from PaddleStats' existing badge assets. Original PaddleStats branding is retained. These assets and trademarks are not offered under an open-source license; public source hosting does not grant redistribution rights.

The launch poster is decorative artwork, not a particular race result. No invented athlete counts, medal totals or race times are used. The limited content of an app landing page does not guarantee rankings for broad result queries.

## Coordinated backend review

- Shared enum: https://github.com/adampachowicz/paddle-shared/pull/39
- API enforcement and endpoint: https://github.com/adampachowicz/paddle-api/pull/197
- Admin role controls: https://github.com/adampachowicz/paddledata/pull/380

Deploy the shared enum and API enforcement together before issuing/using a search-only key. An old API does not understand/enforce the new role. Before rolling the guard back, revoke the landing key; do not leave it active against an API without the restriction.
