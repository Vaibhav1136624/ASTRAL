(function(root){'use strict';
const W=800,H=800,TAU=Math.PI*2;
const bands={green:530,blue:460,red:650,yellow:580};
const colors={white:'#dddcd1',green:'#58bf78',blue:'#558bd4',red:'#d35460',yellow:'#d8bd65'};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),norm=a=>Math.atan2(Math.sin(a),Math.cos(a));
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function spectrum(w){if(!w)return colors.white;let r=0,g=0,b=0;if(w<440){r=(440-w)/40;b=1;}else if(w<490){g=(w-440)/50;b=1;}else if(w<510){g=1;b=(510-w)/20;}else if(w<580){r=(w-510)/70;g=1;}else if(w<645){r=1;g=(645-w)/65;}else r=1;return `rgb(${Math.round(r*205)},${Math.round(g*205)},${Math.round(b*215)})`;}
function segmentRay(p,d,a,b){const sx=b.x-a.x,sy=b.y-a.y,den=d.x*sy-d.y*sx;if(Math.abs(den)<1e-9)return Infinity;const ax=a.x-p.x,ay=a.y-p.y,t=(ax*sy-ay*sx)/den,u=(ax*d.y-ay*d.x)/den;return t>.001&&u>=0&&u<=1?t:Infinity;}
function circleRay(p,d,c,r){const x=p.x-c.x,y=p.y-c.y,b=x*d.x+y*d.y,disc=b*b-x*x-y*y+r*r;if(disc<0)return Infinity;const t=-b-Math.sqrt(disc);return t>.001?t:Infinity;}
function ends(m){let x=Math.cos(m.a)*m.len/2,y=Math.sin(m.a)*m.len/2;return[{x:m.x-x,y:m.y-y},{x:m.x+x,y:m.y+y}];}
function pointSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,q=dx*dx+dy*dy;if(!q)return distance(p,a);let t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/q));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
// Cauchy-like wavelength-dependent index and minimum-deviation prism formula.
// Angular separation is enlarged for a readable, playable spectrum.
function dispersion(w){let index=1.43+.045/((w/1000)**2);return 3.2*(2*Math.asin(index*.5)-Math.PI/3-(2*Math.asin((1.43+.045/.58**2)*.5)-Math.PI/3));}
function curvature(l,x){return l.dimension?(.0009+l.n*.000006)*(l.n>=50&&x>440?-1:1):0;}
function advance(l,p,ds){let straight=Math.min(ds,p.straight||0),turn=curvature(l,p.x)*(p.bend??1)*(ds-straight),a=p.a+turn/2;return{...p,x:p.x+Math.cos(a)*ds,y:p.y+Math.sin(a)*ds,a:p.a+turn,straight:Math.max(0,(p.straight||0)-ds)};}
function trace(l){const segments=[],lit=new Set(),wrong=new Set(),touched=new Map(),connected=new Set(),queue=[{...l.source,w:0,power:1,depth:0,path:[],straight:l.dimension?0:10000,bend:1,last:null}];let interactions=0;
while(queue.length){let ray=queue.shift();for(let steps=0;steps<1300&&ray.depth<18;steps++){
 const step=l.dimension?5:1600,next=advance(l,ray,step),d={x:(next.x-ray.x)/step,y:(next.y-ray.y)/step};let closest=step+.0001,hit=null;
 const consider=(t,kind,obj)=>{if(t<closest){closest=t;hit={kind,obj};}};
 for(const m of l.objects){if(!m.placed||m.id===ray.last)continue;if(m.type==='prism'){consider(circleRay(ray,d,m,22),'prism',m);}else{let [a,b]=ends(m);consider(segmentRay(ray,d,a,b),m.type,m);}}
 for(const target of l.targets)consider(circleRay(ray,d,target,target.r),'target',target);
 for(const b of l.baffles)consider(segmentRay(ray,d,b.from,b.to),'wall',b);
 for(const o of l.obstacles)consider(circleRay(ray,d,o,o.r),'wall',o);
 for(const [a,b]of [[{x:24,y:24},{x:776,y:24}],[{x:776,y:24},{x:776,y:776}],[{x:776,y:776},{x:24,y:776}],[{x:24,y:776},{x:24,y:24}]])consider(segmentRay(ray,d,a,b),'wall',null);
 const end={x:ray.x+d.x*closest,y:ray.y+d.y*closest};segments.push({from:{x:ray.x,y:ray.y},to:end,w:ray.w,power:ray.power,hit:hit?.kind||'space',objectId:hit?.obj?.id,path:[...ray.path],straight:ray.straight>0});
 if(!hit){ray={...next};if(ray.last){let m=l.objects.find(m=>m.id===ray.last);if(!m||distance(ray,m)>m.len/2+3)ray.last=null;}if(end.x<24||end.x>776||end.y<24||end.y>776)break;continue;}
 interactions++;if(hit.kind==='wall')break;
 if(hit.kind==='target'){if(ray.w&&Math.abs(ray.w-bands[hit.obj.color])<=(l.bandTolerance??14)){lit.add(hit.obj.id);ray.path.forEach(id=>connected.add(id));}else wrong.add(hit.obj.id);break;}
 const m=hit.obj;if(!touched.has(m.id))touched.set(m.id,new Set());touched.get(m.id).add(ray.w);
 const incoming=ray.a+(next.a-ray.a)*(closest/step);let a=incoming,bend=ray.bend,straight=0,power=ray.power*.93;
 if(m.type==='prism'&&!ray.w){for(let w=400;w<=700;w+=5){let a=incoming+m.a+dispersion(w);queue.push({x:m.x+Math.cos(a)*24,y:m.y+Math.sin(a)*24,a,w,power:.85,depth:ray.depth+1,path:[...ray.path,m.id],straight:0,bend:1,last:m.id});}break;}
 if(m.type==='prism'){a+=dispersion(ray.w)*.5;}
 if(m.type==='mirror'||(m.type==='filter'&&ray.w>=510&&ray.w<=550)){
   if(l.dimension&&m.type==='mirror'){a=m.a+Math.PI/2;if(Math.cos(a-incoming)<0)a+=Math.PI;straight=l.stabilize;}else a=2*m.a-incoming;
   bend=1;
 }else if(m.type==='lens'){let axis=m.a+Math.PI/2;if(Math.cos(axis-incoming)<0)axis+=Math.PI;const focus={x:m.x+Math.cos(axis)*m.focal,y:m.y+Math.sin(axis)*m.focal};a=angle(end,focus);bend=.5;}
 ray={x:end.x+Math.cos(a)*.12,y:end.y+Math.sin(a)*.12,a,w:ray.w,power,depth:ray.depth+1,path:[...ray.path,m.id],straight,bend,last:m.id};
 }
}
return{segments,lit,wrong,touched,connected,solved:l.targets.length===4&&lit.size===4,interactions};}
function tail(l,w){const ss=trace(l).segments.filter(s=>s.w===w);let last=-1;for(let i=0;i<ss.length;i++)if(ss[i].objectId&&l.objects.some(m=>m.id===ss[i].objectId))last=i;return ss.slice(last+1);}
function atDistance(ss,d){for(const s of ss){let len=distance(s.from,s.to);if(d<=len)return{x:s.from.x+(s.to.x-s.from.x)*d/len,y:s.from.y+(s.to.y-s.from.y)*d/len,a:angle(s.from,s.to)};d-=len;}return null;}
function solvedCopy(l){return{...l,objects:l.solution.map(m=>({...m,placed:true}))};}
function createFresh(n){for(let attempt=0;attempt<6000;attempt++){
const r=rng(38271+n*917+attempt*6101),dimension=n%10===0&&n<=100;
const l={n,dimension,stabilize:Math.max(35,85-n*.45),name:dimension?'The other side / '+String(n/10).padStart(2,'0'):['The first spectrum','A quiet refraction','Between the wavelengths','A fraction of light','The glass garden'][(n-1)%5],chapter:dimension?'CURVED DIMENSION':'SPECTRAL CHAMBER',source:{x:85,y:95,a:0},objects:[],solution:[],targets:[],baffles:[],obstacles:[],bandTolerance:n<26?14:n<56?9:5};
const p={id:'p0',type:'prism',x:205+(r()-.5)*45,y:245+(r()-.5)*65,a:0,len:48,placed:true};l.source.a=angle(l.source,p)-(dimension?curvature(l,l.source.x)*distance(l.source,p)/2:0);p.a=-l.source.a-(dimension?curvature(l,l.source.x)*distance(l.source,p):0)-.08+(r()-.5)*.15;l.objects.push(p);
const specs=[{type:'filter',w:530,d:220+r()*65,out:-1.1+(r()-.5)*.5},{type:'lens',w:460,d:230+r()*45,out:1.0+(r()-.5)*.5},{type:'mirror',w:650,d:280+r()*80,out:.75+(r()-.5)*.7},{type:'mirror',w:580,d:340+r()*60,out:2.0+(r()-.5)*.8}];
if(n>25)specs.push({type:'mirror',w:650,d:95+r()*30,out:1.6+(r()-.5)});
if(n>55)specs.push({type:'mirror',w:460,d:90+r()*35,out:-.1+(r()-.5)});
if(n>35&&!dimension)specs.push({type:'mirror',w:530,d:65+r()*25,out:2.3+(r()-.5)*.8});
if(n>65&&!dimension)specs.push({type:'mirror',w:650,d:65+r()*25,out:.1+(r()-.5)*.7});
if(n>85&&!dimension)specs.push({type:'mirror',w:460,d:65+r()*25,out:-1.9+(r()-.5)*.8});
if(n>80)specs.push({type:'mirror',w:580,d:80+r()*30,out:2.9+(r()-.5)});
let fail=false;for(const spec of specs){const pos=atDistance(tail(l,spec.w),spec.d);if(!pos||pos.x<60||pos.x>730||pos.y<65||pos.y>730){fail=true;break;}let a=(pos.a+spec.out)/2;if(spec.type==='lens'||dimension&&spec.type==='mirror')a=spec.out-Math.PI/2;l.objects.push({id:'o'+l.objects.length,type:spec.type,x:pos.x,y:pos.y,a,len:spec.type==='filter'?42:spec.type==='lens'?34:30,focal:135,placed:true});}
if(fail)continue;
for(const color of ['green','blue','red','yellow']){let ss=tail(l,bands[color]),length=ss.reduce((a,s)=>a+distance(s.from,s.to),0);let d=Math.min(130+r()*70,length-35),pos=atDistance(ss,d);if(d<70||!pos||pos.x<60||pos.x>740||pos.y<65||pos.y>740){fail=true;break;}l.targets.push({id:'t'+color,color,x:pos.x,y:pos.y,r:Math.max(10,24-n*.14)});}
if(fail||l.targets.some((t,i)=>l.targets.slice(i+1).some(v=>distance(t,v)<90)))continue;
if(l.objects.some((m,i)=>l.objects.slice(i+1).some(v=>distance(m,v)<(m.len+v.len)/2+5)))continue;
if(l.targets.some(t=>l.objects.some(m=>distance(t,m)<t.r+m.len/2+7)))continue;
if(!trace(l).solved)continue;
let paths=trace(l).segments;
// Add opaque stones without obstructing any wavelength in the intended routes.
for(let tries=0;tries<100&&l.baffles.length<1+Math.floor(n/20);tries++){let x=80+r()*640,y=120+r()*580,b={from:{x,y},to:{x:x+40+r()*65,y}};if(paths.every(s=>pointSegment(s.from,b.from,b.to)>28&&pointSegment(s.to,b.from,b.to)>28)&&l.objects.every(m=>pointSegment(m,b.from,b.to)>45)&&l.targets.every(t=>pointSegment(t,b.from,b.to)>45)){l.baffles.push(b);if(!trace(l).solved)l.baffles.pop();}}
const rounded={...l,objects:l.objects.map(m=>({...m,a:Math.round(m.a*180/Math.PI*10)/10*Math.PI/180}))};
if(!trace(rounded).solved)continue;
if(l.objects.some((_,i)=>trace({...l,objects:l.objects.filter((_,j)=>i!==j)}).solved))continue;
l.solution=l.objects.map(m=>({...m}));l.objects=l.objects.map(m=>({...m,placed:false,a:0,x:-100,y:-100}));l.generationAttempt=attempt;return l;
}throw Error('Cannot generate spectral chamber '+n);}
function createLevel(n){n=Math.max(1,Math.min(101,Math.floor(n)));let layouts=typeof module!=='undefined'?null:root.SpectralLayouts;if(layouts?.[n])return JSON.parse(JSON.stringify(layouts[n]));return createFresh(n);}
const api={W,H,colors,bands,spectrum,rng,distance,angle,norm,ends,pointSegment,dispersion,advance,curvature,trace,createFresh,createLevel,solvedCopy};if(typeof module!=='undefined')module.exports=api;else root.Optics=api;
})(typeof window!=='undefined'?window:globalThis);
