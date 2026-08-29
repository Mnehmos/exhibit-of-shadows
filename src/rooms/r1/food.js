import * as THREE from 'three';
import {R1} from './constants.js';
import {val} from '../../core/controls.js';
import {rnd,pick} from '../../core/utils.js';
import {fish} from './troupe.js';

/* R1.D04 food pellets: E06 feeding system spawns them, gravity slider (E12)
   scales their sink rate, fish (D03) chase and eat them */
export const foods=[];
let foodGroup=null;
const foodGeo=new THREE.SphereGeometry(.035,7,5),foodMats=[0xd7ac5d,0xc28d43,0xe0bb6f].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.75}));

export function initFood(group){foodGroup=group;}

export function feedExhibit(){
  const {TANK_R,TANK_H}=R1;
  for(let i=0;i<12;i++){
    const a=rnd(0,6.28),r=rnd(.8,TANK_R-.5),mesh=new THREE.Mesh(foodGeo,pick(foodMats));
    const food={mesh,pos:new THREE.Vector3(Math.sin(a)*r,TANK_H*.38+rnd(-.10,.12),Math.cos(a)*r),vel:new THREE.Vector3(rnd(-.03,.03),-.02,rnd(-.03,.03)),age:0};
    mesh.position.copy(food.pos);mesh.castShadow=true;foodGroup.add(mesh);foods.push(food);
  }
  for(const f of fish)f.decision=0;
}
export function nearestFood(f){let best=null,d=Infinity;for(const food of foods){const q=f.pos.distanceTo(food.pos);if(q<3&&q<d){d=q;best=food;}}return best;}
export function removeFood(food){const i=foods.indexOf(food);if(i>=0){foodGroup.remove(food.mesh);foods.splice(i,1);}}
export function updateFood(food,dt){food.age+=dt;food.vel.y-=.018*dt*(val('gravity')/100);food.vel.multiplyScalar(1-dt*.15);food.pos.addScaledVector(food.vel,dt);if(food.pos.y<-R1.TANK_H*.42){food.pos.y=-R1.TANK_H*.42;food.vel.y=0;}food.mesh.position.copy(food.pos);if(food.age>28)removeFood(food);}
