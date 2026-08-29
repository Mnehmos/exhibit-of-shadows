#!/usr/bin/env node
/* drift_audit.mjs — Silo Engine orientation tool (ADR-006).
   Recomputes alignment between code (index.html + src/), inventory
   (CATALOG.md), plan (ORCHESTRATION.md), and README.md. Run from project root:
       node tools/audit.mjs
   Exit 0 = oriented, exit 1 = drift. */
import {readFileSync,writeFileSync,unlinkSync,readdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const read=f=>{try{return readFileSync(path.join(root,f),'utf8');}catch{return null;}};
let fails=0,oks=0;
const ok=m=>{oks++;console.log('  [ok]    '+m);};
const drift=m=>{fails++;console.log('  [DRIFT] '+m);};
const section=t=>console.log('\n'+t);

const html=read('index.html'),catalog=read('CATALOG.md'),orch=read('ORCHESTRATION.md'),readme=read('README.md'),decisions=read('DECISIONS.md');
for(const[f,doc] of [['index.html',html],['CATALOG.md',catalog],['ORCHESTRATION.md',orch],['README.md',readme],['DECISIONS.md',decisions]])
  doc?ok(`present: ${f}`):drift(`missing file: ${f}`);
if(!html||!catalog)process.exit(1);

function walkJS(dir){
  let out=[];
  for(const e of readdirSync(path.join(root,dir),{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory())out=out.concat(walkJS(p));
    else if(e.name.endsWith('.js'))out.push({path:p,code:readFileSync(path.join(root,p),'utf8')});
  }
  return out;
}

section('code ↔ syntax');
if(!/script type="module" src="src\/main\.js"/.test(html))drift('index.html does not load src/main.js');
else ok('index.html loads src/main.js');
let jsFiles=[],syntaxBad=0;
try{jsFiles=walkJS('src');}
catch{drift('src/ tree missing');process.exit(1);}
if(!jsFiles.length){drift('src/ has no .js files');process.exit(1);}
const tmp=path.join(process.env.TEMP||process.env.TMP||'/tmp','silo-audit-check.mjs');
for(const f of jsFiles){
  try{writeFileSync(tmp,f.code);execFileSync(process.execPath,['--check',tmp]);ok(`parses: ${f.path}`);}
  catch(e){syntaxBad++;drift(`syntax: ${f.path}`);}
}
unlinkSync(tmp);
const js=jsFiles.map(f=>`\n/* ${f.path} */\n${f.code}`).join('\n');

section('catalog → code (every italic code ref must exist)');
const refAllow=new Set(['italics']);
for(const r of [...new Set([...catalog.matchAll(/\*(\w+)\*/g)].map(m=>m[1]))]){
  if(refAllow.has(r)||/^[A-Z_]+$/.test(r))continue;
  new RegExp('\\b'+r+'\\b').test(js)?ok(`*${r}*`):drift(`catalog ref *${r}* not found in src/`);
}

section('code → plan (rooms and section tags must be documented)');
const docs=catalog+(orch||'');
const manifest=/const roomManifest=([\s\S]*?);/.exec(js);
if(!manifest){drift('roomManifest block not found');}
else for(const room of [...new Set([...manifest[1].matchAll(/id:'([^']+)'/g)].map(m=>m[1]))])
  docs.includes(room)?ok(`room id '${room}' documented`):drift(`room id '${room}' not in CATALOG/ORCHESTRATION`);
for(const tag of [...new Set([...js.matchAll(/R1\.([A-E])\b/g)].map(m=>'R1.'+m[1]))].sort())
  docs.includes(tag)?ok(`section tag ${tag} documented`):drift(`section tag ${tag} not in CATALOG/ORCHESTRATION`);

section('structural invariants');
/const roomManifest=/.test(js)?ok('roomManifest declared (plugin load order)'):drift('roomManifest missing');
/applyShadowCasting/.test(js)?ok('shadow discipline pass present (ADR-004)'):drift('applyShadowCasting missing');
/const controlDefs=/.test(js)?ok('declarative control registry present (ADR-008)'):drift('control registry missing');
const controls=['fishCount','activity','schooling','lightPull','plants','lightPower','shadowSoft','galleryLight','walkSpeed','gravity','timeScale','glow','fishScale'];
const missing=controls.filter(id=>!js.includes(`id:'${id}'`));
missing.length?drift('controls not declared: '+missing.join(', ')):ok(`all ${controls.length} controls declared (9 hall + 4 magic)`);
html.includes('id="consoleGroups"')?ok('console DOM mount present'):drift('consoleGroups container missing');
const openN=(html.match(/<div\b/g)||[]).length,closeN=(html.match(/<\/div>/g)||[]).length;
openN===closeN?ok(`div balance (${openN}/${closeN})`):drift(`div imbalance (${openN} open / ${closeN} close)`);

section('docs cross-links');
for(const d of ['CATALOG.md','ASSETS.md','ORCHESTRATION.md','DECISIONS.md'])
  readme&&readme.includes(d)?ok('README references '+d):drift('README does not reference '+d);

section('plan snapshot');
for(const ph of [...(orch||'').matchAll(/^### (Phase \d[^\n]*)$/gm)])
  console.log('  · '+ph[1].replace(/ — [◐✅].*/,'  [STARTED/DONE]'));

section(fails?`AUDIT FAILED — ${fails} drift / ${oks} ok`:`AUDIT PASS — ${oks} ok, 0 drift (${jsFiles.length} modules)`);
process.exit(fails?1:0);
