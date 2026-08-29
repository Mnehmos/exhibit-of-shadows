import * as THREE from 'three';
import {R1} from './constants.js';
import {state} from '../../core/state.js';
import {val,defineControl} from '../../core/controls.js';
import {clamp,rnd} from '../../core/utils.js';
import {SEA_GLASS} from './artDirection.js';
import {foods,nearestFood,removeFood} from './food.js';
import {fish,predators as getSharks} from './troupe.js';

/* ═══ MOON MINNOWS — tendencies, not rules (v9.6) ═══
   Couzin-style zones scaled to fish size:
     repulsion .19 · alignment .52 · attraction 1.15
   Every weight carries per-fish variance (space/social/bold/dart/depth).
   A gentle home pull keeps ONE school; a tangential term makes it swirl.
   Eaten minnows re-hatch at the plant bed (grow-in). */

const LEN=.38;
const DART_TIME=.32;
const MR=.055;
let ballClock=0;
defineControl({id:'ballSize',label:'Moon minnows',group:'Ecosystem',min:32,max:120,step:2,value:88,fmt:v=>String(v)});
export const minnows=[];
let fishGroup=null;
let pendingHatch=0;
const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),D=new THREE.Vector3();

/* the school's own drifting center — never pinned to the light */
const ballCenter=new THREE.Vector3(2.1,.3,1.4);

function buildMesh(){
  const group=new THREE.Group(),rings=22,sides=10,pos=[],idx=[],u=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),x=.19-.38*q;
    let r=q<.2?.02+.034*Math.sin(q/.2*Math.PI*.5):.052*(1-(q-.2)/.8*.8);
    const rz=r*(.5-.05*q);
    for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;pos.push(x,Math.sin(a)*r,Math.cos(a)*rz);u.push(q);}
  }
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();geom.userData.base=new Float32Array(pos);geom.userData.u=new Float32Array(u);
  const body=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:0xb8d4e8,roughness:.25,metalness:.55,emissive:SEA_GLASS,emissiveIntensity:.45}));body.castShadow=true;group.add(body);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.03,.1,6),new THREE.MeshStandardMaterial({color:0x9fc4da,roughness:.4,transparent:true,opacity:.9}));tail.rotation.z=Math.PI/2;tail.position.x=-.2;tail.castShadow=true;group.add(tail);
  const eyeG=new THREE.SphereGeometry(.013,6,4),eyeM=new THREE.MeshBasicMaterial({color:0x0a0f14});
  for(const z of [-.026,.026]){const e=new THREE.Mesh(eyeG,eyeM);e.position.set(.125,.015,z);group.add(e);}
  return{group,geom,tail,body,base:geom.userData.base,us:geom.userData.u};
}

function spawn(at,grow){
  const m=buildMesh();
  const f={...m,bold:rnd(.15,.95),
    space:.7+rnd(0,.7),
    social:.7+rnd(0,.6),
    dart:rnd(.5,1.3),
    depth:rnd(-.75,.75),
    panic:0,hunger:rnd(.2,.8),dartT:0,
    dartDir:new THREE.Vector3(rnd(-1,1),rnd(-.3,.3),rnd(-1,1)).normalize(),
    companions:[],
    pos:at?at.clone():ballPoint(),vel:new THREE.Vector3(rnd(-.5,.5),rnd(-.2,.2),rnd(-.5,.5)),
    acc:new THREE.Vector3(),noise:new THREE.Vector3(),phase:rnd(0,6.28),
    spawnGrow:grow?1:0,body:m.body};
  if(minnows.length){
    f.companions=[minnows[Math.floor(Math.random()*minnows.length)],minnows[Math.floor(Math.random()*minnows.length)]];
  }
  f.group.scale.setScalar(grow?.15:1);
  fishGroup.add(f.group);minnows.push(f);
  return f;
}
function ballPoint(){const a=rnd(0,6.28);return new THREE.Vector3(ballCenter.x+Math.sin(a)*rnd(.2,1.2),ballCenter.y+rnd(-.8,.8),ballCenter.z+Math.cos(a)*rnd(.2,1.2));}

export function initMoonMinnows(group){
  fishGroup=group;
  for(let i=0;i<Math.round(val('ballSize'));i++)spawn(null,false);
  for(const f of minnows){
    const others=minnows.filter(o=>o!==f);
    if(others.length>1)f.companions=[others[Math.floor(Math.random()*others.length)],others[Math.floor(Math.random()*others.length)]];
  }
}
export function setBallTarget(){syncBall();}

export function syncBall(){
  const target=Math.round(val('ballSize'));
  let guard=target*2+4;
  while(minnows.length<target&&guard-->0)spawn(ballPoint(),true);
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
    const a=Math.random()*6.28;
    const f=spawn(new THREE.Vector3(Math.sin(a)*2.2,-R1.TANK_H*.32,Math.cos(a)*2.2),true);
    f.hunger=rnd(.5,1);
  }
  if(pendingHatch>0&&minnows.length>=target)pendingHatch=0;

  /* the school's center wanders its own slow path — never onto the light */
  ballClock+=dt;
  ballCenter.set(
    2.1+Math.sin(ballClock*.05)*1.1+Math.sin(ballClock*.023)*.5,
    Math.sin(ballClock*.07)*.55,
    Math.cos(ballClock*.041)*1.5+Math.sin(ballClock*.017)*.8
  );
  const bcl=ballCenter.length();
  if(bcl<1.9)ballCenter.multiplyScalar(1.9/bcl);

  const sharks=getSharks();
  const {TANK_R,TANK_H}=R1;
  const glow=state.shadowPlay?1.55:.45;

  /* zero the force accumulators */
  for(const f of minnows)f.acc.set(0,0,0);

  /* ═ pairwise zones (scaled to fish size) ═ */
  for(let i=0;i<minnows.length;i++)for(let j=i+1;j<minnows.length;j++){
    const a=minnows[i],b=minnows[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz;
    if(d2>1.25*1.25)continue;
    const d=Math.sqrt(d2)||.001,nx=dx/d,ny=dy/d,nz=dz/d;

    if(d<.19){                                        /* repulsion */
      const k=(.19-d)/.19*(1.1*a.space+.6);
      a.acc.x-=nx*k;a.acc.y-=ny*k;a.acc.z-=nz*k;
      b.acc.x+=nx*k;b.acc.y+=ny*k;b.acc.z+=nz*k;
    }
    if(d<.52){                                        /* alignment */
      const w=(1-d/.52)*(a.social+b.social)*.45;
      a.acc.x+=(b.vel.x-a.vel.x)*w;a.acc.y+=(b.vel.y-a.vel.y)*w;a.acc.z+=(b.vel.z-a.vel.z)*w;
      b.acc.x+=(a.vel.x-b.vel.x)*w;b.acc.y+=(a.vel.y-b.vel.y)*w;b.acc.z+=(a.vel.z-b.vel.z)*w;
    }
    if(d<1.15){                                       /* attraction (shoalmates pull hardest) */
      const companion=a.companions.includes(b)||b.companions.includes(a);
      const w=(companion?1.4:.55)*(1-d/1.15)*(a.social+b.social)*.4;
      a.acc.x+=nx*w;a.acc.y+=ny*w;a.acc.z+=nz*w;
      b.acc.x-=nx*w;b.acc.y-=ny*w;b.acc.z-=nz*w;
    }
    /* panic contagion — the wave */
    const hi=a.panic>b.panic?a:b,lo=hi===a?b:a;
    if(hi.panic>.5&&d<.65)
      lo.panic=Math.min(1,lo.panic+dt*7*hi.panic*(1-d/.65)*(1.2-lo.bold*.6));
  }

  /* ═ individual tendencies ═ */
  const centroid=new THREE.Vector3();
  for(const f of minnows)centroid.add(f.pos);
  if(minnows.length)centroid.divideScalar(minnows.length);

  for(const f of minnows){
    f.panic=Math.max(0,f.panic-dt*.9);
    f.hunger=Math.min(1,f.hunger+dt*.06*(1.3-f.bold));
    if(f.dartT>0)f.dartT-=dt;

    /* home: gentle pull keeps one school */
    B.subVectors(ballCenter,f.pos);
    f.acc.addScaledVector(B,.5);

    /* moonstone aversion — soft, personal */
    const cd=f.pos.length();
    const avR=.95+f.space*.4;
    if(cd<avR&&cd>.001){
      C.set(-f.pos.x/cd,-f.pos.y/cd,-f.pos.z/cd);
      f.acc.addScaledVector(C,2.1*(avR-cd)/avR);
    }

    /* depth band preference */
    const prefY=f.depth*2.1;
    f.acc.y+=(prefY-f.pos.y)*.22;

    /* sharks — fear raises panic, close shark forces a dart */
    let fleeing=false;
    for(const p of sharks){
      B.subVectors(f.pos,p.pos);
      const d=B.length();
      if(d<1.7&&d>.001){
        const k=(1.7-d)/1.7;
        f.acc.addScaledVector(B.normalize(),2.7*k);
        f.panic=Math.min(1,f.panic+dt*5*k*(1.25-f.bold*.8));
        if(k>.55){f.dartT=Math.max(f.dartT,.26);f.dartDir.copy(B.normalize());fleeing=true;}
      }
    }

    /* random startle — bold fish shrug it off */
    if(f.panic<.2&&Math.random()<dt*.028*(1.3-f.bold)){
      f.panic=Math.min(1,.5+Math.random()*.4);
      f.dartT=DART_TIME*(.6+f.dart*.6);
      f.dartDir.set(rnd(-1,1),rnd(-.3,.3),rnd(-1,1)).normalize();
    }

    /* pellets — hunger pulls */
    if(f.panic<.3&&f.hunger>.35){
      const food=nearestFood({pos:f.pos});
      if(food){
        B.subVectors(food.pos,f.pos);
        const d=B.length();
        if(d<2.4)f.acc.add(B.normalize().multiplyScalar(.8*(.55+f.bold*.65)));
        if(d<.09){removeFood(food);f.hunger*=.3;}
      }
    }

    /* calm wander */
    if(f.panic<.35){
      f.noise.x=THREE.MathUtils.lerp(f.noise.x,rnd(-1,1),dt*1.3);
      f.acc.addScaledVector(f.noise,.4*(.45+f.bold*.55));
    }

    /* panic compress: toward the school's own centroid, skittish hardest */
    if(f.panic>.35)f.acc.addScaledVector(C.subVectors(centroid,f.pos),1.1*f.panic*(1.15-f.bold*.6));

    /* glass aversion */
    const radC=Math.hypot(f.pos.x,f.pos.z),glassR=TANK_R-.5;
    if(radC>glassR-.35){
      const k=(radC-(glassR-.35))/.35;
      f.acc.x-=f.pos.x/radC*2.4*k;f.acc.z-=f.pos.z/radC*2.4*k;
    }
  }

  /* ═ integrate: forward-only swimming, turn-rate limited ═ */
  for(const f of minnows){
    f.vel.addScaledVector(f.acc,dt);
    const sp=f.vel.length();
    const minS=.3,maxS=f.dartT>0?1.9:(f.panic>.5?1.45:.9);
    let desired=f.vel;
    if(sp<minS)desired=f.vel.clone().setLength(minS);
    if(sp>maxS)desired=f.vel.clone().setLength(maxS);
    /* heading can only change so fast — they swim where they face */
    const curA=Math.atan2(f.vel.z,f.vel.x),desA=Math.atan2(desired.z,desired.x);
    let dA=desA-curA;while(dA>Math.PI)dA-=Math.PI*2;while(dA<-Math.PI)dA+=Math.PI*2;
    dA=clamp(dA,-3*dt,3*dt);
    const turnA=curA+dA;
    const len=desired.length();
    f.vel.x=Math.cos(turnA)*len;f.vel.z=Math.sin(turnA)*len;
    f.vel.y=clamp(f.vel.y,-maxS*.4,maxS*.4);
    f.pos.addScaledVector(f.vel,dt);
    f.pos.y=clamp(f.pos.y,-TANK_H*.42,TANK_H*.42);
  }

  /* ═ hard separation — every fish owns its space ═ */
  for(let i=0;i<minnows.length;i++)for(let j=i+1;j<minnows.length;j++){
    const a=minnows[i],b=minnows[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=(a.space+b.space)*.5+.12;
    if(d2>=rr*rr)continue;
    if(d2<1e-6){a.pos.x+=rnd(-.02,.02);b.pos.x-=rnd(-.02,.02);continue;}
    const d=Math.sqrt(d2),push=(rr-d)/d*.5;
    a.pos.x-=dx*push;a.pos.y-=dy*push;a.pos.z-=dz*push;
    b.pos.x+=dx*push;b.pos.y+=dy*push;b.pos.z+=dz*push;
  }
  for(const m of minnows)for(const f of fish){
    const dx=m.pos.x-f.pos.x,dy=m.pos.y-f.pos.y,dz=m.pos.z-f.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=f.radius+MR+.03;
    if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||.001,push=(rr-d)/d;
    m.pos.x+=dx*push;m.pos.y+=dy*push;m.pos.z+=dz*push;
  }

  /* ═ visuals — strictly forward ═ */
  for(const f of minnows){
    f.group.position.copy(f.pos);
    if(f.vel.lengthSq()>.0005){
      A.copy(f.pos).add(f.vel);
      A.y=clamp(A.y,-TANK_H*.5,TANK_H*.5);
      f.group.lookAt(fishGroup.localToWorld(A.clone()));
    }
    const darting=f.dartT>0;
    f.phase+=dt*(3.2+f.vel.length()*3.6+(darting?14:0));
    const p=f.geom.attributes.position,base=f.base,us=f.us;
    for(let i=0;i<p.count;i++){const k=i*3,lat=(.002+.006*us[i]+.028*Math.pow(us[i],2.6))*Math.sin(f.phase-us[i]*6.2);p.array[k+2]=base[k+2]+lat;}
    p.needsUpdate=true;f.tail.rotation.y=-Math.sin(f.phase-6.2)*.5;
    f.body.material.emissiveIntensity=glow+f.panic*.35;
    if(f.spawnGrow>0){f.spawnGrow=Math.max(0,f.spawnGrow-dt*.9);f.group.scale.setScalar(1-f.spawnGrow*.85);}
  }
}

/* troupe injects the shark list (avoids an import cycle) */
let sharkListFn=()=>[];
export function bindSharkList(fn){sharkListFn=fn;}
