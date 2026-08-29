import {$} from './world.js';

/* declarative control registry (ADR-008): sliders are data; the stagehand
   console DOM is generated. Adding magic = one defineControl. */
export const controlDefs=[],controlMap=new Map();
export function defineControl(def){def.fmt=def.fmt||(v=>String(v));controlDefs.push(def);controlMap.set(def.id,def);return def;}
export const val=id=>{const d=controlMap.get(id);return d?d.value:0;};

export function buildConsole(){
  const host=$('#consoleGroups');if(!host)return;
  const groups=new Map();
  for(const def of controlDefs){
    let g=groups.get(def.group);
    if(!g){const fs=document.createElement('fieldset');const lg=document.createElement('legend');lg.textContent=def.group;const grid=document.createElement('div');grid.className='grid';fs.append(lg,grid);groups.set(def.group,{fs,grid});g=groups.get(def.group);}
    const wrap=document.createElement('div');wrap.className='ctrl';
    const lab=document.createElement('label');
    const name=document.createElement('span');name.textContent=def.label;
    const out=document.createElement('output');out.id=def.id+'Out';out.textContent=def.fmt(def.value);
    lab.append(name,out);
    const inp=document.createElement('input');inp.type='range';inp.min=def.min;inp.max=def.max;inp.step=def.step||1;inp.value=def.value;
    inp.addEventListener('input',()=>{def.value=Number(inp.value);out.textContent=def.fmt(def.value);if(def.onChange)def.onChange(def.value);});
    wrap.append(lab,inp);g.grid.appendChild(wrap);
  }
  for(const g of groups.values())host.appendChild(g.fs);
}
export function refreshOutputs(){for(const def of controlDefs){const out=$('#'+def.id+'Out');if(out)out.textContent=def.fmt(def.value);}}
export function setControlValue(id,v){
  const d=controlMap.get(id);if(!d)return false;
  d.value=v;if(d.onChange)d.onChange(v);refreshOutputs();return true;
}
