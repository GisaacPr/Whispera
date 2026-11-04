import assert from 'node:assert/strict';
import {launchSilentBrowser} from './tests/silent-browser.mjs';
import {installNativeMock} from './tests/native-mock.mjs';
const browser=await launchSilentBrowser();
try {
  const page=await browser.newPage({viewport:{width:1100,height:760},locale:'es-AR'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(installNativeMock,{whatsNew:true});
  await page.goto((process.env.WHISPERA_TEST_URL || 'http://127.0.0.1:5190') + '/');
  // The installed version has not been seen yet: the card opens by itself, centered.
  const card=page.getByTestId('syka-whats-new');
  await card.waitFor({timeout:5000});
  await page.getByRole('heading',{name:'Transcribí en tu PC'}).waitFor();
  const box=await card.boundingBox();
  assert.ok(Math.abs(box.x+box.width/2-550)<4 && Math.abs(box.y+box.height/2-380)<4,'The card is centered');
  // Every page: arrows forward, the last offers Empezar, Atrás goes back.
  for(const title of ['Elegí tu motor','Chau “Gracias” fantasma','Capturas más fluidas','Tu carpeta, tu color']){
    await card.press('ArrowRight');
    await page.getByRole('heading',{name:title}).waitFor();
  }
  await page.getByRole('button',{name:'Empezar',exact:true}).waitFor();
  await page.getByRole('button',{name:'Atrás',exact:true}).click();
  await page.getByRole('heading',{name:'Capturas más fluidas'}).waitFor();
  await page.getByRole('button',{name:/Ir a Transcribí en tu PC/}).click();
  await page.getByRole('button',{name:'Ahora no',exact:true}).click();
  await card.waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('whispera.whatsNew.seen')),'0.2.15');
  // Seen: it does not open again for the same version, and Ver novedades reopens it.
  await page.reload();
  await page.waitForTimeout(1500);
  assert.equal(await card.count(),0,'Seen versions stay closed');
  await page.getByRole('button',{name:'Actualizaciones',exact:true}).click();
  await page.getByRole('button',{name:'Ver novedades',exact:true}).click();
  await page.getByRole('heading',{name:'Transcribí en tu PC'}).waitFor();
  await page.keyboard.press('Escape');
  await card.waitFor({state:'detached'});
  assert.deepEqual(errors,[]);
  console.log('PASS: What\'s new opens once per installed version, centered, through every page; Ahora no, Escape and Ver novedades work (mocked IPC).');
} finally {await browser.close();}
