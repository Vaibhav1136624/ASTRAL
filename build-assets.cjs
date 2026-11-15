const fs=require('fs/promises'),path=require('path'),sharp=require('sharp'),esbuild=require('esbuild'),crypto=require('crypto');
(async()=>{
 const bundle=await esbuild.build({stdin:{contents:await fs.readFile('native-entry.js','utf8'),loader:'js'},bundle:true,format:'iife',write:false,minify:true,plugins:[{name:'explicit-module-files',setup(build){
  build.onResolve({filter:/.*/},args=>({path:require.resolve(args.path,{paths:[args.importer?path.dirname(args.importer):__dirname]}),namespace:'source'}));
  build.onLoad({filter:/.*/,namespace:'source'},async args=>({contents:await fs.readFile(args.path,'utf8'),loader:'js'}));
 }}]});
 await fs.writeFile('www/native.js',bundle.outputFiles[0].contents);
 const logo=await fs.readFile('www/assets/astral.svg');
 for(const size of [192,512])await sharp(logo).resize(size,size).png().toFile(`www/assets/astral-${size}.png`);
 await sharp(logo).resize(512,512).flatten({background:'#090c13'}).png().toFile('store/icon-512.png');
 const banner=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500"><rect width="1024" height="500" fill="#05070b"/><circle cx="775" cy="250" r="202" fill="none" stroke="#b7a079" opacity=".25"/><text x="65" y="218" fill="#e7d5aa" font-family="sans-serif" font-size="68" letter-spacing="12">ASTRAL</text><text x="68" y="275" fill="#929ba6" font-family="sans-serif" font-size="21">A spectral odyssey</text><text x="68" y="370" fill="#bcb8ac" font-family="sans-serif" font-size="17">101 chambers. Four wavelengths.</text></svg>`);
 await sharp(banner).composite([{input:await sharp(logo).resize(340,340).png().toBuffer(),left:605,top:80}]).png().toFile('store/feature-graphic-1024x500.png');
 const res='android/app/src/main/res';
 for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
  for(const suffix of ['', '_round'])await sharp(logo).resize(size,size).png().toFile(`${res}/mipmap-${density}/ic_launcher${suffix}.png`);
  await sharp(logo).resize(Math.round(size*1.25),Math.round(size*1.25)).extend({top:Math.round(size*.5),bottom:Math.round(size*.5),left:Math.round(size*.5),right:Math.round(size*.5),background:'#090c13'}).resize(Math.round(size*2.25)).png().toFile(`${res}/mipmap-${density}/ic_launcher_foreground.png`);
 }
 for(const name of ['ic_launcher','ic_launcher_round'])await fs.writeFile(`${res}/mipmap-anydpi-v26/${name}.xml`,'<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/astral_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>');
 await fs.writeFile(`${res}/values/astral_colors.xml`,'<resources><color name="astral_background">#090c13</color></resources>');
 await fs.writeFile(`${res}/values/styles.xml`, `<resources>
 <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar"><item name="colorPrimary">#090c13</item><item name="colorPrimaryDark">#090c13</item><item name="colorAccent">#ddc99c</item><item name="android:windowLightStatusBar">false</item><item name="android:statusBarColor">#090c13</item><item name="android:navigationBarColor">#090c13</item></style>
 <style name="AppTheme.NoActionBar" parent="AppTheme"><item name="windowActionBar">false</item><item name="windowNoTitle">true</item></style>
 <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen"><item name="windowSplashScreenBackground">@color/astral_background</item><item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item><item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item></style>
 </resources>`);
 const files=['./','index.html','menu.css','menu.js','mobile.css','effects.css','effects.js','native.js','web-register.js','manifest.webmanifest','privacy.html','assets/astral.svg','assets/astral-192.png','assets/astral-512.png','game/index.html','game/style.css','game/game.js','game/spectrum.js','game/spectral-layouts.js','game/cosmos.js'];
 const hash=crypto.createHash('sha256');for(const f of files.filter(f=>f!=='./'))hash.update(await fs.readFile(path.join('www',f)));
 const version=hash.digest('hex').slice(0,12);
 await fs.writeFile('www/sw.js',`const CACHE='astral-${version}',FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('astral-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});if(hit)return hit.redirected?new Response(await hit.blob(),{status:hit.status,statusText:hit.statusText,headers:hit.headers}):hit;return fetch(e.request);}));});`);
 console.log('Built native bridge, web cache, launcher icons, and store artwork');
})();



