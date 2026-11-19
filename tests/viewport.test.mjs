import test from 'node:test';
import assert from 'node:assert/strict';
import {searchViewport} from '../public/viewport.mjs';
test('iOS keyboard shrinks the modal to the visible area and accounts for viewport panning',()=>{
 assert.deepEqual(searchViewport({height:390.4,offsetTop:48.6,referenceHeight:780,focused:true}),{height:390,top:49,keyboard:true});
});
test('keyboard closing, browser chrome and pinch zoom do not leave compact mode active',()=>{
 assert.equal(searchViewport({height:780,referenceHeight:780,focused:true}).keyboard,false);
 assert.equal(searchViewport({height:700,referenceHeight:780,focused:true}).keyboard,false);
 assert.equal(searchViewport({height:390,referenceHeight:780,focused:false}).keyboard,false);
 assert.equal(searchViewport({height:390,referenceHeight:780,focused:true,scale:2}).keyboard,false);
 assert.equal(searchViewport({height:0,referenceHeight:780}),null);
});
