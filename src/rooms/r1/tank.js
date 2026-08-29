import * as THREE from 'three';
import {R1} from './constants.js';
import {rnd,gradientTexture} from '../../core/utils.js';

/* ══════════════════════════════════════════════════════════════════
   THE MOON DUNE — authored centerpiece tank (v9, Kilo design)

   A captured piece of night ocean:
   · deep teal water wall (gradient, opaque interior shell)
   · sculpted dune bed under animated caustic light-webs
   · a faceted moonstone core suspended in layered god-rays
   · bronze armillary meridians that draw their own shadows
   · rising bubbles + drifting plankton sparkle
   The moon minnows (moonMinnows.js) are the living lantern around it.
   ══════════════════════════════════════════════════════════════════ */
export function buildTank(root){
  const {TANK_R,TANK_H,TANK_CENTER_Y,LIGHT_COLUMN_R,HALL_R}=R1;
  const aquarium=new THREE.Group();aquarium.position.y=TANK_CENTER_Y;root.add(aquarium);

  /* C01 glass shell — thin, cool, barely there */
  const glassMat=new THREE.MeshPhysicalMaterial({color:0xe1ffff,transparent:true,opacity:1,transmission:.96,thickness:.075,ior:1.5,roughness:.045,attenuationColor:0xb9dfdc,attenuationDistance:18,depthWrite:false,side:THREE.DoubleSide});
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R,TANK_R,TANK_H,64,1,true),glassMat);
  aquarium.add(glass);

  /* C02 deep water — opaque interior shell, vertical night-ocean gradient */
  const waterMat=new THREE.MeshBasicMaterial({side:THREE.BackSide,map:waterGradient()});
  const water=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R*.97,TANK_R*.97,TANK_H*.94,64,1,true),waterMat);
  aquarium.add(water);

  /* water surface — moonlit film */
  const surface=new THREE.Mesh(new THREE.CircleGeometry(TANK_R*.97,64),new THREE.MeshStandardMaterial({color:0x9fd0dd,transparent:true,opacity:.22,roughness:.12,emissive:0x1c4a56,emissiveIntensity:.9}));
  surface.rotation.x=-Math.PI/2;surface.position.y=TANK_H*.47;aquarium.add(surface);

  /* C03 bronze trim */
  const ringMat=new THREE.MeshStandardMaterial({color:0x8a6d3f,roughness:.35,metalness:.85});
  for(const y of [-TANK_H/2-.06,TANK_H/2+.06]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(TANK_R+.06,.12,10,64),ringMat);
    ring.rotation.x=Math.PI/2;ring.position.y=y;ring.castShadow=true;aquarium.add(ring);
  }

  /* C04 plinth */
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R+.52,TANK_R+.52,.55,64),new THREE.MeshStandardMaterial({color:0x2c2e30,roughness:.85}));
  plinth.position.y=-TANK_CENTER_Y+.28;plinth.castShadow=true;plinth.receiveShadow=true;root.add(plinth);

  /* the dune bed — sculpted sand, moonlit */
  const duneGeo=new THREE.CircleGeometry(TANK_R*.93,110);
  {
    const p=duneGeo.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i);
      const dune=.09*Math.sin(x*3.1+1.3)+.06*Math.cos(y*4.3)+.045*Math.sin((x+y)*6.7);
      p.setZ(i,dune);
    }
    duneGeo.computeVertexNormals();
  }
  const dunes=new THREE.Mesh(duneGeo,new THREE.MeshStandardMaterial({color:0xcbb894,roughness:.55,metalness:.04}));
  dunes.rotation.x=-Math.PI/2;dunes.position.y=-TANK_H/2+.16;dunes.receiveShadow=true;aquarium.add(dunes);

  /* animated caustic light-webs over the dunes */
  const causticTex=causticTexture();
  const caustics=[];
  for(const[rot,op] of [[.045,.32],[-.03,.22]]){
    const c=new THREE.Mesh(new THREE.CircleGeometry(TANK_R*.9,64),new THREE.MeshBasicMaterial({map:causticTex,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));
    c.rotation.x=-Math.PI/2;c.position.y=-TANK_H/2+.30;c.userData.spin=rot;aquarium.add(c);caustics.push(c);
  }

  /* C06 layered god-ray beams from the core */
  const beamAlpha=gradientTexture([[0,'#000000'],[.42,'#8a8a8a'],[.58,'#8a8a8a'],[1,'#000000']]);
  const beams=new THREE.Group();aquarium.add(beams);
  const beamSpec=[[.5,.12],[.68,.10],[.86,.07]];
  for(const[bot,op] of beamSpec){
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.06,bot,TANK_H*.86,32,1,true),new THREE.MeshBasicMaterial({color:0xfff2d8,transparent:true,opacity:op,alphaMap:beamAlpha,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    beams.add(b);
  }

  /* C07 the moonstone core */
  const moonMat=new THREE.MeshStandardMaterial({color:0xffe9c4,emissive:0xffc878,emissiveIntensity:2.1,roughness:.15,flatShading:true});
  const moonstone=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),moonMat);aquarium.add(moonstone);

  /* C08 the central light */
  const centralLight=new THREE.PointLight(0xffd9a0,680,32,1.45);
  centralLight.castShadow=true;
  centralLight.shadow.mapSize.set(512,512);
  centralLight.shadow.camera.near=.35;
  centralLight.shadow.camera.far=HALL_R+5;
  centralLight.shadow.bias=-.00045;
  centralLight.shadow.normalBias=.018;
  centralLight.shadow.radius=3;
  aquarium.add(centralLight);

  /* bubbles */
  const BUB=80,bubGeo=new THREE.BufferGeometry(),bubPos=new Float32Array(BUB*3),bubSeed=[];
  for(let i=0;i<BUB;i++){
    const s={a:rnd(0,6.28),r:rnd(LIGHT_COLUMN_R+.6,TANK_R-.5),y:rnd(-TANK_H*.45,TANK_H*.45),v:rnd(.08,.22),w:rnd(1,3)};
    bubSeed.push(s);bubPos[i*3]=Math.sin(s.a)*s.r;bubPos[i*3+1]=s.y;bubPos[i*3+2]=Math.cos(s.a)*s.r;
  }
  bubGeo.setAttribute('position',new THREE.BufferAttribute(bubPos,3));
  const bubbles=new THREE.Points(bubGeo,new THREE.PointsMaterial({color:0xcfeef5,size:.02,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  bubbles.frustumCulled=false;aquarium.add(bubbles);

  /* plankton sparkle (was motes) */
  const MOTES=160,moteGeo=new THREE.BufferGeometry(),motePos=new Float32Array(MOTES*3),moteSeed=[];
  for(let i=0;i<MOTES;i++){
    const m={a:rnd(0,6.283),r:rnd(.4,TANK_R-.3),y:rnd(-3.5,3.5),vy:rnd(.01,.05),spin:rnd(.04,.18)};
    moteSeed.push(m);motePos[i*3]=Math.sin(m.a)*m.r;motePos[i*3+1]=m.y;motePos[i*3+2]=Math.cos(m.a)*m.r;
  }
  moteGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));
  const plankton=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:0xbfe8ff,size:.022,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
  plankton.frustumCulled=false;aquarium.add(plankton);

  /* C10 exhibit plaque */
  const plaque=new THREE.Group();
  const plaqueBack=new THREE.Mesh(new THREE.BoxGeometry(1.78,.52,.06),new THREE.MeshStandardMaterial({color:0x202326,roughness:.6,metalness:.3}));
  const plaqueFace=new THREE.Mesh(new THREE.PlaneGeometry(1.68,.42),new THREE.MeshStandardMaterial({map:plaqueTexture(),roughness:.5}));
  plaqueFace.position.z=.032;plaque.add(plaqueBack,plaqueFace);
  plaque.position.set(0,-TANK_CENTER_Y+.30,TANK_R+.53);root.add(plaque);

  function updateTank(dt,t){
    moonstone.rotation.y+=dt*.16;moonstone.rotation.x+=dt*.05;
    moonstone.position.y=Math.sin(t*.55)*.18;
    coreMatPulse(t);
    beams.rotation.y+=dt*.05;
    for(const c of caustics)c.rotation.z+=c.userData.spin*dt;
    const p=bubGeo.attributes.position;
    for(let i=0;i<BUB;i++){
      const s=bubSeed[i];s.y+=s.v*dt;
      if(s.y>TANK_H*.45)s.y=-TANK_H*.45;
      p.setXYZ(i,Math.sin(s.a)*s.r+Math.sin(t*s.w+i)*.04,s.y,Math.cos(s.a)*s.r);
    }
    p.needsUpdate=true;
    const m=moteGeo.attributes.position;
    for(let i=0;i<MOTES;i++){
      const s=moteSeed[i];s.a+=dt*s.spin;s.y+=dt*s.vy;if(s.y>3.6)s.y=-3.6;
      m.setXYZ(i,Math.sin(s.a)*s.r,s.y,Math.cos(s.a)*s.r);
    }
    m.needsUpdate=true;
    surface.rotation.z+=dt*.02;
  }
  function coreMatPulse(t){moonMat.emissiveIntensity=1.9+.45*Math.sin(t*.8);}
  return {aquarium,centralLight,orbMat:moonMat,updateTank};
}

function waterGradient(){
  const c=document.createElement('canvas');c.width=4;c.height=512;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,512);
  gr.addColorStop(0,'#2a6b74');gr.addColorStop(.45,'#12414e');gr.addColorStop(1,'#081f29');
  g.fillStyle=gr;g.fillRect(0,0,4,512);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function causticTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
  g.fillStyle='#000';g.fillRect(0,0,512,512);
  g.strokeStyle='rgba(210,240,255,.85)';
  for(let i=0;i<70;i++){
    g.lineWidth=1+Math.random()*4;
    g.beginPath();
    const x=Math.random()*512,y=Math.random()*512,r=14+Math.random()*46,a=Math.random()*6.28;
    g.arc(x,y,r,a,a+1.2+Math.random()*2.4);
    g.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function plaqueTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#15171a';g.fillRect(0,0,1024,256);
  g.strokeStyle='#d8c89d';g.lineWidth=6;g.strokeRect(14,14,996,228);
  g.fillStyle='#e8dfc8';g.font='600 58px Georgia,serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('THE MOON DUNE',512,96);
  g.fillStyle='#9a958a';g.font='32px Georgia,serif';
  g.fillText('THE EXHIBIT OF SHADOWS · GALLERY ONE',512,176);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
