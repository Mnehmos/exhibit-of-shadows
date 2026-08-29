/* capture runner — Plant Forge pattern (scripts/capture-plant-lab.mjs).
   Drives the exhibit through scenarios × camera presets via the
   window.__aquarium API and writes PNG evidence + a JSON manifest.
   usage: node tools/capture-exhibit.mjs [--url=http://127.0.0.1:8137]
        [--scenarios=default,shadowplay,feeding,magic]
        [--views=front,quarter,closeup,overhead,wide]
        [--out=evidence/captures/exhibit-review] */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

function argument(name,fallback){
  const prefix=`--${name}=`;
  const found=process.argv.find(v=>v.startsWith(prefix));
  return found?found.slice(prefix.length):fallback;
}

const baseUrl=argument('url','http://127.0.0.1:8137');
const scenarios=argument('scenarios','default,shadowplay,feeding,magic').split(',').filter(Boolean);
const views=argument('views','front,quarter,closeup').split(',').filter(Boolean);
const settleMs=Number(argument('settle','2500'));
const outputDirectory=resolve(process.cwd(),argument('out','evidence/captures/exhibit-review'));
const stamp=new Date().toISOString().slice(0,10);

await mkdir(outputDirectory,{recursive:true});
/* watchdog: an orphaned headless Chromium software-rendering the exhibit pins
   the CPU (K-9) — force-exit instead of hanging the machine */
const WATCHDOG_MS=150000;
const watchdog=setTimeout(()=>{
  console.error(`WATCHDOG: capture run exceeded ${WATCHDOG_MS}ms — force exit`);
  process.exit(3);
},WATCHDOG_MS);
const browser=await chromium.launch({
  headless:true,
  args:[
    '--use-angle=swiftshader',
    '--use-gl=angle',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--force-color-profile=srgb',
    '--disable-lcd-text',
    '--no-proxy-server',
  ],
});

try{
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  page.on('pageerror',e=>console.error('PAGEERROR',e.message));
  page.on('requestfailed',r=>console.error('REQFAIL',r.url(),r.failure()?.errorText));
  const started=performance.now();
  await page.goto(`${baseUrl}/`,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__aquarium?.ready===true&&document.body.dataset['labState']==='ready',undefined,{timeout:60000});
  const readyMs=Math.round(performance.now()-started);
  const captures=[];

  for(const scenario of scenarios){
    let applied=false;
    try{applied=await page.evaluate(name=>window.__aquarium.setScenario(name),scenario);}
    catch(e){console.error('SCENARIO FAIL',scenario,'\n'+e.message.split('\n').slice(0,6).join('\n'));captures.push({scenario,skipped:true,error:e.message.split('\n')[0]});continue;}
    const steps=Number(argument('steps','0'));
    if(steps>0)await page.evaluate(n=>window.__aquarium.step(n),steps);
    await page.waitForFunction(()=>document.body.dataset['labState']==='settled',undefined,{timeout:15000}).catch(()=>{});
    await page.waitForTimeout(settleMs);
    for(const view of views){
      await page.evaluate(name=>{window.__aquarium.capturePreset(name);},view);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const stats=await page.evaluate(()=>window.__aquarium.stats());
      const file=`${stamp}-${scenario}-${view}.png`;
      await page.screenshot({path:resolve(outputDirectory,file),animations:'disabled'});
      captures.push({scenario,view,file,stats});
    }
  }

  process.stdout.write(JSON.stringify({readyMs,baseUrl,viewport:{width:1280,height:800},outputDirectory,captures},null,2)+'\n');
  clearTimeout(watchdog);
}catch(e){
  clearTimeout(watchdog);
  console.error('CAPTURE FAILED:',e.message);
  process.exitCode=2;
}finally{
  await browser.close();
  setTimeout(()=>process.exit(process.exitCode||0),500);
}
