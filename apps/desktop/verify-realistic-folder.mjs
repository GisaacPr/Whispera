import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {launchSilentBrowser} from './tests/silent-browser.mjs';
import {installNativeMock} from './tests/native-mock.mjs';
const server=process.env.WHISPERA_TEST_URL?null:await createServer({server:{host:'127.0.0.1',port:0,strictPort:false}});await server?.listen();const browser=await launchSilentBrowser();
const recorder=async({blockWebgl})=>{
 const page=await browser.newPage({viewport:{width:760,height:720}});
 await page.addInitScript(installNativeMock,{windowLabel:'recorder'});
 await page.addInitScript(block=>{
  const original=window.__TAURI_INTERNALS__.invoke;
  window.voiceState={phase:'idle',seconds:0,error:'',text:'',muted:false,progress:'',session:'audit',level:0};
  window.voiceSettings={color:'#112233',recorderScale:.85,pattern:'wave',dictationArtwork:'realistic',metallicOriginal:true,placement:'right'};
  window.__TAURI_INTERNALS__.invoke=async(command,args)=>command==='recording_state'?structuredClone(window.voiceState):command==='read_settings'?structuredClone(window.voiceSettings):command==='pending_recordings'?[]:command==='recording_action'?undefined:original(command,args);
  // Count WebGL contexts the page creates and the ones it gives back.
  window.webgl={created:0,lost:0};
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...rest){
   if(/webgl/.test(type)){
    if(block)return null;
    const context=getContext.call(this,type,...rest);
    if(context&&!this.dataset.counted){this.dataset.counted='1';window.webgl.created++;this.addEventListener('webglcontextlost',()=>window.webgl.lost++);}
    return context;
   }
   return getContext.call(this,type,...rest);
  };
 },blockWebgl);
 const base=process.env.WHISPERA_TEST_URL||`http://127.0.0.1:${server.httpServer.address().port}`;
 await page.goto(base+'/?view=record',{timeout:90000});
 return page;
};
try{
 // Without WebGL the 3D folder must give way to the original animated folder, never an empty recorder.
 const blocked=await recorder({blockWebgl:true});
 await blocked.locator('.float-rig [data-slot="folder"]').waitFor({timeout:15000});
 assert.equal(await blocked.locator('.realistic-folder canvas').count(),0,'no dead 3D canvas remains');
 await blocked.close();
 // With WebGL it renders, and switching to another model releases the GPU context.
 const page=await recorder({blockWebgl:false});
 await page.locator('.realistic-folder canvas').waitFor();
 await page.waitForFunction(()=>window.webgl.created>=1);
 await page.evaluate(()=>{window.voiceSettings={...window.voiceSettings,dictationArtwork:'original'};});
 await page.locator('.float-rig [data-slot="folder"]').waitFor({timeout:15000});
 await page.waitForFunction(()=>window.webgl.lost===window.webgl.created,null,{timeout:5000}).catch(()=>{});
 const counts=await page.evaluate(()=>window.webgl);
 assert.equal(counts.lost,counts.created,`every WebGL context is released after leaving the 3D folder (${JSON.stringify(counts)})`);
 console.log('PASS: 3D folder falls back to the original without WebGL and releases its GPU context on switch. IPC mocked.');
}finally{await browser.close();await server?.close();}
