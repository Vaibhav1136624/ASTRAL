(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active=null;
function cancel(){active?.(false);}
function play(kind,label,duration=1100){cancel();if(reduced.matches)return Promise.resolve(true);return new Promise(resolve=>{
 const d=document.createElement('dialog');d.className='astral-cinematic '+kind;d.setAttribute('aria-label',label);
 const art=document.createElement('div');art.className='cinematic-art';art.setAttribute('aria-hidden','true');
 for(let i=0;i<4;i++){const ring=document.createElement('i');art.append(ring);}
 const copy=document.createElement('p');copy.textContent=label;const small=document.createElement('span');small.textContent=kind==='complete'?'FOUR WAVELENGTHS · ONE SIGNAL':'ASTRAL / LIGHT IN TRANSIT';
 const skip=document.createElement('button');skip.textContent='Skip animation';d.append(art,small,copy,skip);document.body.append(d);
 let timer;const done=ok=>{clearTimeout(timer);d.close();d.remove();if(active===done)active=null;resolve(ok);};active=done;
 skip.onclick=()=>done(true);d.oncancel=e=>{e.preventDefault();done(true);};d.showModal();timer=setTimeout(()=>done(true),duration);
});}
function arrive(){document.body.classList.remove('chamber-arrive');void document.body.offsetWidth;document.body.classList.add('chamber-arrive');}
window.AstralFX={play,cancel,arrive};
if(!location.pathname.includes('/game/')){let show=true;try{show=!sessionStorage.getItem('astral-intro');sessionStorage.setItem('astral-intro','1');}catch{}if(show)play('opening','A little light. An infinite universe.',1400);document.body.classList.add('menu-arrive');}
})();
