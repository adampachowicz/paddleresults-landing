import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { locales } from '../src/locales.mjs';
import { storeLinks, webLink, attribution } from '../src/links.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');
const site = new URL(process.env.SITE_URL || 'https://paddleresults.com/');
if (site.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
if (!site.pathname.endsWith('/')) site.pathname += '/';
const base = site.pathname;
const indexable = process.env.INDEXABLE === 'true';
const esc = s => String(s).replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[x]);
const pageUrl = code => new URL(code === 'en' ? './' : `${code}/`, site).href;
const asset = file => `${base}${file}`;
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
const wave = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 9c3 0 3-4 6-4s3 4 6 4 3-4 8-4M2 15c3 0 3-4 6-4s3 4 6 4 3-4 8-4M2 21c3 0 3-4 6-4s3 4 6 4 3-4 8-4"/></svg>';
const png = await readFile(join(root, 'public/assets/og-race-story.png'));
const ogWidth = png.readUInt32BE(16), ogHeight = png.readUInt32BE(20);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, 'public'), out, { recursive: true });
await writeFile(join(out, '.nojekyll'), '');

for (const [code, t] of Object.entries(locales)) {
  const stores = storeLinks(code);
  const canonical = pageUrl(code);
  const ogImage = new URL('assets/og-race-story.png', site).href;
  const localeLinks = Object.entries(locales).map(([lang, l]) => `<a href="${esc(pageUrl(lang))}" lang="${lang}" hreflang="${lang}"${lang === code ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('');
  const alternates = Object.keys(locales).map(lang => `<link rel="alternate" hreflang="${lang}" href="${esc(pageUrl(lang))}">`).join('\n');
  const tags = Object.entries(attribution(code, 'search')).map(([name, value]) => `<input type="hidden" name="${name}" value="${esc(value)}">`).join('');
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': 'https://paddlestats.eu/#organization', name: 'PaddleStats', url: 'https://paddlestats.eu/' },
      { '@type': 'WebSite', '@id': `${site.href}#website`, name: 'PaddleResults by PaddleStats', url: site.href, publisher: { '@id': 'https://paddlestats.eu/#organization' } },
      { '@type': 'WebPage', '@id': `${canonical}#page`, url: canonical, name: t.title, description: t.description, inLanguage: code, isPartOf: { '@id': `${site.href}#website` }, about: { '@id': 'https://paddlestats.eu/#app' } },
      { '@type': 'SoftwareApplication', '@id': 'https://paddlestats.eu/#app', name: 'PaddleStats', url: 'https://paddlestats.eu/', applicationCategory: 'SportsApplication', operatingSystem: 'iOS, Android', downloadUrl: [stores.apple, stores.google], publisher: { '@id': 'https://paddlestats.eu/#organization' } },
    ],
  };
  const html = `<!doctype html>
<html lang="${code}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title><meta name="description" content="${esc(t.description)}">
<meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
<meta name="theme-color" content="#F7FAFE"><meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; form-action https://paddlestats.eu; base-uri 'none'; object-src 'none'; upgrade-insecure-requests">
<link rel="canonical" href="${esc(canonical)}">${alternates}<link rel="alternate" hreflang="x-default" href="${esc(pageUrl('en'))}">
<meta property="og:type" content="website"><meta property="og:site_name" content="PaddleResults by PaddleStats"><meta property="og:locale" content="${t.ogLocale}">
${Object.values(locales).filter(l => l !== t).map(l => `<meta property="og:locale:alternate" content="${l.ogLocale}">`).join('')}
<meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.description)}"><meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}"><meta property="og:image:width" content="${ogWidth}"><meta property="og:image:height" content="${ogHeight}"><meta property="og:image:alt" content="${esc(t.artAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.title)}"><meta name="twitter:description" content="${esc(t.description)}"><meta name="twitter:image" content="${esc(ogImage)}"><meta name="twitter:image:alt" content="${esc(t.artAlt)}">
<meta name="apple-itunes-app" content="app-id=6822209038, affiliate-data=pt=128893100&amp;ct=paddleresults_v1_${code.replace('-', '')}">
<link rel="icon" type="image/svg+xml" href="${asset('assets/favicon.svg')}"><link rel="stylesheet" href="${asset('style.css')}">
<link rel="preload" as="font" href="${asset('assets/InterVariable.woff2')}" type="font/woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<script defer src="${asset('site.js')}"></script>
</head>
<body><a class="skip" href="#main">${esc(t.skip)}</a><div class="page">
<header class="header"><a class="identity" href="${esc(webLink(code, '/', 'brand_header'))}" aria-label="PaddleStats"><img src="${asset('assets/paddlestats.svg')}" alt="PaddleStats" width="155" height="27"><span class="divider" aria-hidden="true"></span><span class="domain">paddleresults.com</span></a><details class="language"><summary>${globe}<span>${esc(t.name)}</span><span aria-hidden="true">⌄</span></summary><nav aria-label="${esc(t.language)}">${localeLinks}</nav></details></header>
<main class="hero" id="main"><section class="copy" aria-labelledby="headline"><p class="eyebrow">${esc(t.eyebrow)}</p><h1 id="headline">${esc(t.first)}<span>${esc(t.second)}</span></h1><p class="lead">${esc(t.lead)}</p>
<div class="search-area"><form id="search-form" action="https://paddlestats.eu/results" method="get"><label class="search-label" for="search-query">${esc(t.searchLabel)}</label><div class="search-shell">${searchIcon}<input id="search-query" name="q" type="search" placeholder="${esc(t.placeholder)}" required maxlength="160" autocomplete="off" aria-describedby="search-hint"><button type="submit" aria-label="${esc(t.search)}">${arrow}</button></div><input type="hidden" name="lang" value="${code}">${tags}<div class="search-options"><label class="sr-only" for="search-scope">${esc(t.searchLabel)}</label><select id="search-scope"><option value="events">${esc(t.events)}</option><option value="athletes">${esc(t.athletes)}</option></select><div class="suggestions"><span>${esc(t.try)}:</span><button type="button" data-query="Poznań 2026" data-scope="events">Poznań 2026</button><button type="button" data-query="Klaudia Zwolińska" data-scope="athletes">Klaudia Zwolińska</button></div></div><p id="search-hint" class="search-hint">${esc(t.searchHint)}</p></form></div>
<div class="download"><p class="download-label">${esc(t.download)}</p><div class="stores"><a data-store="ios" href="${esc(stores.apple)}" aria-label="${esc(t.ios)}"><img class="apple" src="${asset(`assets/app-store/download-on-the-app-store-${code}.svg`)}" alt="${esc(t.ios)}" width="129" height="43"></a><a data-store="android" href="${esc(stores.google)}" aria-label="${esc(t.android)}"><img class="google" src="${asset(`assets/google-play/get-it-on-google-play-${code}.png`)}" alt="${esc(t.android)}" width="150" height="58"></a></div><p class="available">${esc(t.available)}</p></div>
<div class="disciplines" aria-label="PaddleStats">${t.disciplines.map(d => `<span>${esc(d)}</span>`).join('')}</div></section>
<figure class="art"><div class="poster"><img src="${asset('assets/race-story.webp')}" alt="${esc(t.artAlt)}" width="1122" height="1402" fetchpriority="high"></div><span class="index" aria-hidden="true">${wave}</span><figcaption>${esc(t.artLabel)}</figcaption></figure>
</main><footer class="footer"><span>${esc(t.footer)}</span><div class="footer-links"><a href="${esc(webLink(code, '/', 'web_footer'))}">${esc(t.web)}<span class="arrow" aria-hidden="true">↗</span></a><a href="https://paddlestats.eu/privacy?lang=${code}">${esc(t.privacy)}</a></div></footer>
</div></body></html>`;
  const folder = code === 'en' ? out : join(out, code);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.keys(locales).map(code => `<url><loc>${pageUrl(code)}</loc>${Object.keys(locales).map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en')}"/></url>`).join('')}</urlset>`;
await writeFile(join(out, 'sitemap.xml'), sitemap);
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${indexable ? `Sitemap: ${new URL('sitemap.xml', site).href}\n` : '# Preview: HTML pages are noindex until launch.\n'}`);
await writeFile(join(out, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found | PaddleResults</title><h1>Page not found</h1><p><a href="'+esc(site.href)+'">PaddleResults by PaddleStats</a></p></html>');
console.log(`Built ${Object.keys(locales).length} fully rendered locales. Site: ${site.href}; indexable: ${indexable}; OG: ${ogWidth}×${ogHeight}`);
