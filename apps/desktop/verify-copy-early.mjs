import assert from 'node:assert/strict';
import {launchSilentBrowser} from './tests/silent-browser.mjs';
import {installNativeMock} from './tests/native-mock.mjs';
// Ctrl+C or Copiar pressed while the editor is still loading the frozen image must copy once it
// is ready, instead of being dropped and needing a second press.
const browser=await launchSilentBrowser();
try {
 const page=await browser.newPage({viewport:{width:640,height:480}});
 await page.addInitScript(installNativeMock,{kind:'image',width:400,height:300});
 await page.addInitScript(()=>{
  const original=window.__TAURI_INTERNALS__.invoke;
  window.exports=[];
  window.__TAURI_INTERNALS__.invoke=async(command,args,options)=>{
   if(command==='screen_editor_image'&&!window.imageReleased){const bytes=await original(command,args,options);return new Promise(resolve=>{window.releaseImage=()=>{window.imageReleased=true;resolve(bytes);};});}
   if(command==='screen_image_export'){window.exports.push(args);return true;}
   return original(command,args,options);
  };
 });
 await page.goto((process.env.WHISPERA_TEST_URL||'http://127.0.0.1:5190')+'/overlay.html?view=screen-ink');
 await page.waitForFunction(()=>!!window.releaseImage);
 // Both routes: the shortcut on this window and the toolbar's Copiar relayed as a native action.
 await page.keyboard.press('Control+c');
 await page.evaluate(()=>window.emitNative('screen-editor-action',{id:window.editorContext.id,action:{action:'copy'}}));
 await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>window.exports.length),0,'nothing is exported before the image exists');
 await page.evaluate(()=>window.releaseImage());
 await page.waitForFunction(()=>window.exports.length===1,null,{timeout:5000});
 await page.waitForTimeout(300);
 assert.equal(await page.evaluate(()=>window.exports.length),1,'an early copy runs exactly once after loading');
 assert.equal(await page.evaluate(()=>window.exports[0].action),'copy');
 console.log('PASS: a copy requested while the capture loads runs once when the image is ready. IPC mocked.');
} finally { await browser.close(); }
