# Current revision — coral brand and real app screens

19 November 2026, revised at the user’s request. The previous blue illustrated hero is superseded. The actual `/brand` Mark variants SVG path is retained, recolored coral (#ff4438 / #c62d27) and paired with a code-rendered PaddleResults wordmark and explicit “by PaddleStats”. Palette inspiration: https://results.quko.es/competitions (warm #f5f3ef surface, near-black, coral); no competitor logo or art is used.

Desktop: CSS phone frame with the existing real `outputs/app-store/main-product-page/v4-ten-slot/<locale>/raw/sprint.png` screenshot, 1206×2622, for all six languages. No AI-generated app interface or invented screenshot. Mobile: no phone, illustration, promotional copy, footer or QR; viewport-height directory search and two store buttons, with brand/language header. QR codes are deterministic SVGs generated locally from actual tagged store destinations.

Current OG source is `public/assets/og-app.svg`, a native SVG composition with our mark and actual EN screenshot. Its raster export `public/assets/og-app.png` is **1200×630**, rendered with librsvg (`rsvg-convert`). It is not an ImageGen edit. The older ImageGen prompts below document the superseded illustration only.

---

# The race ends. The story stays.

PaddleResults app launch, 19 November 2026. Built-in ImageGen with the PaddleStats Plakaciarz art direction; the viewed canoe-polo reference established a family of light backgrounds, ink typography and geometric sport illustration. No competitor artwork or visual identity is used.

The chosen metaphor is a race wake becoming a lasting archive. Three single racing kayaks with double-bladed paddles cut diagonally across blue water; their tracks fan into flowing lines. No invented times or rankings. Multidiscipline neutral ink with cobalt blue and a small cyan accent, per the approved Plakaciarz palette.

The hero illustration is text-free; all campaign text, original logo, captions, accessible text and store badges are rendered separately. This permits complete localization without mixing languages inside a bitmap.

- Original hero PNG: 1122 × 1402, `public/assets/race-story.png`.
- Identical-composition WebP delivery encoding: `public/assets/race-story.webp`, roughly 152 KB.
- Dedicated, recomposed Open Graph PNG: **1734 × 907**; this is the actual export, not an asserted 1200 × 630. The language-neutral illustration has separately localized OG title, description and alternative text on all six pages.
- Sora variable font and Inter variable font are existing project assets; the original PaddleStats lockup and official localized store badges come from PaddleStats.

## Generation prompts

Hero: “Premium editorial sports poster illustration, no text, letters, logos or numbers. Portrait 4:5. Three long flat geometric single racing kayaks viewed from above cross rich cobalt water diagonally. Flowing wakes become an abstract orderly archive of tracks, not a literal chart. Recognizable double-bladed paddles, one seated paddler per boat. Off-white and ink boats, tiny cyan accent. Crisp geometric shapes, restrained paper grain. #F7FAFE, #071A33, #102DDE, #01BFCB. No 3D, medals, podiums, phone or UI. Central complete composition for responsive cropping; localized text supplied in HTML.”

Open Graph edit: “Recompose the same illustration for landscape approximately 1.91:1. Preserve three complete white/navy racing kayaks, blue water and flowing white/cyan wakes; generous calm space, narrow paper perimeter. No text or logo. A language-neutral sharing image with localized metadata supplied separately.”
