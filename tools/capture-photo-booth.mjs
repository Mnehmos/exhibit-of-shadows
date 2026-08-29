/* Capture one normalized side-profile PNG per GLB in the specimen booth.
   usage: node tools/capture-photo-booth.mjs [--url=http://127.0.0.1:8137]
          [--out=evidence/specimens] [--files=clownfish.glb,hero-clownfish.procedural] */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

function argument(name,fallback){const prefix=`--${name}=`;const found=process.argv.find(v=>v.startsWith(prefix));return found?found.slice(prefix.length):fallback;}
const baseUrl=argument('url','http://127.0.0.1:8137'),outputDirectory=resolve(process.cwd(),argument('out','evidence/specimens'));
const requested=new Set(argument('files','').split(',').filter(Boolean));
await mkdir(outputDirectory,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--hide-scrollbars','--force-device-scale-factor=1','--force-color-profile=srgb','--disable-lcd-text','--no-proxy-server']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});page.setDefaultTimeout(90000);page.on('pageerror',e=>console.error('PAGEERROR',e.message));
  await page.goto(`${baseUrl}/photo-booth.html`,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForFunction(()=>window.__photoBooth?.ready===true,undefined,{timeout:60000});
  const available=await page.evaluate(()=>window.__photoBooth.files);
  const files=requested.size?available.filter(file=>requested.has(file)):available,captures=[];
  const missing=[...requested].filter(file=>!available.includes(file));
  if(missing.length)throw new Error(`Unknown specimen filter: ${missing.join(', ')}`);
  for(const file of files){
    await page.evaluate(name=>{window.__photoBooth.setSpin(false);window.__photoBooth.setView('side');window.__photoBooth.select(name);},file);
    await page.waitForFunction(name=>document.body.dataset.boothState==='settled'&&window.__photoBooth.stats()?.file===name,file);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const png=file.replace(/\.glb$/i,'').replace(/[^a-z0-9._-]+/gi,'-')+'.png';await page.locator('#mount canvas[aria-label]').screenshot({path:resolve(outputDirectory,png),animations:'allow',timeout:90000});captures.push({file,png,stats:await page.evaluate(()=>window.__photoBooth.stats())});
  }
  await writeFile(resolve(outputDirectory,'manifest.json'),JSON.stringify({baseUrl,captures},null,2));console.log(`PHOTO BOOTH PASS — ${captures.length} isolated specimens`);
}catch(e){console.error('PHOTO BOOTH FAILED:',e.message);process.exitCode=2;}finally{await browser.close();}
