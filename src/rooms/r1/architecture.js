import * as THREE from 'three';
import {R1} from './constants.js';

/* R1.A architecture */
export const ribMat=new THREE.MeshStandardMaterial({color:0x716d65,roughness:.86});

export function buildArchitecture(root){
  const {HALL_R,HALL_H}=R1;
  const wallMat=new THREE.MeshStandardMaterial({color:0xa09a8c,roughness:.94,side:THREE.BackSide});
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(HALL_R,HALL_R,HALL_H,72,1,true),wallMat);
  wall.position.y=HALL_H/2;wall.receiveShadow=true;wall.userData.noCast=true;root.add(wall);

  const floorMat=new THREE.MeshStandardMaterial({color:0x413c35,roughness:.9});
  const floor=new THREE.Mesh(new THREE.CircleGeometry(HALL_R,72),floorMat);
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.userData.noCast=true;root.add(floor);

  const ceiling=new THREE.Mesh(new THREE.CircleGeometry(HALL_R,72),new THREE.MeshStandardMaterial({color:0x8d887d,roughness:1,side:THREE.DoubleSide}));
  ceiling.rotation.x=Math.PI/2;ceiling.position.y=HALL_H;ceiling.receiveShadow=true;ceiling.userData.noCast=true;root.add(ceiling);

  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2;
    const rib=new THREE.Mesh(new THREE.BoxGeometry(.23,HALL_H*.82,.32),ribMat);
    rib.position.set(Math.sin(a)*(HALL_R-.13),HALL_H*.46,Math.cos(a)*(HALL_R-.13));
    rib.rotation.y=a;rib.receiveShadow=true;root.add(rib);
  }

  const balconyMat=new THREE.MeshStandardMaterial({color:0x494946,roughness:.85,metalness:.10});
  const balcony=new THREE.Mesh(new THREE.TorusGeometry(HALL_R-.62,.19,10,96),balconyMat);
  balcony.rotation.x=Math.PI/2;balcony.position.y=8.75;balcony.receiveShadow=true;root.add(balcony);
}
