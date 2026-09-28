import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,type Protocol} from '../../src/domain/triage';
// Artificial rule semantics only. These are not medical protocols or clinical validation.
const p:Protocol={id:'fixture',version:'test',expires_at:'2099-01-01',questions:[{key:'a',wording_en:'Fixture A',wording_or:'A',options:['yes','no'],red_flag:true,position:1},{key:'b',wording_en:'Fixture B',wording_or:'B',options:['yes','no'],red_flag:false,position:2}],rules:[{conditions:{a:'yes'},disposition:'emergency',capability_codes:[],explanation_codes:['test'],priority:1},{conditions:{b:'yes'},disposition:'routine',capability_codes:['general'],explanation_codes:['test'],priority:100}]};
test('emergency outranks routine even with lower rule priority',()=>assert.equal(evaluate(p,{a:'yes',b:'yes'}).disposition,'emergency'));
test('emergency does not wait for remaining answers',()=>assert.equal(evaluate(p,{a:'yes'}).disposition,'emergency'));
test('nonemergency incomplete intake fails closed',()=>assert.throws(()=>evaluate(p,{b:'yes'}),/INCOMPLETE/));
test('unknown answers are rejected',()=>assert.throws(()=>evaluate(p,{a:'maybe'}),/INVALID/));
test('expired protocol cannot guide navigation',()=>assert.throws(()=>evaluate({...p,expires_at:'2000-01-01'},{a:'yes'}),/EXPIRED/));
test('invalid expiration cannot guide navigation',()=>assert.throws(()=>evaluate({...p,expires_at:'invalid'},{a:'yes'}),/EXPIRED/));
test('no matching rule fails closed',()=>assert.throws(()=>evaluate(p,{a:'no',b:'no'}),/NO_APPROVED/));
