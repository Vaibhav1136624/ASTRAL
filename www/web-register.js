
if ('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.()) {
  const base=new URL('.',document.currentScript.src);
  navigator.serviceWorker.register(new URL('sw.js',base)).catch(()=>{});
}
