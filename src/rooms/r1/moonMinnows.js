import * as THREE from 'three';
import {R1} from './constants.js';
import {state} from '../../core/state.js';
import {val,defineControl} from '../../core/controls.js';
import {clamp,rnd} from '../../core/utils.js';
import {SEA_GLASS} from './artDirection.js';
import {foods,nearestFood,removeFood} from './food.js';
import {fish,predators as sharks} from './troupe.js';

/* ═══ MOON MINNOWS — the living lantern (v9 centerpiece) ═══
   A bait ball of small silver-blue fish circling the moonstone.
   Behavior: hold the breathing shell around the core, swirl with the
   current, flee sharks, nibble pellets. Eaten minnows re-hatch at the
   plant bed (grow-in). Moon-glow intensifies during Shadow play. */

const LEN=.38;
defineControl({id:'ballSize',label:'Moon minnows',group:'Ecosystem',min:24,max:120,step:2,value:88,fmt:v=>String(v)});
export const minnows=[];
let fishGroup=null;
let pendingHatch=0;
const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();

function buildMesh(){
  const group=new THREE.Group(),rings=22,sides=10,pos=[],idx=[],u=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),x=.19-.38*q;
    let r=q<.2?.018+.03*Math.sin(q/.2*Math.PI*.5):.048*(1-(q-.2)/.8*.8);
    const rz=r*(.5-.05*q);
    for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;pos.push(x,Math.sin(a)*r,Math.cos(a)*rz);u.push(q);}
  }
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();geom.userData.base=new Float32Array(pos);geom.userData.u=new Float32Array(u);
  const body=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:0xb8d4e8,roughness:.25,metalness:.55,emissive:SEA_GLASS,emissiveIntensity:.45}));body.castShadow=true;group.add(body);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.028,.09,6),new THREE.MeshStandardMaterial({color:0x9fc4da,roughness:.4,transparent:true,opacity:.9}));tail.rotation.z=Math.PI/2;tail.position.x=-.18;tail.castShadow=true;group.add(tail);
  const eyeG=new THREE.SphereGeometry(.012,6,4),eyeM=new THREE.MeshBasicMaterial({color:0x0a0f14});
  for(const z of [-.024,.024]){const e=new THREE.Mesh(eyeG,eyeM);e.position.set(.115,.014,z);group.add(e);}
  return{group,geom,tail,body,base:geom.userData.base,us:geom.userData.u};
}

function shellPoint(t,i){
  const R=1.15+.2*Math.sin(t*.5+i*.7);   /* the ball breathes */
  const a=i*2.39996+t*.14;                 /* golden-angle swirl */
  const y=Math.sin(i*1.7+t*.3)*.9;
  return new THREE.Vector3(Math.cos(a)*R,y,Math.sin(a)*R);
}

export function initMoonMinnows(group){
  fishGroup=group;
  syncBall();
}
export function setBallTarget(){syncBall();}

function syncBall(){
  const target=Math.round(val('ballSize'));
  let guard=target*2+4;
  while(minnows.length<target&&guard-->0){
    const m=buildMesh();
    const f={...m,pos:shellPoint(Math.random()*40,minnows.length),vel:new THREE.Vector3(rnd(-.4,.4),rnd(-.15,.15),rnd(-.4,.4)),noise:new THREE.Vector3(),phase:rnd(0,6.28),spawnGrow:0};
    f.body=m.body;
    f.group.scale.setScalar(1);
    fishGroup.add(f.group);minnows.push(f);
  }
  while(minnows.length>target){
    const m=minnows.pop();
    fishGroup.remove(m.group);
    m.geom.dispose();
  }
}

export function nearestMinnow(pos){
  let best=null,bd=Infinity;
  for(const m of minnows){const d=pos.distanceToSquared(m.pos);if(d<bd){bd=d;best=m;}}
  return best;
}
export function despawnMinnow(m){
  const i=minnows.indexOf(m);
  if(i>=0){fishGroup.remove(m.group);m.geom.dispose();minnows.splice(i,1);pendingHatch++;}
}

export function updateMoonMinnows(dt,t){
  /* hatchery: eaten minnows regrow at the plant bed */
  const target=Math.round(val('ballSize'));
  while(pendingHatch>0&&minnows.length<target){
    const m=buildMesh();
    const a=Math.random()*6.28;
    const f={...m,pos:new THREE.Vector3(Math.sin(a)*1.2,-R1.TANK_H*.32,Math.cos(a)*1.2),vel:new THREE.Vector3(rnd(-.3,.3),.1,rnd(-.3,.3)),noise:new THREE.Vector3(),phase:rnd(0,6.28),spawnGrow:1,body:m.body};
    f.group.scale.setScalar(.15);
    fishGroup.add(f.group);minnows.push(f);pendingHatch--;
  }
  if(pendingHatch>0&&minnows.length>=target)pendingHatch=0;

  const sharkList=sharks();
  const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;
  const glow=state.shadowPlay?1.6:.45;
  for(const f of minnows){
    /* seek the breathing shell around the core */
    const s=shellPoint(t,minnows.indexOf(f));
    f.acc=new THREE.Vector3().subVectors(s,f.pos).multiplyScalar(1.6);
    /* swirl with the current */
    f.acc.x+=-f.pos.z*.35;f.acc.z+=f.pos.x*.35;
    f.noise.x=THREE.MathUtils.lerp(f.noise.x,rnd(-1,1),dt*1.2);
    f.acc.addScaledVector(f.noise,.30);
    /* nibble pellets */
    const food=nearestFood({pos:f.pos});
    if(food){B.subVectors(food.pos,f.pos);const d=B.length();if(d<1.1){f.acc.add(B.normalize().multiplyScalar(1.4));if(d<.09)removeFood(food);}}
    /* flee sharks */
    let panic=false;
    for(const p of sharkList){
      B.subVectors(f.pos,p.pos);const d=B.length();
      if(d<1.6&&d>.001){f.acc.add(B.multiplyScalar(2.6*Math.max(0,1.4-d/.4)));panic=true;}
    }
    /* motion */
    f.vel.addScaledVector(f.acc,dt);
    const speed=panic?1.6:.85;
    if(f.vel.length()>speed)f.vel.setLength(speed);
    if(f.vel.length()<.25)f.vel.setLength(.25);
    f.pos.addScaledVector(f.vel,dt);
    const rad=Math.hypot(f.pos.x,f.pos.z),outer=TANK_R-.3,inner=LIGHT_COLUMN_R+.15;
    if(rad>outer){f.pos.x*=outer/rad;f.pos.z*=outer/rad;}if(rad<inner){const s=inner/(rad||.001);f.pos.x*=s;f.pos.z*=s;}
    f.pos.y=clamp(f.pos.y,-TANK_H*.42,TANK_H*.42);
  }

  /* hard separation — every fish owns its space */
  const MR=.055;                                     // moon minnow body radius
  for(let i=0;i<minnows.length;i++)for(let j=i+1;j<minnows.length;j++){
    const a=minnows[i],b=minnows[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=MR*2;
    if(d2>=rr*rr)continue;
    if(d2<1e-6){a.pos.x+=rnd(-.02,.02);b.pos.x-=rnd(-.02,.02);continue;}
    const d=Math.sqrt(d2),push=(rr-d)/d*.5;
    a.pos.x-=dx*push;a.pos.y-=dy*push;a.pos.z-=dz*push;
    b.pos.x+=dx*push;b.pos.y+=dy*push;b.pos.z+=dz*push;
  }
  for(const m of minnows)for(const f of fish){
    const dx=m.pos.x-f.pos.x,dy=m.pos.y-f.pos.y,dz=m.pos.z-f.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=f.radius+MR;
    if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||.001,push=(rr-d)/d;
    m.pos.x+=dx*push;m.pos.y+=dy*push;m.pos.z+=dz*push;
  }

  for(const f of minnows){
    /* visuals */
    f.group.position.copy(f.pos);
    A.copy(f.vel);
    if(A.lengthSq()>.001){
      C.copy(f.pos).add(A);
      f.group.lookAt(fishGroup.localToWorld(C.clone()));
    }
    f.phase+=dt*(3.5+f.vel.length()*4);
    const p=f.geom.attributes.position,base=f.base,us=f.us;
    for(let i=0;i<p.count;i++){const k=i*3,lat=(.002+.006*us[i]+.03*Math.pow(us[i],2.6))*Math.sin(f.phase-us[i]*6.2);p.array[k+2]=base[k+2]+lat;}
    p.needsUpdate=true;f.tail.rotation.y=-Math.sin(f.phase-6.2)*.5;
    f.body.material.emissiveIntensity=glow;
    if(f.spawnGrow>0){f.spawnGrow=Math.max(0,f.spawnGrow-dt*.9);f.group.scale.setScalar(1-f.spawnGrow*.85);}
  }
}
