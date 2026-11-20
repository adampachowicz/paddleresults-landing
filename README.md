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

Open http://localhost:4174/pl/ (English at `/`; also `/de/`, `/hu/`, `/es/`, `/pt-BR/`). All viewports use a `100dvh` page (with `100svh` fallback), with no document scroll. Desktop typography, phone and QR sizes follow available height; compact viewports omit secondary marketing content. Mobile shows the brand/language header, search trigger, a real localized phone screenshot beside vertically stacked store buttons, and the footer links. Search opens a native modal dialog; results scroll inside it. Escape, close button and backdrop dismiss it, and native dialog focus containment keeps keyboard navigation inside. The phone scales with both viewport width and available height.

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

**A tagged link is not a measured installation or click counter.** Verify campaigns in App Store Connect / Play Console, subject to their attribution windows and reporting thresholds. Install Referrer requires the receiving Android app/analytics to read it for app-level reporting. GA4 is optional and starts only after consent when GA_MEASUREMENT_ID is configured. Campaign reports have not yet been verified.

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

Language and brand navigation use same-origin paths, including the GitHub Pages project prefix. Canonical, hreflang and sitemap URLs stay absolute to SITE_URL. Local review does not navigate to the production domain when changing languages.

## Local result verification

For this review the localhost preview may be built with `SEARCH_API_URL=/__search`, a dedicated local search-only key and `LOCAL_SEARCH_DEMO=true`. The banner explicitly labels the five-record test directory. The dev server forwards only `q` and `scope` to the fixed loopback `SEARCH_PROXY_TARGET`; this proxy is not shipped as a GitHub Pages backend and refuses non-loopback targets. Production still requires the reviewed shared/API/admin deployment and its own restricted key.

Verified test queries: `fuksa`, `zwolinska` (Athletes), `marathon` (Competitions), plus an absent term. Responses travel through the real local Meilisearch → Laravel endpoint → localhost proxy. This is not a test against the production catalogue. Only “Powered by PaddleStats” remains in the footer, with an attributed link to the web app; no privacy/navigation footer links or “by PaddleStats” wordmark subtitle.


## Responsive search layout (2026-11-20)

Search styles live in `public/search.css`; the landing stylesheet does not override dialog geometry. At widths up to 700px or heights up to 500px the native dialog fills the visible viewport. Larger screens use a stable, bounded panel. Both layouts use the same flex chain: header → form controls → scrollable results → optional desktop footer. Results own vertical scrolling; filter rows scroll horizontally and never wrap into several rows. Typing hides examples and the introductory hint. A query with no matches retains its explicit empty message.

`visualViewport.height` and `offsetTop` update the dialog bounds even without a keyboard. Keyboard detection only hides secondary text; it does not select a different scroll/layout implementation. The input stays at 16px and zoom remains enabled. Native dialog Escape/focus containment and the close button remain available.

Research informing the layout:

- [Algolia: replicating documentation search](https://www.algolia.com/blog/ux/replicating-the-algolia-documentation-search-with-autocomplete): full-screen detached search at small widths.
- [Adobe React Spectrum: building a ComboBox](https://reactspectrum.blob.core.windows.net/reactspectrum/bca2e615f300d33dd79d112ff8850690d73b3c18/docs/blog/building-a-combobox.html): mobile tray, visible viewport sizing and scroll constraints.
- [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport): visible height and viewport offset are distinct from layout viewport dimensions.

Validation: frontend tests cover search contracts, all six locale builds, stylesheet asset existence, destinations and viewport calculations. Full visual acceptance remains pending: the computer-use session timed out and Safari access was unavailable. No real iPhone keyboard validation is claimed.

Manual acceptance checklist before marking the layout verified: 320/393/700px widths without a keyboard; 1440×900 desktop; short landscape viewport; real iOS Safari with keyboard shown/hidden, scrolling to the last hit, filter changes and close/reopen; desktop browser narrowed to 393px. Check long German labels, empty/loading/error states, one and six matches, keyboard focus visibility and 200% zoom.


## Google Analytics 4

Create a dedicated **Web data stream for https://paddleresults.com** in GA4 (Admin → Data streams → Web), then save its public `G-…` measurement ID as the GitHub repository Actions variable `GA_MEASUREMENT_ID`. A new Pages build is needed. No service-account key, API secret or OAuth grant is needed to collect client-side traffic. Measurement is disabled in noindex and local demo builds, and at localhost/127.0.0.1.

The six-language consent choice blocks the Google tag entirely until acceptance (basic consent behavior, no pre-consent Google requests). Advertising storage, ad user data, personalization and Google Signals remain disabled. Preference persists for 180 days and can be changed with the footer settings button; decline disables subsequent collection and removes this site's prefixed GA cookies. Blocked localStorage falls back to a per-page choice.

Measured after consent:

- `page_view`: visits/pages, sessions, device and region reports; URL parameters and full referrer paths are excluded from the configured page URL/referrer.
- `app_store_click`: destination `ios`/`android`, placement `hero`/`qr`/`search`, language. This is a store click, **not an installation**. Scanning the QR with an external camera is not a click on the desktop page.
- `paddlestats_click`: outbound navigation to the core website, with placement/language.
- `directory_search`: successful search response, scope, discipline and result_count. Raw search text, names and full destination URLs are not sent by custom events.

Add event-scoped custom dimensions for `placement`, `destination`, `language`, `search_scope`, `discipline` and a custom metric for `result_count` if needed in reports. Use one chosen store-click event as a key event. Disable enhanced automatic site-search/outbound-click measurement in the stream if duplicate or URL-bearing automatic events are unwanted.

Verification after deployment: decline → no gtag/collect requests; accept → Google tag loads and one page_view; search and store click → matching events in GA4 Realtime/DebugView; revoke → further events blocked. Standard reports can lag. Reporting covers consenting visitors whose browsers permit the tag; it is not a complete server visit counter. Data receipt in GA4 is pending until the actual measurement ID is provided, deployed and checked.
