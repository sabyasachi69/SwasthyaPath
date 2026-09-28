import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rankFacilities,inBhubaneswar,distanceKm,type Facility} from '../../src/domain/facility';
const base:Facility={id:'a',slug:'a',name_en:'test',name_or:'test',address:'test',latitude:20.29,longitude:85.82,kind:'PHC',data_class:'verified_real',verification_status:'published',last_verified_at:'2026-09-01',valid_until:'2026-12-01',phone:null,services:['general'],source_url:'https://example.org'};
test('production excludes demo, unpublished and expired records',()=>{const rows=[base,{...base,id:'demo',data_class:'demo' as const},{...base,id:'draft',verification_status:'draft'},{...base,id:'old',valid_until:'2020-01-01'}];assert.deepEqual(rankFacilities(rows,{lat:20.29,lng:85.82},'general',false,Date.parse('2026-09-27')).map(f=>f.id),['a']);});
test('demo selects only fictional records',()=>assert.equal(rankFacilities([base,{...base,id:'demo',data_class:'demo'}],{lat:20.29,lng:85.82},undefined,true)[0].id,'demo'));
test('unknown capability never matches',()=>assert.equal(rankFacilities([base],{lat:20.29,lng:85.82},'emergency',false,Date.parse('2026-09-27')).length,0));
test('service area excludes other cities and invalid numbers',()=>{assert.equal(inBhubaneswar(20.2961,85.8245),true);assert.equal(inBhubaneswar(20.47,85.88),false);assert.equal(inBhubaneswar(NaN,85.88),false);});
test('distance is zero at same location',()=>assert.equal(distanceKm({lat:20,lng:85},{lat:20,lng:85}),0));
