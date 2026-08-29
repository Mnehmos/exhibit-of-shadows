import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {resizeHooks} from './state.js';

/* world: DOM anchors + scene/camera/renderer. The importmap in index.html is
   the single three.js version pin — every module imports 'three' directly. */
export const $=s=>document.querySelector(s);
export const mount=$('#mount'),hud=$('#hud'),readout=$('#readout');
export const desktopPointer=matchMedia('(hover:hover) and (pointer:fine)').matches;

export const scene=new THREE.Scene();
scene.background=new THREE.Color(0x111619);
scene.fog=new THREE.FogExp2(0x10171a,.018);

export const camera=new THREE.PerspectiveCamera(62,16/9,.08,80);
export const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.88;
renderer.domElement.style.width='100%';
renderer.domElement.style.height='auto';
renderer.domElement.style.aspectRatio='16/9';
export const lookEl=renderer.domElement;
mount.appendChild(lookEl);

/* PBR environment: subtle procedural room reflections for glass, fish, sails */
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
scene.environmentIntensity=.25;
pmrem.dispose();

export function resize(){
  const r=mount.getBoundingClientRect(),w=Math.max(320,r.width),h=w*9/16;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  for(const f of resizeHooks)f(w);
}
