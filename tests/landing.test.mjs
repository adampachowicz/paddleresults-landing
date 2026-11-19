import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { locales } from '../src/locales.mjs';
import { storeLinks, campaign } from '../src/links.mjs';

const built = spawnSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_URL:'https://adampachowicz.github.io/paddleresults-landing/', INDEXABLE:'false' }, encoding:'utf8' });
assert.equal(built.status, 0, built.stderr);

for (const [code, copy] of Object.entries(locales)) {
  test(`${code}: complete static copy and preview-safe metadata without JavaScript`, async () => {
    const html = await readFile(`dist/${code === 'en' ? '' : `${code}/`}index.html`, 'utf8');
    assert.ok(html.includes(`<html lang="${code}">`));
    assert.ok(html.includes(copy.first));
    assert.ok(html.includes(copy.second));
    assert.ok(html.includes(copy.searchHint));
    assert.ok(html.includes('noindex,follow'));
    const canonical = `https://adampachowicz.github.io/paddleresults-landing/${code === 'en' ? '' : `${code}/`}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.equal((html.match(/<link rel="alternate" hreflang=/g) || []).length, 7);
    assert.ok(html.includes('href="/paddleresults-landing/style.css"'));
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(json['@graph'].find(x => x['@type'] === 'WebPage').inLanguage, code);
    assert.equal(json['@graph'].find(x => x['@type'] === 'SoftwareApplication').name, 'PaddleStats');
    assert.equal((html.match(/data-store=/g) || []).length, 2);
    assert.ok(!html.includes('<small>by PaddleStats</small>'));
    const footer = html.match(/<footer class="footer">(.*?)<\/footer>/s)[1];
    assert.ok(footer.includes('Powered by <strong>PaddleStats</strong>'));
    assert.equal((footer.match(/<a /g) || []).length, 1);
    assert.ok(!footer.includes('/privacy'));

    const nav = html.match(/<nav aria-label="[^"]*">(.*?)<\/nav>/s)[1];
    assert.ok(!nav.includes('https://'), 'language navigation must stay on the current origin');
    for (const lang of Object.keys(locales)) assert.ok(nav.includes(`href="/paddleresults-landing/${lang === 'en' ? '' : `${lang}/`}"`));
    assert.equal((html.match(/id="search-query"/g) || []).length, 1);
    assert.ok(html.includes('<dialog id="search-dialog"'));
    assert.ok(html.includes('aria-haspopup="dialog"'));
    assert.ok(html.includes(`aria-label="${copy.searchLabel}"`));

    for (const src of [...html.matchAll(/(?:src|href)="(\/paddleresults-landing\/(?:assets\/[^"?#]+|site\.js|style\.css))"/g)]) {
      await access(`dist/${src[1].replace('/paddleresults-landing/', '')}`);
    }
  });
  test(`${code}: store attribution survives nested encoding and identifies our app`, () => {
    const links = storeLinks(code), apple = new URL(links.apple), play = new URL(links.google);
    assert.equal(apple.hostname, 'apps.apple.com');
    assert.ok(apple.pathname.endsWith('/id6822209038'));
    assert.equal(apple.searchParams.get('utm_source'), 'paddleresults.com');
    assert.equal(apple.searchParams.get('utm_campaign'), campaign);
    assert.equal(apple.searchParams.get('pt'), '128893100');
    assert.ok(apple.searchParams.get('ct').length <= 30);
    assert.ok(apple.searchParams.get('utm_content').endsWith(code));
    assert.equal(play.hostname, 'play.google.com');
    assert.equal(play.searchParams.get('id'), 'eu.paddlestats.app');
    const referrer = new URLSearchParams(play.searchParams.get('referrer'));
    for (const key of ['utm_source','utm_medium','utm_campaign','utm_content']) assert.equal(referrer.get(key), play.searchParams.get(key));
  });
}
test('sitemap lists six canonical pages with reciprocal alternatives', async () => {
  const xml = await readFile('dist/sitemap.xml', 'utf8');
  assert.equal((xml.match(/<loc>/g) || []).length, 6);
  assert.equal((xml.match(/hreflang="x-default"/g) || []).length, 6);
  const notFound = await readFile('dist/404.html', 'utf8');
  assert.ok(notFound.includes('noindex'));
});
