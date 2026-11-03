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
 // Colour: chosen in Appearance, stored per model, other models untouched, restorable.
 const settings=await browser.newPage({viewport:{width:1100,height:800}});
 await settings.addInitScript(installNativeMock,{});
 await settings.addInitScript(()=>{
  const invoke=window.__TAURI_INTERNALS__.invoke;
  window.savedSettings={model:'whisper-large-v3-turbo',language:'es',hotkey:'Alt+Z',color:'#9024DC',pattern:'wave',placement:'right',autoCopy:true,autoPaste:true,soundTheme:'cristal',sounds:true,recorderScale:.85,trimSilence:true,watchdog:true,incrementalTranscription:true,dictationArtwork:'original',metallicColor:'#ffffff',metallicOriginal:true};
  window.__TAURI_INTERNALS__.invoke=async(command,args)=>{
   if(command==='read_settings')return {...window.savedSettings};
   if(command==='snapshot')return {...await invoke(command,args),settings:{...window.savedSettings}};
   if(command==='save_settings'){window.savedSettings=args.settings;return null;}
   return invoke(command,args);
  };
 });
 await settings.goto((process.env.WHISPERA_TEST_URL||`http://127.0.0.1:${server.httpServer.address().port}`)+'/',{timeout:90000});
 await settings.getByRole('button',{name:'Apariencia',exact:true}).click();
 await settings.getByRole('button',{name:'Modelo anterior',exact:true}).click();
 await settings.waitForFunction(()=>window.savedSettings?.dictationArtwork==='realistic');
 await settings.locator('.appearance-preview .realistic-folder canvas').waitFor();
 assert.equal(await settings.getByRole('button',{name:'Restaurar obsidiana y oro'}).count(),0,'nothing to restore on the original look');
 const before=await settings.evaluate(()=>({color:window.savedSettings.color,metallic:window.savedSettings.metallicColor}));
 await settings.getByRole('button',{name:'Elegir color',exact:true}).click();
 await settings.getByRole('button',{name:'Azul',exact:true}).click();
 await settings.getByRole('button',{name:'Cerrar paleta'}).click();
 await settings.waitForFunction(()=>window.savedSettings?.artworkColors?.realistic==='#50B1FD');
 assert.deepEqual(await settings.evaluate(()=>({color:window.savedSettings.color,metallic:window.savedSettings.metallicColor})),before,'other folder colours are untouched');
 assert.equal(await settings.locator('.color-values code').textContent(),'#50B1FD');
 await settings.getByRole('button',{name:'Restaurar obsidiana y oro'}).click();
 await settings.waitForFunction(()=>!window.savedSettings.artworkColors?.realistic);
 // Derived trims always read against the body, and an empty colour is the design's own look.
 const palettes=await settings.evaluate(async()=>{const {folderPalette,DESIGN_PALETTE}=await import('/src/folder-palette.ts');
  const light=hex=>{const n=parseInt(hex.slice(1),16);return (Math.max(n>>16&255,n>>8&255,n&255)+Math.min(n>>16&255,n>>8&255,n&255))/510;};
  return {design:folderPalette('')===DESIGN_PALETTE,gaps:['#000000','#0f0f13','#1d2b64','#9024dc','#50b1fd','#e8e2d0','#ffffff','#808080','#ff0000','#00a86b'].map(c=>{const p=folderPalette(c);return {c,gap:Math.abs(light(p.trim)-light(p.face))};})};});
 assert.ok(palettes.design);
 for(const {c,gap} of palettes.gaps)assert.ok(gap>=0.25,`trim of ${c} stands out from the body (${gap.toFixed(2)})`);
 await settings.close();
 console.log('PASS: 3D folder falls back without WebGL, releases its GPU context, and its colour is stored per model with contrasting trims. IPC mocked.');
}finally{await browser.close();await server?.close();}
