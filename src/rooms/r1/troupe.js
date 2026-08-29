import * as THREE from 'three';
import {clone as skClone} from 'three/addons/utils/SkeletonUtils.js';
import {R1} from './constants.js';
import {state} from '../../core/state.js';
import {assets,loadFishPack} from '../../core/assets.js';
import {val} from '../../core/controls.js';
import {clamp,rnd} from '../../core/utils.js';
import {SEA_GLASS,EMISSIVE_LIFT,COLLISION_LOOSE} from './artDirection.js';
import {SPECIES,speciesForIndex} from './speciesCatalog.js';
import {foods,nearestFood,removeFood} from './food.js';

/* R1.D03 livestock: GLB species troupe (Phase 2). Boids + phototaxis + vortex
   brain unchanged from the procedural era; bodies are normalized SkeletonUtils
   clones of the Quaternius pack driven by AnimationMixer swim clips whose
   timeScale is beat-linked to velocity. Fish↔fish hard collision included. */
export const fish=[];
let fishGroup=null;
let templates=null; // Map(id -> {scene, animations})
const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),XAXIS=new THREE.Vector3(1,0,0);

export function initTroupe(group){
  fishGroup=group;
  loadFishPack().then(list=>{
    templates=buildTemplates(list);
    syncFish();
  });
}

function buildTemplates(list){
  const byFile=new Map(list.map(e=>[e.file,e]));
  const out=new Map();
  for(const s of SPECIES){
    const entry=byFile.get(s.file);
    if(!entry)continue;
    const spec=entry.scene;
    const box=new THREE.Box3().setFromObject(spec);
    const size=box.getSize(new THREE.Vector3());
    const fit=s.length/Math.max(size.x,size.y,size.z,1e-6);
    spec.scale.setScalar(fit);
    const center=box.getCenter(new THREE.Vector3()).multiplyScalar(fit);
    spec.position.set(-center.x,-center.y,-center.z);
    out.set(s.id,{scene:spec,animations:entry.animations||[]});
  }
  return out;
}

function randomFishPosition(){const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;const a=rnd(0,6.28),r=rnd(LIGHT_COLUMN_R+.52,TANK_R-.42);return new THREE.Vector3(Math.sin(a)*r,rnd(-TANK_H*.39,TANK_H*.39),Math.cos(a)*r);}

export function createFish(species){
  if(!templates||!fishGroup)return;
  const tmpl=templates.get(species.id);
  if(!tmpl)return;
  const inst=skClone(tmpl.scene);
  const materials=[];
  inst.traverse(o=>{
    if(!o.isMesh||!o.material)return;
    o.castShadow=true;
    const src=(Array.isArray(o.material)?o.material:[o.material]).filter(Boolean);
    if(!src.length)return;
    const clones=src.map(m=>{
      const c=m.clone();
      if(!c.emissive)return c;
      if(c.emissive.getHex()===0&&c.color)c.emissive.copy(c.color);
      c.emissiveIntensity=EMISSIVE_LIFT;
      return c;
    });
    o.material=Array.isArray(o.material)?clones:clones[0];
    materials.push(...clones);
  });
  const wrap=new THREE.Group();wrap.add(inst);
  const variance=rnd(.85,1.15);
  const size=species.length*variance;
  const f={species:species.id,wrapper:wrap,inst,mixer:null,materials,size,baseScale:variance,radius:size*.3,
    pos:randomFishPosition(),vel:new THREE.Vector3(rnd(-1,1),rnd(-.25,.25),rnd(-1,1)).normalize().multiplyScalar(rnd(.38,.68)*species.speed),
    acc:new THREE.Vector3(),wander:new THREE.Vector3(rnd(-1,1),rnd(-.4,.4),rnd(-1,1)).normalize(),noise:new THREE.Vector3(),
    phase:rnd(0,6.28),decision:rnd(.25,1.2),state:'cruise',food:null,preferred:rnd(.40,.65)*species.speed};
  const clip=(tmpl.animations||[]).find(a=>/swim/i.test(a.name))||(tmpl.animations||[])[0]||null;
  if(clip){f.mixer=new THREE.AnimationMixer(inst);f.action=f.mixer.clipAction(clip);f.action.play();}
  wrap.scale.setScalar(f.baseScale*val('fishScale')/100);
  fishGroup.add(wrap);fish.push(f);
}

/* per-instance clones share template geometry/skeletons — removing the
   wrapper is enough; never disposeTree a clone (it would kill the template) */
export function syncFish(){
  if(!templates)return;
  const target=Math.round(val('fishCount'));
  let guard=target*2+4;
  while(fish.length<target&&guard-->0){
    const before=fish.length;
    createFish(speciesForIndex(fish.length));
    if(fish.length===before)break; // a species failed to build — never spin forever
  }
  while(fish.length>target){
    const f=fish.pop();
    fishGroup.remove(f.wrapper);
  }
}
export function setGlow(v){const k=v/100*2.2;for(const f of fish)for(const m of f.materials){if(!m.emissive)continue;if(m.emissive.getHex()===0&&m.color)m.emissive.copy(m.color);m.emissiveIntensity=k;}}
export function setScale(v){for(const f of fish){f.wrapper.scale.setScalar(f.baseScale*v/100);f.radius=f.size*.3*(v/100);}}

export function updateAll(dt,t){
  collide();
  for(const f of fish)updateFish(f,dt,t);
}

/* hard fish↔fish collision: positional push-out, no interpenetration */
function collide(){
  for(let i=0;i<fish.length;i++)for(let j=i+1;j<fish.length;j++){
    const a=fish[i],b=fish[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz;
    const rr=(a.radius+b.radius)*COLLISION_LOOSE;
    if(d2>=rr*rr)continue;
    if(d2<1e-6){a.pos.x+=rnd(-.03,.03);a.pos.y+=rnd(-.02,.02);b.pos.x-=rnd(-.03,.03);continue;}
    const d=Math.sqrt(d2),push=(rr-d)/d*.5;
    a.pos.x-=dx*push;a.pos.y-=dy*push;a.pos.z-=dz*push;
    b.pos.x+=dx*push;b.pos.y+=dy*push;b.pos.z+=dz*push;
  }
}

function aquariumBoundsForce(f){
  const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;
  const p=C.copy(f.pos).addScaledVector(f.vel,.75),rad=Math.hypot(p.x,p.z),outer=TANK_R-.34,inner=LIGHT_COLUMN_R+.30,force=new THREE.Vector3();
  if(rad>outer-.34){const nx=p.x/(rad||1),nz=p.z/(rad||1),s=(rad-(outer-.34))*8;force.x-=nx*s;force.z-=nz*s;}
  if(rad<inner+.28){const nx=p.x/(rad||1),nz=p.z/(rad||1),s=(inner+.28-rad)*9;force.x+=nx*s;force.z+=nz*s;}
  const ymax=TANK_H*.43;if(p.y>ymax-.35)force.y-=(p.y-(ymax-.35))*8;if(p.y<-ymax+.35)force.y+=(-ymax+.35-p.y)*8;
  return force;
}
function social(f){const align=new THREE.Vector3(),cohere=new THREE.Vector3(),sep=new THREE.Vector3();let n=0;const sch=state.shadowPlay?Math.min(1,val('schooling')/100+.30):val('schooling')/100;for(const o of fish){if(o===f)continue;B.subVectors(o.pos,f.pos);const d=B.length();if(d>.001&&d<1.45){n++;align.add(o.vel);cohere.add(o.pos);if(d<.30)sep.addScaledVector(B.normalize(),-.7);}}if(n){align.divideScalar(n).normalize().multiplyScalar(sch*.68);cohere.divideScalar(n).sub(f.pos).normalize().multiplyScalar(sch*.33);}return align.add(cohere).add(sep);}
function currentField(p,t){const s=.12;return new THREE.Vector3((Math.sin(p.y*.8+t*.31)+Math.cos(p.z*1.4-t*.22))*.035*s,Math.sin(p.x*1.2+t*.19)*.018*s,(Math.cos(p.x*1.3-t*.27)+Math.sin(p.y*.7+t*.23))*.035*s);}
export function updateFish(f,dt,t){
  const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;
  f.decision-=dt;if(f.decision<=0){f.decision=rnd(.25,1.25);const food=nearestFood(f);if(food){f.state='feed';f.food=food;}else{f.state=Math.random()<.18?'explore':'cruise';f.wander.set(rnd(-1,1),rnd(-.45,.45),rnd(-1,1)).normalize();}}
  f.noise.x=THREE.MathUtils.lerp(f.noise.x,rnd(-1,1),dt*.7);f.noise.y=THREE.MathUtils.lerp(f.noise.y,rnd(-.5,.5),dt*.7);f.noise.z=THREE.MathUtils.lerp(f.noise.z,rnd(-1,1),dt*.7);
  f.acc.set(0,0,0).add(aquariumBoundsForce(f)).add(social(f)).add(currentField(f.pos,t)).addScaledVector(f.noise,.08);
  const pull=state.shadowPlay?1.35:val('lightPull')/100;
  if(pull>0){f.acc.x+=-f.pos.x*pull*.16;f.acc.z+=-f.pos.z*pull*.16;const sw=state.shadowPlay?.5:.11*pull;f.acc.x+=-f.pos.z*sw;f.acc.z+=f.pos.x*sw;}
  f.acc.y-=(val('gravity')/100-1)*.25;
  if(f.state==='feed'&&f.food&&foods.includes(f.food)){B.subVectors(f.food.pos,f.pos);const d=B.length();f.acc.add(B.normalize().multiplyScalar(1.05));if(d<.12){removeFood(f.food);f.food=null;f.state='cruise';}}
  else if(f.state==='explore')f.acc.addScaledVector(f.wander,.20);
  const act=val('activity')/100;f.vel.addScaledVector(f.acc,dt);let target=f.preferred*act;if(f.state==='feed')target=1.15*act;if(state.shadowPlay)target=Math.max(target,1.0*Math.max(act,.8));if(f.vel.length()>.001){B.copy(f.vel).normalize().multiplyScalar(target);f.vel.lerp(B,Math.min(1,dt*(f.state==='feed'?4.2:1.4)));}if(f.vel.length()>1.45*act)f.vel.setLength(1.45*act);f.vel.multiplyScalar(1-dt*.05);f.pos.addScaledVector(f.vel,dt);
  const rad=Math.hypot(f.pos.x,f.pos.z),outer=TANK_R-.22,inner=LIGHT_COLUMN_R+.22;if(rad>outer){f.pos.x*=outer/rad;f.pos.z*=outer/rad;}if(rad<inner){const s=inner/(rad||.001);f.pos.x*=s;f.pos.z*=s;}f.pos.y=clamp(f.pos.y,-TANK_H*.43,TANK_H*.43);
  f.wrapper.position.copy(f.pos);
  A.copy(f.vel);if(A.lengthSq()>.001){
    C.copy(f.pos).addScaledVector(A.normalize(),.6);
    f.wrapper.lookAt(fishGroup.localToWorld(C.clone()));
  }
  if(f.mixer){
    f.mixer.timeScale=clamp(.5+f.vel.length()*1.4,.3,2.4);
    f.mixer.update(dt);
  }
}
