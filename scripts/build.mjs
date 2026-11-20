import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import QRCode from 'qrcode';
import { locales, searchMessages, disciplineKeys } from '../src/locales.mjs';
import { storeLinks, webLink, attribution } from '../src/links.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');
const site = new URL(process.env.SITE_URL || 'https://paddleresults.com/');
if (site.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
if (!site.pathname.endsWith('/')) site.pathname += '/';
const base = site.pathname;
const searchApi = process.env.SEARCH_API_URL || '';
const publicSearchKey = process.env.SEARCH_PUBLIC_KEY || '';
if (searchApi && searchApi !== '/__search' && !/^https:\/\//.test(searchApi)) throw new Error('SEARCH_API_URL must use HTTPS');
const searchOrigin = searchApi && searchApi !== '/__search' ? new URL(searchApi).origin : '';
const localSearchDemo = process.env.LOCAL_SEARCH_DEMO === 'true';
const indexable = process.env.INDEXABLE === 'true';
const esc = s => String(s).replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[x]);
const pageUrl = code => new URL(code === 'en' ? './' : `${code}/`, site).href;
const asset = file => `${base}${file}`;
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
const png = await readFile(join(root, 'public/assets/og-app.png'));
const ogWidth = png.readUInt32BE(16), ogHeight = png.readUInt32BE(20);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, 'public'), out, { recursive: true });
await cp(join(root, 'node_modules/flag-icons/flags/4x3'), join(out, 'assets/flags'), {recursive:true});
await cp(join(root, 'node_modules/flag-icons/LICENSE'), join(out, 'assets/flags/LICENSE'));
await cp(join(root, 'src/locales.mjs'), join(out, 'locales.mjs'));
await cp(join(root, 'src/links.mjs'), join(out, 'links.mjs'));
await mkdir(join(out, 'assets/qr'), { recursive: true });
await writeFile(join(out, '.nojekyll'), '');

for (const [code, t] of Object.entries(locales)) {
  const stores = storeLinks(code);
  const qrStores = storeLinks(code, 'qr');
  const qrOptions = { type:'svg', errorCorrectionLevel:'M', margin:4, width:180, color:{dark:'#181816',light:'#ffffff'} };
  await writeFile(join(out, `assets/qr/ios-${code}.svg`), await QRCode.toString(qrStores.apple, qrOptions));
  await writeFile(join(out, `assets/qr/android-${code}.svg`), await QRCode.toString(qrStores.google, qrOptions));
  const canonical = pageUrl(code);
  const ogImage = new URL('assets/og-app.png', site).href;
  const localeLinks = Object.entries(locales).map(([lang, l]) => `<a href="${asset(lang === 'en' ? '' : `${lang}/`)}" lang="${lang}" hreflang="${lang}"${lang === code ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('');
  const alternates = Object.keys(locales).map(lang => `<link rel="alternate" hreflang="${lang}" href="${esc(pageUrl(lang))}">`).join('\n');
  const tags = Object.entries(attribution(code, 'search')).map(([name, value]) => `<input type="hidden" name="${name}" value="${esc(value)}">`).join('');
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': 'https://paddlestats.eu/#organization', name: 'PaddleStats', url: 'https://paddlestats.eu/' },
      { '@type': 'WebSite', '@id': `${site.href}#website`, name: 'PaddleResults', url: site.href, publisher: { '@id': 'https://paddlestats.eu/#organization' } },
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
<meta name="theme-color" content="#f5f3ef"><meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' ${searchOrigin}; form-action https://paddlestats.eu; base-uri 'none'; object-src 'none'">
<link rel="canonical" href="${esc(canonical)}">${alternates}<link rel="alternate" hreflang="x-default" href="${esc(pageUrl('en'))}">
<meta property="og:type" content="website"><meta property="og:site_name" content="PaddleResults"><meta property="og:locale" content="${t.ogLocale}">
${Object.values(locales).filter(l => l !== t).map(l => `<meta property="og:locale:alternate" content="${l.ogLocale}">`).join('')}
<meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.description)}"><meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}"><meta property="og:image:width" content="${ogWidth}"><meta property="og:image:height" content="${ogHeight}"><meta property="og:image:alt" content="${esc(t.artAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.title)}"><meta name="twitter:description" content="${esc(t.description)}"><meta name="twitter:image" content="${esc(ogImage)}"><meta name="twitter:image:alt" content="${esc(t.artAlt)}">
<meta name="apple-itunes-app" content="app-id=6822209038, affiliate-data=pt=128893100&amp;ct=paddleresults_v1_${code.replace('-', '')}">
<link rel="icon" type="image/svg+xml" href="${asset('assets/favicon.svg')}"><link rel="stylesheet" href="${asset('style.css')}"><link rel="stylesheet" href="${asset('search.css')}">
<link rel="preload" as="font" href="${asset('assets/InterVariable.woff2')}" type="font/woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<script type="module" src="${asset('site.js')}"></script>
</head>
<body><a class="skip" href="#main">${esc(t.skip)}</a><div class="page">
<header class="header"><a class="identity" href="${asset(code === 'en' ? '' : `${code}/`)}" aria-label="PaddleResults"><img src="${asset('assets/paddleresults-mark.svg')}" alt="" width="34" height="40"><span>Paddle<strong>Results</strong></span></a><details class="language"><summary>${globe}<span>${esc(t.name)}</span><span aria-hidden="true">⌄</span></summary><nav aria-label="${esc(t.language)}">${localeLinks}</nav></details></header>
<main class="hero" id="main"><section class="copy" aria-labelledby="headline"><p class="eyebrow">${esc(t.eyebrow)}</p><h1 id="headline">${esc(t.first)}<span>${esc(t.second)}</span></h1><p class="lead">${esc(t.lead)}</p>
<div class="search-launch"><span class="search-label">${esc(t.searchLabel)}</span>${localSearchDemo ? `<span class="demo-note">${esc(searchMessages[code].demo)}</span>` : ''}<button id="open-search" class="search-trigger" type="button" aria-haspopup="dialog" aria-controls="search-dialog">${searchIcon}<span>${esc(t.placeholder)}</span><span class="trigger-arrow" aria-hidden="true">${arrow}</span></button></div>
<div class="download"><p class="download-label">${esc(t.download)}</p><div class="stores"><a data-store="ios" href="${esc(stores.apple)}" aria-label="${esc(t.ios)}"><img class="apple" src="${asset(`assets/app-store/download-on-the-app-store-${code}.svg`)}" alt="${esc(t.ios)}" width="129" height="43"></a><a data-store="android" href="${esc(stores.google)}" aria-label="${esc(t.android)}"><img class="google" src="${asset(`assets/google-play/get-it-on-google-play-${code}.png`)}" alt="${esc(t.android)}" width="150" height="58"></a></div><p class="available">${esc(t.available)}</p><div class="qr-downloads" aria-label="${esc(searchMessages[code].qr)}"><p>${esc(searchMessages[code].qr)}</p><div class="qr-pair"><a href="${esc(qrStores.apple)}" aria-label="${esc(t.ios)}"><img src="${asset(`assets/qr/ios-${code}.svg`)}" alt="${esc(t.ios)} — QR" width="110" height="110" loading="lazy"><span>App Store</span></a><a href="${esc(qrStores.google)}" aria-label="${esc(t.android)}"><img src="${asset(`assets/qr/android-${code}.svg`)}" alt="${esc(t.android)} — QR" width="110" height="110" loading="lazy"><span>Google Play</span></a></div></div></div>
<div class="disciplines" aria-label="PaddleStats">${t.disciplines.map(d => `<span>${esc(d)}</span>`).join('')}</div></section>
<figure class="art"><div class="phone-halo" aria-hidden="true"></div><div class="phone"><img src="${asset(`assets/app-screen-${code}.png`)}" alt="${esc(t.artAlt)}" width="1206" height="2622" fetchpriority="high"><span class="phone-island" aria-hidden="true"></span></div><figcaption><span class="live-dot" aria-hidden="true"></span>${esc(t.artLabel)}</figcaption></figure>
</main><footer class="footer"><a href="${esc(webLink(code, '/', 'powered_by'))}" class="powered-by">Powered by <strong>PaddleStats</strong><span class="arrow" aria-hidden="true">↗</span></a></footer>
</div><dialog id="search-dialog" class="search-dialog" aria-labelledby="dialog-title"><div class="dialog-header"><h2 id="dialog-title">${esc(t.searchLabel)}</h2><button type="button" id="close-search" class="close-search" aria-label="${esc(searchMessages[code].close)}">×</button></div><div class="search-area" data-search-api="${esc(searchApi)}" data-search-key="${esc(publicSearchKey)}"><form id="search-form" action="https://paddlestats.eu/results" method="get"><div class="search-shell modal-input">${searchIcon}<input id="search-query" aria-label="${esc(t.searchLabel)}" name="q" type="search" placeholder="${esc(t.placeholder)}" required minlength="2" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" aria-describedby="search-hint" aria-controls="search-results"><button type="submit" aria-label="${esc(t.search)}">${arrow}</button></div><input type="hidden" name="lang" value="${code}">${tags}<div class="search-options"><input id="search-scope" type="hidden" value="all"><div class="scope-tabs" role="group" aria-label="${esc(t.searchLabel)}"><button type="button" data-scope="all" aria-pressed="true">${esc(searchMessages[code].best)} <span class="scope-count" data-count="all" hidden></span></button><button type="button" data-scope="events" aria-pressed="false">${esc(t.events)} <span class="scope-count" data-count="events" hidden></span></button><button type="button" data-scope="athletes" aria-pressed="false">${esc(t.athletes)} <span class="scope-count" data-count="athletes" hidden></span></button></div><div class="suggestions"><span>${esc(t.try)}:</span><button type="button" data-query="Poznań 2026" data-scope="events">Poznań 2026</button><button type="button" data-query="Klaudia Zwolińska" data-scope="athletes">Klaudia Zwolińska</button></div></div><div class="discipline-tabs" role="group" aria-label="${esc(searchMessages[code].allDisciplines)}"><button type="button" data-discipline="" aria-pressed="true">${esc(searchMessages[code].allDisciplines)} <span class="scope-count" data-discipline-count="all" hidden></span></button>${disciplineKeys.map((key,i)=>`<button type="button" data-discipline="${key}" aria-pressed="false">${esc(searchMessages[code].disciplines[i])} <span class="scope-count" data-discipline-count="${key}" hidden></span></button>`).join('')}</div><p id="search-hint" class="search-hint">${esc(t.searchHint)}</p><div id="search-status" class="search-status" role="status" aria-live="polite"></div><div id="search-results" class="search-results" hidden></div></form></div><div class="dialog-footer"><kbd>Esc</kbd><span>${esc(searchMessages[code].close)}</span></div></dialog></body></html>`;
  const folder = code === 'en' ? out : join(out, code);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.keys(locales).map(code => `<url><loc>${pageUrl(code)}</loc>${Object.keys(locales).map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en')}"/></url>`).join('')}</urlset>`;
await writeFile(join(out, 'sitemap.xml'), sitemap);
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${indexable ? `Sitemap: ${new URL('sitemap.xml', site).href}\n` : '# Preview: HTML pages are noindex until launch.\n'}`);
await writeFile(join(out, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found | PaddleResults</title><h1>Page not found</h1><p><a href="'+esc(site.href)+'">PaddleResults</a></p></html>');
console.log(`Built ${Object.keys(locales).length} fully rendered locales. Site: ${site.href}; indexable: ${indexable}; OG: ${ogWidth}×${ogHeight}`);
