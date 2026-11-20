import test from 'node:test';
import assert from 'node:assert/strict';
import {mockDirectory,mockSearch} from '../scripts/search-mock.mjs';
import {normalizeHits} from '../public/search.mjs';
test('local directory contains ten athletes and ten events in the production contract',()=>{
 assert.equal(mockDirectory.athletes.length,10);assert.equal(mockDirectory.events.length,10);
 for (const scope of ['athletes','events']) for (const hit of mockDirectory[scope]) {
  assert.equal(hit.availability,'available_in_app'); assert.ok(Array.isArray(hit.disciplines)); assert.ok(Array.isArray(hit.discipline_groups)); assert.ok(hit.country.code);
  if (scope==='events') { for (const field of ['results_count','athletes_count','countries_count']) assert.ok(Number.isInteger(hit[field])); assert.ok(['matches','runs','boat_results'].includes(hit.results_unit)); assert.ok(hit.location); assert.ok(hit.level); }
  else { assert.ok(hit.first_name); assert.ok(hit.last_name); assert.equal(hit.age,null); assert.equal(hit.club,null); }
 }
 const response = mockSearch('ICF','events'); assert.equal(response.status,200);assert.equal(response.body.data.total,8);assert.equal(response.body.data.total_is_estimate,false);assert.equal(response.body.data.hits.length,6);assert.equal(normalizeHits(response.body,'events').length,6);
});
test('mock searches names, accents, places and years and preserves empty and invalid states',()=>{
 assert.equal(mockSearch('zwolinska','athletes').body.data.hits[0].title,'Klaudia Zwolińska');
 assert.equal(mockSearch('prskavec','athletes').body.data.hits[0].title,'Jiří Prskavec');
 assert.equal(mockSearch('Poznań 2026','events').body.data.hits.length,1);
 assert.equal(mockSearch('zzzzmissing','events').body.data.hits.length,0);
 assert.equal(mockSearch('m','athletes').status,422);assert.equal(mockSearch('Martin','coaches').status,422);
});
test('best matches find an athlete without manually switching away from competitions',()=>{
 const response=mockSearch('zwol','all');
 assert.equal(response.body.data.hits[0].type,'athlete'); assert.equal(response.body.data.totals.events,0);assert.equal(response.body.data.totals.athletes,1);
 assert.equal(mockSearch('ICF','all','canoe-polo').body.data.hits.length,1);
 assert.equal(mockSearch('ICF','all','canoe-polo').body.data.total,1);
 assert.equal(mockSearch('ICF','all','unknown').status,422);
});
test('discipline pill totals are counts for the whole query, even with another discipline selected',()=>{
 const response=mockSearch('ICF','all','canoe-slalom').body.data;
 assert.equal(response.total,1);assert.equal(response.discipline_total,8);
 assert.equal(response.discipline_counts['canoe-slalom'],1);assert.ok(response.discipline_counts['canoe-sprint']>1);
 const person=mockSearch('zwol','athletes').body.data.hits[0];
 assert.equal(person.birth_year,1998);assert.ok(person.profile_path.startsWith('/canoe-slalom/athletes/'));assert.ok(person.recent_results.length);
});
