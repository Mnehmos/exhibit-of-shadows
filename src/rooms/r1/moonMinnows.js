import * as THREE from 'three';
import {R1} from './constants.js';
import {state} from '../../core/state.js';
import {val,defineControl} from '../../core/controls.js';
import {clamp,rnd} from '../../core/utils.js';
import {SEA_GLASS} from './artDirection.js';
import {foods,nearestFood,removeFood} from './food.js';
import {fish,predators as sharkList} from './troupe.js';

/* ═══ MOON MINNOWS — modeled on real minnow behaviour (v9.5) ═══
   No anchors, no shell, no leader. Emergent schooling from local rules:

   · three interaction zones per pair — repulsion / alignment / attraction
   · every fish has a boldness personality (skittish ↔ bold):
       skittish fish dive into the ball first; bold fish forage at the edge
       and are the last to panic
   · each fish remembers two shoalmates and biases toward them —
       "some follow, some stay"
   · panic is contagious: darts propagate through the school as a wave,
       filtered by each fish's boldness and reaction
   · hunger drives foraging: hungry fish leave cover to nibble pellets
   · C-start darts: speed burst + tail flash, random when calm,
       threat-driven when hunted

   Eaten minnows re-hatch at the plant bed (grow-in). */

const LEN=.38;
defineControl({id:'ballSize',label:'Moon minnows',group:'Ecosystem',min:24,max:120,step:2,value:88,fmt:v=>String(v)});
export const minnows=[];
let fishGroup=null;
let pendingHatch=0;
const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();

/* tuning — real-minnow-inspired */
const Z_REP=.16, Z_ALN=.44, Z_ATT=1.0;
const CONTAGION_R=.6, PANIC_TRIG=.55, PANIC_DECAY=.85;
const DART_TIME=.32, DART_SPEED=1.9;
const MR=.06;                     /* minnow body radius (hard separation) */

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
  const bold=.15+Math.random()*.8;
  const f={...m,bold,panic:0,hunger:rnd(.2,.8),companions:[],dartT:0,
    dartDir:new THREE.Vector3(rnd(-1,1),rnd(-.3,.3),rnd(-1,1)).normalize(),
    pos:at?at.clone():randomPoint(),vel:new THREE.Vector3(rnd(-.4,.4),rnd(-.15,.15),rnd(-.4,.4)),
    acc:new THREE.Vector3(),noise:new THREE.Vector3(),phase:rnd(0,6.28),
    spawnGrow:grow?1:0,body:m.body};
  /* two shoalmates — "some follow" */
  if(minnows.length){
    f.companions=[minnows[Math.floor(Math.random()*minnows.length)],minnows[Math.floor(Math.random()*minnows.length)]];
  }
  f.group.scale.setScalar(grow?.15:1);
  fishGroup.add(f.group);minnows.push(f);
  return f;
}
function randomPoint(){const {TANK_R,TANK_H}=R1;const a=rnd(0,6.28),r=rnd(1.4,TANK_R-.7);return new THREE.Vector3(Math.sin(a)*r,rnd(-TANK_H*.36,TANK_H*.36),Math.cos(a)*r);}

export function initMoonMinnows(group){
  fishGroup=group;
  for(let i=0;i<88;i++)spawn(null,false);
  /* companion hookup pass */
  for(const f of minnows){
    const others=minnows.filter(o=>o!==f);
    f.companions=[others[Math.floor(Math.random()*others.length)],others[Math.floor(Math.random()*others.length)]];
  }
}
export function setBallTarget(){syncBall();}

export function syncBall(){
  const target=Math.round(val('ballSize'));
  let guard=target*2+4;
  while(minnows.length<target&&guard-->0){
    const f=spawn(new THREE.Vector3(Math.sin(minnows.length)*1.6,-.5,Math.cos(minnows.length)*1.6),true);
    if(f.spawnGrow)f.group.scale.setScalar(.15);
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
  const target=Math.round(val('ballSize'));
  while(pendingHatch>0&&minnows.length<target){
    const a=Math.random()*6.28;
    const f=spawn(new THREE.Vector3(Math.sin(a)*1.3,-R1.TANK_H*.32,Math.cos(a)*1.3),true);
    f.hunger=rnd(.5,1);
  }
  if(pendingHatch>0&&minnows.length>=target)pendingHatch=0;

  const sharks=sharkList();
  const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;
  const glow=state.shadowPlay?1.6:.45;
  const centroid=new THREE.Vector3();
  for(const f of minnows)centroid.add(f.pos);
  if(minnows.length)centroid.divideScalar(minnows.length);

  /* behaviour pass */
  for(const f of minnows){
    f.acc.set(0,0,0);
    f.panic=Math.max(0,f.panic-dt*PANIC_DECAY);
    f.hunger=Math.min(1,f.hunger+dt*.06*(1.3-f.bold));

    /* shark terror — skittish fish spike sooner and harder */
    let nearShark=null,sd=Infinity;
    for(const p of sharks){const d=f.pos.distanceToSquared(p.pos);if(d<sd){sd=d;var sp=p;}}
    if(sp&&sd<1.6*1.6){
      const d=Math.sqrt(sd);
      f.panic=Math.min(1,f.panic+dt*6*(1-d/1.6)*(1.25-f.bold*.8));
      f.threat=f.threat||new THREE.Vector3();
      f.threat.copy(f.pos).sub(sp.pos).normalize();
    }

    /* random startle — they live their own life */
    if(f.panic<.2&&Math.random()<dt*.03*(1.3-f.bold)){
      f.panic=Math.min(1,.5+Math.random()*.4);
      f.dartT=DART_TIME;
      f.dartDir.set(rnd(-1,1),rnd(-.3,.3),rnd(-1,1)).normalize();
    }

    /* C-start dart */
    if(f.dartT>0){
      f.dartT-=dt;
      f.acc.addScaledVector(f.dartDir,7*(f.dartT/DART_TIME+.3));
      f.phase+=dt*22;                       /* tail flash */
      if(f.panic>.5)f.acc.addScaledVector(C.subVectors(centroid,f.pos).normalize(),1.1*f.panic*(1.15-f.bold*.6));
    }

    /* foraging: hungry + calm → seek pellets; bold fish range farther */
    if(f.panic<.25&&f.hunger>.35){
      const food=nearestFood({pos:f.pos});
      if(food){
        B.subVectors(food.pos,f.pos);
        const d=B.length();
        if(d<2.2)f.acc.add(B.normalize().multiplyScalar(.9*(.6+f.bold*.7)));
        if(d<.09){removeFood(food);f.hunger*=.3;}
      }
    }

    /* calm wander */
    if(f.panic<.3){
      f.noise.x=THREE.MathUtils.lerp(f.noise.x,rnd(-1,1),dt*1.4);
      f.acc.addScaledVector(f.noise,.35*(.5+f.bold));
    }
  }

  /* pairwise zones: repulsion / alignment / attraction / panic contagion */
  for(let i=0;i<minnows.length;i++)for(let j=i+1;j<minnows.length;j++){
    const a=minnows[i],b=minnows[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz;
    if(d2>1.2*1.2)continue;
    const d=Math.sqrt(d2)||.001,nx=dx/d,ny=dy/d,nz=dz/d;

    if(d<Z_REP){
      const k=(Z_REP-d)/Z_REP*2.4;
      a.acc.x-=nx*k;a.acc.y-=ny*k;a.acc.z-=nz*k;
      b.acc.x+=nx*k;b.acc.y+=ny*k;b.acc.z+=nz*k;
    }
    if(d<Z_ALN){
      const w=(1-d/Z_ALN)*.9;
      a.acc.x+=(b.vel.x-a.vel.x)*w;a.acc.y+=(b.vel.y-a.vel.y)*w;a.acc.z+=(b.vel.z-a.vel.z)*w;
      b.acc.x+=(a.vel.x-b.vel.x)*w;b.acc.y+=(a.vel.y-b.vel.y)*w;b.acc.z+=(a.vel.z-b.vel.z)*w;
    }
    if(d<Z_ATT){
      const companion=a.companions.includes(b)||b.companions.includes(a);
      const w=((companion?1.5:.55))*(1-d/Z_ATT);
      a.acc.x+=nx*w;a.acc.y+=ny*w;a.acc.z+=nz*w;
      b.acc.x-=nx*w;b.acc.y-=ny*w;b.acc.z-=nz*w;
    }
    /* panic contagion — the wave */
    const hi=a.panic>b.panic?a:b,lo=hi===a?b:a;
    if(hi.panic>PANIC_TRIG&&d<CONTAGION_R)
      lo.panic=Math.min(1,lo.panic+dt*7*hi.panic*(1-d/CONTAGION_R)*(1.2-lo.bold*.6));
  }

  /* compose + integrate */
  const inner=1.25;
  for(const f of minnows){
    /* panicky fish compress toward the ball's own centroid; bold hold ground */
    if(f.panic>.3)f.acc.addScaledVector(C.subVectors(centroid,f.pos),1.15*f.panic*(1.15-f.bold*.6));
    f.vel.addScaledVector(f.acc,dt);
    let speed=.3+.25*f.bold+.12*f.hunger;
    if(f.panic>.4)speed=Math.max(speed,1.05+.5*f.panic);
    if(f.dartT>0)speed=DART_SPEED;
    if(f.vel.length()>speed)f.vel.setLength(speed);
    if(f.vel.length()<.16&&f.vel.length()>.001)f.vel.setLength(.16);
    f.pos.addScaledVector(f.vel,dt);
    const rad=Math.hypot(f.pos.x,f.pos.z);
    if(rad<inner){const s=inner/(rad||.001);f.pos.x*=s;f.pos.z*=s;}
    if(rad>TANK_R-.55){const s=(TANK_R-.55)/rad;f.pos.x*=s;f.pos.z*=s;}
    f.pos.y=clamp(f.pos.y,-TANK_H*.42,TANK_H*.42);
  }

  /* hard separation — every fish owns its space */
  for(let i=0;i<minnows.length;i++)for(let j=i+1;j<minnows.length;j++){
    const a=minnows[i],b=minnows[j];
    const dx=b.pos.x-a.pos.x,dy=b.pos.y-a.pos.y,dz=b.pos.z-a.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=MR*2+.03;
    if(d2>=rr*rr)continue;
    if(d2<1e-6){a.pos.x+=rnd(-.02,.02);b.pos.x-=rnd(-.02,.02);continue;}
    const d=Math.sqrt(d2),push=(rr-d)/d*.5;
    a.pos.x-=dx*push;a.pos.y-=dy*push;a.pos.z-=dz*push;
    b.pos.x+=dx*push;b.pos.y+=dy*push;b.pos.z+=dz*push;
  }
  for(const m of minnows)for(const f of fish){
    const dx=m.pos.x-f.pos.x,dy=m.pos.y-f.pos.y,dz=m.pos.z-f.pos.z;
    const d2=dx*dx+dy*dy+dz*dz,rr=f.radius+MR+.02;
    if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||.001,push=(rr-d)/d;
    m.pos.x+=dx*push;m.pos.y+=dy*push;m.pos.z+=dz*push;
  }

  /* visuals */
  for(const f of minnows){
    f.group.position.copy(f.pos);
    A.copy(f.vel);
    if(A.lengthSq()>.001){
      C.copy(f.pos).add(A);
      f.group.lookAt(fishGroup.localToWorld(C.clone()));
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
