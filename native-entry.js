
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
if (Capacitor.isNativePlatform()) {
  const home = !location.pathname.includes('/game/');
  const quit = document.getElementById('quit');
  if(quit){quit.hidden=false;quit.onclick=()=>App.exitApp();}
  App.addListener('backButton', () => {
    const dialog=document.querySelector('dialog[open]');
    if(dialog){
      const cancel=new Event('cancel',{cancelable:true});
      if(dialog.dispatchEvent(cancel))dialog.close();
      return;
    }
    if(!home)location.href='../index.html';
    else App.exitApp();
  });
}
