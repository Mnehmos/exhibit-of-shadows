import * as THREE from 'three';
import {R1} from './constants.js';
import {state} from '../../core/state.js';
import {val} from '../../core/controls.js';
import {clamp,rnd,disposeTree} from '../../core/utils.js';
import {foods,nearestFood,removeFood} from './food.js';

/* R1.D03 minnows: procedural body (D03 mesh), boids + phototaxis + vortex AI,
   CPU vertex swim animation. Highest-value Phase 2 target (GLB swap-in). */
export const fish=[];
let fishGroup=null;
const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),XAXIS=new THREE.Vector3(1,0,0);

export function initMinnows(group){fishGroup=group;}

function shape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s);}
function minnowMesh(){
  const group=new THREE.Group(),rings=28,sides=14,pos=[],idx=[],u=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),x=.46-.92*q;
    let r=q<.15?.045+.06*Math.sin(q/.15*Math.PI*.5):q<.34?.105+.014*Math.sin((q-.15)/.19*Math.PI):.11*(1-(q-.34)/.66*.76);
    if(q>.80)r*=THREE.MathUtils.lerp(1,.58,(q-.80)/.20);
    const rz=r*(.48-.055*q);
    for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;pos.push(x,Math.sin(a)*r,Math.cos(a)*rz);u.push(q);}
  }
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();geom.userData.base=new Float32Array(pos);geom.userData.u=new Float32Array(u);
  const body=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:0x9aa69d,roughness:.38,metalness:.10,emissive:0x7fd4c1,emissiveIntensity:0}));body.castShadow=true;group.add(body);
  const finMat=new THREE.MeshStandardMaterial({color:0x686f68,roughness:.64,transparent:true,opacity:.92,side:THREE.DoubleSide});
  const tailPivot=new THREE.Group();tailPivot.position.x=-.455;
  const tail=new THREE.Mesh(shape([[0,.022],[-.11,.11],[-.29,.16],[-.23,.038],[-.16,0],[-.23,-.038],[-.29,-.16],[-.11,-.11],[0,-.022]]),finMat);tail.castShadow=true;tailPivot.add(tail);group.add(tailPivot);
  const dorsal=new THREE.Mesh(shape([[.10,0],[0,.13],[-.15,.10],[-.23,.02],[-.24,0]]),finMat);dorsal.position.y=.095;dorsal.castShadow=true;group.add(dorsal);
  const eyeGeo=new THREE.SphereGeometry(.021,7,5),eyeMat=new THREE.MeshStandardMaterial({color:0x050606});
  for(const z of [-.052,.052]){const eye=new THREE.Mesh(eyeGeo,eyeMat);eye.position.set(.34,.032,z);group.add(eye);}
  return{group,geom,tailPivot,bodyMat:body.material};
}

function randomFishPosition(){const {TANK_R,TANK_H,LIGHT_COLUMN_R}=R1;const a=rnd(0,6.28),r=rnd(LIGHT_COLUMN_R+.52,TANK_R-.42);return new THREE.Vector3(Math.sin(a)*r,rnd(-TANK_H*.39,TANK_H*.39),Math.cos(a)*r);}
export function createFish(){
  const m=minnowMesh();
  const f={...m,pos:randomFishPosition(),vel:new THREE.Vector3(rnd(-1,1),rnd(-.25,.25),rnd(-1,1)).normalize().multiplyScalar(rnd(.38,.68)),acc:new THREE.Vector3(),wander:new THREE.Vector3(rnd(-1,1),rnd(-.4,.4),rnd(-1,1)).normalize(),noise:new THREE.Vector3(),phase:rnd(0,6.28),decision:rnd(.25,1.2),state:'cruise',food:null,size:rnd(.70,1.07),preferred:rnd(.40,.65)};
  f.group.scale.setScalar(f.size*val('fishScale')/100);fishGroup.add(f.group);fish.push(f);
}
export function syncFish(){while(fish.length<val('fishCount'))createFish();while(fish.length>val('fishCount')){const f=fish.pop();fishGroup.remove(f.group);disposeTree(f.group);}}
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
  f.group.position.copy(f.pos);A.copy(f.vel).normalize();if(A.lengthSq()>.001)f.group.quaternion.setFromUnitVectors(XAXIS,A);
  const beat=clamp(.29*(f.vel.length()/(.80*f.size))/.17,.45,5.2);f.phase+=6.283*beat*dt;const p=f.geom.attributes.position,base=f.geom.userData.base,us=f.geom.userData.u,boost=f.state==='feed'?1.28:1;for(let i=0;i<p.count;i++){const k=i*3,u=us[i],lat=(.002+.009*u+.068*Math.pow(u,2.8))*Math.sin(f.phase-u*6.45)*boost;p.array[k]=base[k];p.array[k+1]=base[k+1];p.array[k+2]=base[k+2]+lat;}p.needsUpdate=true;f.tailPivot.rotation.y=-Math.sin(f.phase-6.45)*.40*boost;
}
