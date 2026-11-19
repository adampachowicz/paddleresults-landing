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

test('scope totals come from the API rather than the six-row preview and preserve partial errors', async () => {
 const {searchScopes,searchTotal,flagAsset} = await import('../public/search.mjs');
 const seen = [];
 const fetcher = async url => { const scope = url.searchParams.get('scope'); seen.push(scope); return {ok:true,json:async()=>({data:{hits:Array(9).fill({type:scope==='events'?'event':'athlete',title:'Test',availability:'available_in_app'}),total:scope==='events'?142:27,total_is_estimate:true}})}; };
 const data = await searchScopes('https://api.example.test/search','world','public',undefined,fetcher);
 assert.deepEqual(seen.sort(),['athletes','events']); assert.equal(data.events.hits.length,6); assert.equal(data.events.total.value,142); assert.equal(data.athletes.total.value,27);
 assert.equal(searchTotal({data:{hits:[]}}),null); assert.deepEqual(searchTotal({data:{total:0}}),{value:0,estimated:false});
 const partial = await searchScopes('https://api.example.test/search','world','public',undefined,async url => url.searchParams.get('scope')==='events' ? {ok:false,status:429} : {ok:true,json:async()=>({data:{hits:[],total:0}})});
 assert.equal(partial.events.error,429); assert.equal(partial.athletes.total.value,0);
 assert.equal(flagAsset({flag_code:'de'},'https://example.test/preview/'),'https://example.test/preview/assets/flags/de.svg');
 assert.equal(flagAsset({flag_code:'../bad'},'https://example.test/'),null); assert.equal(flagAsset(null,'https://example.test/'),null);
});
