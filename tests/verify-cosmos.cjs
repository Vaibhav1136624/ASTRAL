const assert=require('node:assert/strict');
const {facts,forLevel}=require('../www/game/cosmos.js');
assert.equal(facts.length,20);
assert.equal(new Set(facts.map(f=>f.title)).size,20);
for(let n=1;n<=101;n++){
 const f=forLevel(n);
 assert.equal(Boolean(f),n%5===0,`Wrong milestone at ${n}`);
 if(f){assert.equal(f.level,n);assert.equal(f.index,n/5);assert(f.body.length>80);assert(f.source.startsWith('https://science.nasa.gov/'));}
}
for(const n of [0,-5,5.5,105,null,undefined,'5'])assert.equal(forLevel(n),null);
console.log('PASS: 20 unique sourced notes, exactly at levels 5–100 in steps of five; no note at 101 or invalid levels.');
