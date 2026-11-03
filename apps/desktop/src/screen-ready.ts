import { invoke } from '@tauri-apps/api/core';
// Hidden WebViews can suspend animation frames. Layout is already committed by
// the caller; bound the paint wait so a hidden window can become visible.
function nextFrame() {
  return new Promise<void>(resolve => {
    const timer=setTimeout(()=>{cancelAnimationFrame(frame);resolve();},20);
    const frame=requestAnimationFrame(()=>{clearTimeout(timer);resolve();});
  });
}
export async function showWhenReady(command:string,args:Record<string,unknown>|undefined,alive:()=>boolean) {
  await nextFrame();if(!alive())return;await nextFrame();
  // Retried every 15 ms (about 5 s in all): each retry waited 50 ms before, a visible part of opening.
  for(let attempt=0;attempt<330&&alive();attempt++){
    if(await invoke<boolean>(command,args)!==false)return;
    await new Promise(resolve=>setTimeout(resolve,15));
  }
  if(alive())throw Error('La vista tardó demasiado en prepararse. Volvé a intentar.');
}
