import * as THREE from 'three';
import {state} from './state.js';
import {scene,camera} from './world.js';
import {keys,joy} from './input.js';
import {val} from './controls.js';

export const player={group:new THREE.Group(),pos:new THREE.Vector3(0,0,8),spawn:new THREE.Vector3(0,0,8),yaw:0,pitch:0,viewMode:'first',minR:1.2,maxR:9,
  setBounds(min,max){this.minR=min;this.maxR=max;},
  setSpawn(x,z){this.spawn.set(x,0,z);}};

const shirt=new THREE.MeshStandardMaterial({color:0x435665,roughness:.82});
const skin=new THREE.MeshStandardMaterial({color:0xb18d71,roughness:.9});
const dark=new THREE.MeshStandardMaterial({color:0x282c31,roughness:.8});
const torso=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.78,10),shirt);torso.position.y=1.05;torso.castShadow=true;player.group.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,9),skin);head.position.y=1.62;head.castShadow=true;player.group.add(head);
export const legs=[];for(const x of [-.12,.12]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.78,8),dark);leg.position.set(x,.40,0);leg.castShadow=true;player.group.add(leg);legs.push(leg);}
const cameraProp=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.13),dark);cameraProp.position.set(.27,1.18,-.10);cameraProp.castShadow=true;player.group.add(cameraProp);
scene.add(player.group);

function clampPlayer(){const r=Math.hypot(player.pos.x,player.pos.z);if(r<player.minR){const s=player.minR/(r||.001);player.pos.x*=s;player.pos.z*=s;}if(r>player.maxR){const s=player.maxR/r;player.pos.x*=s;player.pos.z*=s;}}
export function resetPlayer(){player.pos.copy(player.spawn);player.yaw=0;player.pitch=0;player.group.position.copy(player.pos);}
function forwardVector(){return new THREE.Vector3(Math.sin(player.yaw),0,-Math.cos(player.yaw));}
function rightVector(){return new THREE.Vector3(Math.cos(player.yaw),0,Math.sin(player.yaw));}
export function updatePlayer(dt){
  if(state.consoleOpen){legs[0].rotation.x*=.85;legs[1].rotation.x*=.85;return;}
  let f=(keys.KeyW?1:0)-(keys.KeyS?1:0)-joy.y,s=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;
  const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}
  if(Math.abs(f)+Math.abs(s)>.01){
    const speed=2.25*val('walkSpeed')/100;
    player.pos.addScaledVector(forwardVector(),f*speed*dt);
    player.pos.addScaledVector(rightVector(),s*speed*dt);
    clampPlayer();player.group.position.copy(player.pos);
    legs[0].rotation.x=Math.sin(performance.now()*.012)*.35;legs[1].rotation.x=-legs[0].rotation.x;
  }else{legs[0].rotation.x*=.85;legs[1].rotation.x*=.85;}
  player.group.rotation.y=-player.yaw;
}
export function updateCamera(){
  const forward=forwardVector(),headPos=player.pos.clone().add(new THREE.Vector3(0,1.62,0));
  if(player.viewMode==='first'){
    player.group.visible=false;camera.position.copy(headPos);
    const look=headPos.clone().add(new THREE.Vector3(Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch)));camera.lookAt(look);
  }else{
    player.group.visible=true;
    const desired=headPos.clone().addScaledVector(forward,-3.7).add(new THREE.Vector3(0,1.9,0));
    const lim=player.maxR+.38,rr=Math.hypot(desired.x,desired.z);if(rr>lim){desired.x*=lim/rr;desired.z*=lim/rr;}
    camera.position.lerp(desired,.18);
    camera.lookAt(headPos.clone().addScaledVector(forward,1.6).add(new THREE.Vector3(0,.25,0)));
  }
}
