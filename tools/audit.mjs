#!/usr/bin/env node
/* drift_audit.mjs — Silo Engine orientation tool (ADR-006).
   Recomputes alignment between code (index.html), inventory (CATALOG.md),
   plan (ORCHESTRATION.md), and README.md. Run from project root:
       node tools/audit.mjs
   Exit 0 = oriented, exit 1 = drift. */
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const read=f=>{try{return readFileSync(path.join(root,f),'utf8');}catch{return null;}};
let fails=0,oks=0;
const ok=m=>{oks++;console.log('  [ok]    '+m);};
const drift=m=>{fails++;console.log('  [DRIFT] '+m);};
const section=t=>console.log('\n'+t);

const html=read('index.html'),catalog=read('CATALOG.md'),orch=read('ORCHESTRATION.md'),readme=read('README.md');
for(const[f,doc] of [['index.html',html],['CATALOG.md',catalog],['ORCHESTRATION.md',orch],['README.md',readme],['DECISIONS.md',read('DECISIONS.md')]])
  doc?ok(`present: ${f}`):drift(`missing file: ${f}`);
if(!html||!catalog)process.exit(1);

section('code ↔ syntax');
const sm=/<script type="module">([\s\S]*?)<\/script>/.exec(html);
if(!sm){drift('module script missing');process.exit(1);}
const js=sm[1];
const tmp=path.join(process.env.TEMP||process.env.TMP||'/tmp','silo-audit-check.mjs');
try{writeFileSync(tmp,js);execFileSync(process.execPath,['--check',tmp]);unlinkSync(tmp);ok('module script parses (node --check)');}
catch(e){drift('module script fails node --check');console.error(String(e).slice(0,500));}

section('catalog → code (every italic code ref must exist)');
const refAllow=new Set(['italics']);              // prose words that merely use italics
for(const r of [...new Set([...catalog.matchAll(/\*(\w+)\*/g)].map(m=>m[1]))]){
  if(refAllow.has(r)||/^[A-Z_]+$/.test(r))continue; // skip prose + STATUS WORDS
  new RegExp('\\b'+r+'\\b').test(js)?ok(`*${r}*`):drift(`catalog ref *${r}* not found in code`);
}

section('code → plan (rooms and section tags must be documented)');
const docs=catalog+(orch||'');
for(const room of [...new Set([...js.matchAll(/id:'([^']+)'/g)].map(m=>m[1]))])
  docs.includes(room)?ok(`room id '${room}' documented`):drift(`room id '${room}' not in CATALOG/ORCHESTRATION`);
for(const tag of [...new Set([...js.matchAll(/R1\.([A-E])\b/g)].map(m=>'R1.'+m[1]))].sort())
  docs.includes(tag)?ok(`section tag ${tag} documented`):drift(`section tag ${tag} not in CATALOG/ORCHESTRATION`);

section('structural invariants');
/const roomManifest=/.test(js)?ok('roomManifest declared (plugin load order)'):drift('roomManifest missing');
/applyShadowCasting/.test(js)?ok('shadow discipline pass present (ADR-004)'):drift('applyShadowCasting missing');
const sliders=['fishCount','activity','schooling','lightPull','plants','lightPower','shadowSoft','galleryLight','walkSpeed'];
const missing=sliders.filter(id=>!html.includes(`id="${id}"`));
missing.length?drift('stagehand sliders missing from DOM: '+missing.join(', ')):ok('all 9 stagehand sliders present');
const openN=(html.match(/<div\b/g)||[]).length,closeN=(html.match(/<\/div>/g)||[]).length;
openN===closeN?ok(`div balance (${openN}/${closeN})`):drift(`div imbalance (${openN} open / ${closeN} close)`);

section('docs cross-links');
for(const d of ['CATALOG.md','ASSETS.md','ORCHESTRATION.md','DECISIONS.md'])
  readme&&readme.includes(d)?ok('README references '+d):drift('README does not reference '+d);

section('plan snapshot');
for(const ph of [...(orch||'').matchAll(/^### (Phase \d[^\n]*)$/gm)])
  console.log('  · '+ph[1].replace(/ — ✅.*/,'  [DONE]'));

section(fails?`AUDIT FAILED — ${fails} drift / ${oks} ok`:`AUDIT PASS — ${oks} ok, 0 drift`);
process.exit(fails?1:0);
