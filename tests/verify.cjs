const assert=require('node:assert/strict'),O=require('../www/game/spectrum.js'),layouts=require('../www/game/spectral-layouts.js');
for(let n=1;n<=101;n++){
 const l=layouts[n],solved=O.solvedCopy(l);assert.equal(l.n,n);assert.equal(l.gateCuts,1+Math.floor((n-1)/16),'Increasing gate cuts');assert.equal(l.gateWidth,Math.round(44-28*(n-1)/100),'Shrinking openings');assert.equal(l.bandTolerance,n<26?14:n<56?9:5);if(n>=26)assert(l.receiverShields>=1,'Shielded receiver required');assert.equal(l.dimension,n%10===0&&n<=100);assert.equal(l.targets.length,4);assert.deepEqual(l.targets.map(t=>t.color),['green','blue','red','yellow']);assert(!l.objects.some(m=>m.placed),'Tray starts full');assert(!O.trace(l).solved);assert(O.trace(solved).solved,'Unsolvable level '+n);
 assert(O.trace({...l,objects:l.solution.map(m=>({...m,a:Math.round(m.a*180/Math.PI*10)/10*Math.PI/180}))}).solved,'Slider precision '+n);
 for(let i=0;i<l.solution.length;i++)assert(!O.trace({...l,objects:l.solution.filter((_,j)=>i!==j)}).solved,'Unused intended object '+n+'/'+i);
 for(const s of O.trace(solved).segments)for(const p of [s.from,s.to])assert(Number.isFinite(p.x)&&Number.isFinite(p.y));
 for(const m of l.solution){assert(l.targets.every(t=>O.distance(m,t)>=t.r+m.len/2+6),'Placeable near targets '+n);assert(l.baffles.every(b=>O.pointSegment(m,b.from,b.to)>=m.len/2+8),'Placeable near walls '+n);assert(l.solution.every(o=>o===m||O.distance(m,o)>=(m.len+o.len)/2+4),'Placeable without overlap '+n);}
 assert(l.objects.length>=5&&l.objects.length<=11);assert.equal(l.objects.filter(m=>m.type==='prism').length,1);assert.equal(l.objects.filter(m=>m.type==='lens').length,1);assert.equal(l.objects.filter(m=>m.type==='filter').length,1);
 for(const target of solved.targets)assert(O.trace(solved).segments.some(s=>s.objectId===target.id&&s.w&&Math.abs(s.w-O.bands[target.color])<=(l.bandTolerance??14)),'Matching band must actually reach target '+n);
}
assert(O.dispersion(400)>O.dispersion(460)&&O.dispersion(460)>O.dispersion(650),'Violet must bend most');
const empty={n:1,source:{x:80,y:400,a:0},objects:[],targets:[],baffles:[],obstacles:[]};
assert.equal(O.trace({...empty,targets:[{id:'t',x:400,y:400,r:20,color:'green'}]}).lit.size,0,'White light cannot activate green target');
const prism={id:'p',type:'prism',x:200,y:400,a:0,len:48,placed:true};
let r=O.trace({...empty,objects:[prism]});assert.equal(new Set(r.segments.map(s=>s.w).filter(Boolean)).size,61,'Full visible spectrum');
const f={id:'f',type:'filter',x:350,y:400,a:-Math.PI/4,len:200,placed:true};
// Give the filter three narrow spectral rays via a prism; inspect green vs transmitted red paths.
r=O.trace({...empty,objects:[prism,{...f,x:400,y:400,len:500}]});
let greens=r.segments.filter(s=>s.w===530&&s.path.includes('f')),reds=r.segments.filter(s=>s.w===650&&s.path.includes('f'));
assert(greens.length&&reds.length);assert(Math.abs(O.angle(greens[0].from,greens[0].to)-O.dispersion(530))>.5,'Green reflects');assert(Math.abs(O.norm(O.angle(reds[0].from,reds[0].to)-O.dispersion(650)))<1e-6,'Red transmits');
const dl=layouts[10],free={x:300,y:300,a:0,straight:0,bend:1};assert(O.advance(dl,free,5).a>0);assert.equal(O.advance(dl,{...free,straight:10},5).a,0);assert.equal(O.advance(dl,{...free,bend:.5},5).a,O.advance(dl,free,5).a/2);
assert(layouts[101].objects.length>layouts[1].objects.length);assert(layouts[101].targets[0].r<layouts[1].targets[0].r);
console.log('PASS: 101 four-target puzzles; all finite inventories and required objects; slider-precision solutions; 61-band dispersion; selective green reflection; color matching; curved-space rules.');

for(const n of [26,56,86,101]){const l=layouts[n],p=l.solution[0];for(const scale of [.65,1,1.35])for(let degree=-180;degree<180;degree+=5){const prism={...p,x:l.source.x+(p.x-l.source.x)*scale,y:l.source.y+(p.y-l.source.y)*scale,a:degree*Math.PI/180};assert(!O.trace({...l,objects:[prism]}).solved,'Prism-only shortcut '+n);}}
console.log('PASS: increasing gates, shrinking apertures, shielded receivers, tighter spectral tolerance, and sampled prism-only shortcut rejection.');
