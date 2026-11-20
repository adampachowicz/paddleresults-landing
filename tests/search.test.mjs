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

test('mixed search uses API totals and sends the discipline filter before preview limits', async () => {
 const {searchDirectory,searchTotal,flagAsset,eventDetails} = await import('../public/search.mjs');
 let called;
 const fetcher = async url => { called=url; return {ok:true,json:async()=>({data:{hits:[{type:'athlete',title:'Klaudia',availability:'available_in_app'},{type:'event',title:'Slalom',availability:'available_in_app'}],total:169,totals:{all:169,events:142,athletes:27},total_is_estimate:true}})}; };
 const data = await searchDirectory('https://api.example.test/search','world','all','canoe-slalom','public',undefined,fetcher);
 assert.equal(called.searchParams.get('scope'),'all'); assert.equal(called.searchParams.get('discipline'),'canoe-slalom');
 assert.equal(data.hits.length,2); assert.equal(data.total.value,169); assert.equal(data.totals.events,142);
 assert.equal(searchTotal({data:{hits:[]}}),null); assert.deepEqual(searchTotal({data:{total:0}}),{value:0,estimated:false});
 const failed = await searchDirectory('https://api.example.test/search','world','all','', 'public',undefined,async()=>({ok:false,status:429}));
 assert.equal(failed.error,429);
 assert.equal(flagAsset({flag_code:'de'},'https://example.test/preview/'),'https://example.test/preview/assets/flags/de.svg');
 assert.equal(flagAsset({flag_code:'../bad'},'https://example.test/'),null);
 const details = eventDetails({type:'event',start_date:'2026-06-12',end_date:'2026-06-14',races_count:0,race_unit:'matches',athletes_count:100,countries_count:null},'pl',searchMessages.pl);
 assert.ok(details[0].includes('2026')); assert.ok(details.includes('0 meczów')); assert.ok(details.includes('100 zawodników')); assert.equal(details.length,3);
 assert.deepEqual(eventDetails({type:'event',races_count:null},'en',searchMessages.en),[]);
});

test('athlete headings use structured names and profile links rather than another search',async()=>{
 const {athleteName,recentDestination} = await import('../public/search.mjs');
 const {storeLinks}=await import('../src/links.mjs');
 const {resultDestination}=await import('../public/search.mjs');
 assert.equal(athleteName({first_name:'KLAUDIA',last_name:'ZWOLIŃSKA',title:'ignored'},'pl'),'Klaudia Zwolińska');
 assert.equal(athleteName({first_name:'ANNA-MARIA',last_name:'O’NEILL'},'en'),'Anna-Maria O’Neill');
 const stores=storeLinks('pl','search');
 const profile=new URL(resultDestination({type:'athlete',title:'Klaudia',profile_path:'/canoe-slalom/athletes/klaudia-zwolinska'},'pl','web',stores));
 assert.equal(profile.pathname,'/canoe-slalom/athletes/klaudia-zwolinska');assert.equal(profile.searchParams.has('q'),false);assert.equal(profile.searchParams.get('lang'),'pl');
 const recent=new URL(recentDestination({name:'Cup',path:'/results/cup-2026'},'pl','web',stores));assert.equal(recent.pathname,'/results/cup-2026');assert.equal(recent.searchParams.get('utm_source'),'paddleresults.com');
 assert.equal(recentDestination({name:'Cup',path:'/results/cup-2026'},'pl','ios',stores),stores.apple);
 const unsafe=new URL(resultDestination({type:'athlete',title:'Name',profile_path:'//evil.example'},'pl','web',stores));assert.equal(unsafe.origin,'https://paddlestats.eu');
});
