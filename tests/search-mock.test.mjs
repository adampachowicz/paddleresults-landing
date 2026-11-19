import test from 'node:test';
import assert from 'node:assert/strict';
import {mockDirectory,mockSearch} from '../scripts/search-mock.mjs';
import {normalizeHits} from '../public/search.mjs';
test('local directory contains ten athletes and ten events in the production contract',()=>{
 assert.equal(mockDirectory.athletes.length,10);assert.equal(mockDirectory.events.length,10);
 for (const scope of ['athletes','events']) for (const hit of mockDirectory[scope]) assert.deepEqual(Object.keys(hit),['type','id','title','subtitle','availability']);
 const response = mockSearch('ICF','events'); assert.equal(response.status,200);assert.equal(response.body.data.hits.length,6);assert.equal(normalizeHits(response.body,'events').length,6);
});
test('mock searches names, accents, places and years and preserves empty and invalid states',()=>{
 assert.equal(mockSearch('zwolinska','athletes').body.data.hits[0].title,'Klaudia Zwolińska');
 assert.equal(mockSearch('prskavec','athletes').body.data.hits[0].title,'Jiří Prskavec');
 assert.equal(mockSearch('Poznań 2026','events').body.data.hits.length,1);
 assert.equal(mockSearch('zzzzmissing','events').body.data.hits.length,0);
 assert.equal(mockSearch('m','athletes').status,422);assert.equal(mockSearch('Martin','coaches').status,422);
});
