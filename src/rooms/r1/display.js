import * as THREE from 'three';
import {R1} from './constants.js';
import {rnd,gradientTexture} from '../../core/utils.js';

/* R1.C the display: glass (C01), water (C02), trim (C03), plinth (C04),
   substrate (C05), beam (C06), orb (C07), central light (C08), motes (C09), plaque (C10) */
export function buildDisplay(root){
  const {TANK_R,TANK_H,TANK_CENTER_Y,LIGHT_COLUMN_R,HALL_R}=R1;
  const aquarium=new THREE.Group();aquarium.position.y=TANK_CENTER_Y;root.add(aquarium);
  const glassMat=new THREE.MeshPhysicalMaterial({color:0x75a7a3,transparent:true,opacity:.11,transmission:.90,roughness:.035,depthWrite:false,side:THREE.DoubleSide});
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x234f54,transparent:true,opacity:.15,transmission:.78,roughness:.09,depthWrite:false,side:THREE.DoubleSide});
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R,TANK_R,TANK_H,64,1,true),glassMat);
  const water=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R*.96,TANK_R*.96,TANK_H*.94,64,1,false),waterMat);
  aquarium.add(glass,water);

  const ringMat=new THREE.MeshStandardMaterial({color:0x282b2c,roughness:.62,metalness:.28});
  for(const y of [-TANK_H/2-.06,TANK_H/2+.06]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(TANK_R+.06,.12,10,64),ringMat);
    ring.rotation.x=Math.PI/2;ring.position.y=y;ring.castShadow=true;aquarium.add(ring);
  }
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R+.52,TANK_R+.52,.55,64),new THREE.MeshStandardMaterial({color:0x353638,roughness:.88}));
  plinth.position.y=-TANK_CENTER_Y+.28;plinth.castShadow=true;plinth.receiveShadow=true;root.add(plinth);

  const substrate=new THREE.Mesh(new THREE.CylinderGeometry(TANK_R*.93,TANK_R*.93,.22,64),new THREE.MeshStandardMaterial({color:0x655f50,roughness:1}));
  substrate.position.y=-TANK_H/2+.15;substrate.receiveShadow=true;aquarium.add(substrate);

  const beamAlpha=gradientTexture([[0,'#000000'],[.42,'#8a8a8a'],[.58,'#8a8a8a'],[1,'#000000']]);
  const lightColumn=new THREE.Mesh(new THREE.CylinderGeometry(LIGHT_COLUMN_R,LIGHT_COLUMN_R,TANK_H*.88,32,1,true),new THREE.MeshBasicMaterial({color:0xfff2d8,transparent:true,opacity:.34,alphaMap:beamAlpha,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  aquarium.add(lightColumn);
  const orbMat=new THREE.MeshStandardMaterial({color:0xffe0a4,emissive:0xffbd59,emissiveIntensity:4,roughness:.22});
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.32,24,16),orbMat);orb.userData.noCast=true;aquarium.add(orb);

  const centralLight=new THREE.PointLight(0xffd99a,680,32,1.45);
  centralLight.castShadow=true;
  centralLight.shadow.mapSize.set(512,512);
  centralLight.shadow.camera.near=.35;
  centralLight.shadow.camera.far=HALL_R+5;
  centralLight.shadow.bias=-.00045;
  centralLight.shadow.normalBias=.018;
  centralLight.shadow.radius=3;
  aquarium.add(centralLight);

  const MOTES=280,moteGeo=new THREE.BufferGeometry(),motePos=new Float32Array(MOTES*3),moteSeed=[];
  for(let i=0;i<MOTES;i++){
    const m={a:rnd(0,6.283),r:rnd(LIGHT_COLUMN_R+.22,TANK_R-.3),y:rnd(-3.5,3.5),vy:rnd(.015,.06),spin:rnd(.05,.22)};
    moteSeed.push(m);motePos[i*3]=Math.sin(m.a)*m.r;motePos[i*3+1]=m.y;motePos[i*3+2]=Math.cos(m.a)*m.r;
  }
  moteGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));
  const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:0xffe9c2,size:.032,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true}));
  motes.frustumCulled=false;aquarium.add(motes);
  function updateMotes(dt){
    const p=moteGeo.attributes.position;
    for(let i=0;i<MOTES;i++){const m=moteSeed[i];m.a+=dt*m.spin;m.y+=dt*m.vy;if(m.y>3.6)m.y=-3.6;p.setXYZ(i,Math.sin(m.a)*m.r,m.y,Math.cos(m.a)*m.r);}
    p.needsUpdate=true;
  }

  const plaque=new THREE.Group();
  const plaqueBack=new THREE.Mesh(new THREE.BoxGeometry(1.78,.52,.06),new THREE.MeshStandardMaterial({color:0x202326,roughness:.6,metalness:.3}));
  const plaqueFace=new THREE.Mesh(new THREE.PlaneGeometry(1.68,.42),new THREE.MeshStandardMaterial({map:plaqueTexture(),roughness:.5}));
  plaqueFace.position.z=.032;plaque.add(plaqueBack,plaqueFace);
  plaque.position.set(0,-TANK_CENTER_Y+.30,TANK_R+.53);root.add(plaque);

  return {aquarium,orbMat,centralLight,updateMotes};
}

function plaqueTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#15171a';g.fillRect(0,0,1024,256);
  g.strokeStyle='#d8c89d';g.lineWidth=6;g.strokeRect(14,14,996,228);
  g.fillStyle='#e8dfc8';g.font='600 62px Georgia,serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('THE EXHIBIT OF SHADOWS',512,102);
  g.fillStyle='#9a958a';g.font='34px Georgia,serif';
  g.fillText('SILO AQUARIUM MUSEUM · GALLERY ONE',512,178);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
