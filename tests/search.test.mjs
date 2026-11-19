import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHits, queryUrl } from '../public/search.mjs';
import { searchMessages } from '../src/locales.mjs';
test('search encodes user input and restricts hits to verified directory metadata', () => {
 const url = queryUrl('https://api.paddlestats.eu/api/v1/discovery/search', ' Klaudia Zwolińska & 2026 ', 'athletes');
 assert.equal(url.searchParams.get('q'), 'Klaudia Zwolińska & 2026');
 const row = {type:'athlete', title:'Klaudia Zwolińska', availability:'available_in_app'};
 assert.deepEqual(normalizeHits({data:{hits:[row, {...row,type:'coach'}, {...row,availability:'unknown'}, {...row,type:'event'}]}}, 'athletes'), [row]);
 assert.equal(normalizeHits({data:{hits:Array(20).fill(row)}},'athletes').length,6);
 assert.throws(()=>normalizeHits({error:'unavailable'},'athletes'));
});
test('each locale has truthful loading, empty, error, rate-limit and setup states', () => {
 assert.equal(Object.keys(searchMessages).length,6);
 for (const t of Object.values(searchMessages)) for (const key of ['loading','empty','error','limited','available','download','unconfigured','short']) assert.ok(t[key]?.length > 3);
});

test('result links select iOS, Android or a real PaddleStats web search', async () => {
 const {detectDevice,resultDestination} = await import('../public/search.mjs');
 const {storeLinks} = await import('../src/links.mjs');
 const hit = {type:'event',title:'Poznań 2026'};
 const stores = storeLinks('pl','search');
 assert.equal(detectDevice({userAgent:'Mozilla iPhone'}),'ios');
 assert.equal(detectDevice({userAgent:'Android'}),'android');
 assert.equal(detectDevice({platform:'MacIntel',maxTouchPoints:5}),'ios');
 assert.equal(detectDevice({userAgent:'Mozilla Windows'}),'web');
 assert.equal(resultDestination(hit,'pl','ios',stores), stores.apple);
 assert.equal(resultDestination(hit,'pl','android',stores), stores.google);
 const web = new URL(resultDestination(hit,'pl','web',stores));
 assert.equal(web.origin,'https://paddlestats.eu'); assert.equal(web.pathname,'/results'); assert.equal(web.searchParams.get('q'),'Poznań 2026');
 assert.equal(new URL(resultDestination({...hit,type:'athlete'},'pl','web',stores)).pathname,'/athletes');
 for (const locale of ['en','pl','de','hu','es','pt-BR']) for (const placement of ['qr','search']) {
  const link = new URL(storeLinks(locale,placement).apple);
  assert.ok(link.searchParams.get('ct').length <= 30);
  assert.equal(link.searchParams.get('utm_content'),`ios_${placement}_${locale}`);
 }
});
