import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsTracker} from '../public/analytics.mjs';
function harness(saved=null){
 const events=[],loads=[],disabled=[];let value=saved;
 const tracker=analyticsTracker({id:'G-TEST12345',storage:{getItem:()=>value,setItem:(key,v)=>{value=v;}},send:(...args)=>events.push(args),load:id=>loads.push(id),disable:v=>disabled.push(v),now:()=>100000});
 return {tracker,events,loads,disabled};
}
test('no Google tag or queued telemetry before consent or after decline',()=>{
 const h=harness();h.tracker.track('directory_search',{result_count:2});assert.equal(h.events.length,0);assert.equal(h.loads.length,0);
 h.tracker.choose('declined');h.tracker.track('app_store_click');assert.equal(h.loads.length,0);assert.equal(h.events.length,0);assert.equal(h.disabled.at(-1),true);
});
test('acceptance starts one tag, enables analytics only, and revocation blocks events',()=>{
 const h=harness();h.tracker.choose('accepted');assert.equal(h.loads.length,1);
 assert.deepEqual(h.events[0],['consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
 h.tracker.track('app_store_click',{destination:'ios'});assert.equal(h.events.at(-1)[1],'app_store_click');
 h.tracker.choose('declined');const count=h.events.length;h.tracker.track('app_store_click');assert.equal(h.events.length,count);
 h.tracker.choose('accepted');assert.equal(h.loads.length,1);assert.equal(h.disabled.at(-1),false);
});
test('remembered valid consent resumes while expired and malformed choices do not',()=>{
 assert.equal(harness(JSON.stringify({choice:'accepted',at:99999})).loads.length,1);
 assert.equal(harness(JSON.stringify({choice:'accepted',at:-180*24*60*60*1000})).loads.length,0);
 assert.equal(harness('{bad').tracker.choice,null);
 assert.equal(harness(JSON.stringify({choice:'declined',at:99999})).loads.length,0);
});
test('unavailable storage does not break consent or tracking',()=>{
 const tracker=analyticsTracker({id:'G-TEST12345',storage:{getItem:()=>{throw Error();},setItem:()=>{throw Error();}},send:()=>{},load:()=>{},disable:()=>{}});
 tracker.choose('accepted');assert.equal(tracker.choice,'accepted');
});
