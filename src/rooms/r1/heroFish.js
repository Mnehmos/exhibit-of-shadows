import * as THREE from 'three';
import {state} from '../../core/state.js';
import {val} from '../../core/controls.js';
import {createHeroFishSpecimen as createStylizedHero} from '../../photobooth/heroClownfish.js';

/* R1.D06 — hero clownfish quality study.
   The tank and photo booth intentionally share one repo-native, stylized
   procedural fish. Aquarium-only water, caustics, and lighting stay here so
   the specimen itself remains safe to mount in an isolated booth. */

function makeCausticTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;
  const g=c.getContext('2d');g.clearRect(0,0,512,512);g.globalCompositeOperation='lighter';
  let seed=24891;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<110;i++){
    const x=rand()*512,y=rand()*512,r=12+rand()*58;
    g.strokeStyle=`rgba(185,255,246,${.035+rand()*.08})`;g.lineWidth=1+rand()*3;
    g.beginPath();g.ellipse(x,y,r,r*(.2+rand()*.35),rand()*Math.PI,0,Math.PI*2);g.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.35,1.35);t.colorSpace=THREE.SRGBColorSpace;
  return t;
}

function addWaterStudy(aquarium){
  const surfaceMat=new THREE.MeshPhysicalMaterial({color:0xa7e0dc,roughness:.16,metalness:0,transmission:.64,thickness:.05,ior:1.333,
    transparent:true,opacity:.42,clearcoat:.75,clearcoatRoughness:.12,side:THREE.DoubleSide,depthWrite:false});
  const surface=new THREE.Mesh(new THREE.CircleGeometry(3.0,72),surfaceMat);surface.rotation.x=-Math.PI/2;surface.position.y=4.03;surface.userData.noCast=true;aquarium.add(surface);

  const causticMap=makeCausticTexture();
  const caustics=new THREE.Mesh(new THREE.CircleGeometry(2.93,64),new THREE.MeshBasicMaterial({map:causticMap,color:0xa9fff0,transparent:true,opacity:.23,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  caustics.rotation.x=-Math.PI/2;caustics.position.y=-4.125;caustics.userData.noCast=true;aquarium.add(caustics);

  const targetA=new THREE.Object3D(),targetB=new THREE.Object3D();
  targetA.position.set(.3,.25,0);targetB.position.set(-.4,.1,.2);aquarium.add(targetA,targetB);
  const keyA=new THREE.SpotLight(0xc9f4ff,42,12,.68,.92,2);keyA.position.set(-2.5,4.15,1.7);keyA.target=targetA;
  const keyB=new THREE.SpotLight(0x98d9d5,26,11,.72,.95,2);keyB.position.set(2.35,3.7,-1.5);keyB.target=targetB;
  aquarium.add(keyA,keyB);
  return {surface,caustics,causticMap,keyA,keyB};
}

export function createHeroFish(aquarium){
  const swimmer=new THREE.Group();
  const specimen=createStylizedHero();
  const visual=specimen.scene;
  swimmer.add(visual);aquarium.add(swimmer);
  const water=addWaterStudy(aquarium);

  function update(dt,t){
    /* Keep the study in the visitor-facing half of the big tank. A shallow
       lateral patrol preserves a readable side silhouette from the gallery;
       the turn happens naturally at zero speed at each end of the run. */
    const pace=state.shadowPlay?.46:.34,a=t*pace;
    swimmer.position.set(Math.sin(a)*1.18,.34+Math.sin(a*1.7)*.18,1.56+Math.cos(a*2)*.10);
    const facing=Math.cos(a)>=0?0:Math.PI;
    visual.rotation.set(0,facing,-Math.cos(a*1.7)*.055);
    specimen.update(dt);
    specimen.material.emissiveIntensity=.02+(val('glow')/100)*.16;
    water.causticMap.offset.x=(t*.018)%1;water.causticMap.offset.y=(t*.012)%1;
    water.caustics.rotation.z=t*.018;
    water.surface.rotation.z=Math.sin(t*.11)*.04;
  }

  return {group:swimmer,update,material:specimen.material,label:'hero clownfish · stylized procedural'};
}
