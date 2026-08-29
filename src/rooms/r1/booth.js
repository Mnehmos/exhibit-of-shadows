import * as THREE from 'three';
import {R1} from './constants.js';
import {consolePoints} from '../../core/state.js';

/* R1.B08 stagehand console booth — in the 45° sail gap, facing the tank */
export function buildBooth(root){
  const {HALL_R,TANK_R,TANK_CENTER_Y}=R1;
  function consoleTexture(){
    const c=document.createElement('canvas');c.width=512;c.height=320;const g=c.getContext('2d');
    g.fillStyle='#101214';g.fillRect(0,0,512,320);
    g.strokeStyle='#d8c89d';g.lineWidth=5;g.strokeRect(10,10,492,300);
    g.fillStyle='#d8c89d';g.font='600 46px Georgia,serif';g.textAlign='center';
    g.fillText('STAGEHAND',256,104);g.fillText('CONSOLE',256,156);
    g.fillStyle='#9a958a';g.font='26px Georgia,serif';
    g.fillText('hall controls · guest override',256,222);
    g.fillStyle='#6f6a60';g.font='22px Georgia,serif';
    g.fillText('approach and press E',256,262);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
  }
  const consolePos=new THREE.Vector3(Math.sin(Math.PI/4)*(HALL_R-1.35),0,Math.cos(Math.PI/4)*(HALL_R-1.35));
  const consoleGroup=new THREE.Group();consoleGroup.position.copy(consolePos);consoleGroup.rotation.y=Math.PI/4+Math.PI;root.add(consoleGroup);
  const boothMat=new THREE.MeshStandardMaterial({color:0x2b2e31,roughness:.7,metalness:.2});
  const boothBase=new THREE.Mesh(new THREE.BoxGeometry(.95,1.02,.55),boothMat);boothBase.position.y=.51;boothBase.castShadow=true;boothBase.receiveShadow=true;consoleGroup.add(boothBase);
  const boothTop=new THREE.Mesh(new THREE.BoxGeometry(1.0,.07,.62),new THREE.MeshStandardMaterial({color:0x3a3d40,roughness:.5,metalness:.3}));boothTop.position.y=1.055;boothTop.castShadow=true;consoleGroup.add(boothTop);
  const consoleScreenTex=consoleTexture();
  const consoleScreen=new THREE.Mesh(new THREE.PlaneGeometry(.82,.5),new THREE.MeshStandardMaterial({map:consoleScreenTex,emissive:0xffffff,emissiveMap:consoleScreenTex,emissiveIntensity:.35,roughness:.4}));
  consoleScreen.position.set(0,1.33,.02);consoleScreen.rotation.x=-.5;consoleGroup.add(consoleScreen);
  for(const x of [-.3,.3]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.26,6),boothMat);post.position.set(x,1.18,-.04);post.rotation.x=.5;consoleGroup.add(post);}
  const boothGlow=new THREE.Mesh(new THREE.BoxGeometry(.9,.03,.04),new THREE.MeshStandardMaterial({color:0x1a1c1e,emissive:0xd8c89d,emissiveIntensity:.9}));
  boothGlow.position.set(0,.72,.285);boothGlow.userData.noCast=true;consoleGroup.add(boothGlow);
  consolePoints.push(consolePos);
  return {consolePos};
}
