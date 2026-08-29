import * as THREE from 'three';
import {R1} from './constants.js';
import {ribMat} from './architecture.js';

/* R1.B furnishings: benches (B01), gallery lamps (B02), ambient (B03), shadow sails (B04) */
export function buildFixtures(root){
  const {HALL_R}=R1;
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2+.12;
    const bench=new THREE.Group();
    const seat=new THREE.Mesh(new THREE.BoxGeometry(1.65,.16,.50),new THREE.MeshStandardMaterial({color:0x5b4633,roughness:.9}));
    seat.position.y=.50;seat.castShadow=true;bench.add(seat);
    for(const x of [-.62,.62]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.10,.48,.10),ribMat);leg.position.set(x,.24,0);leg.castShadow=true;bench.add(leg);}
    bench.position.set(Math.sin(a)*(HALL_R-1.18),0,Math.cos(a)*(HALL_R-1.18));bench.rotation.y=a;root.add(bench);
  }

  const galleryAmbient=new THREE.HemisphereLight(0xdbe3df,0x252727,.20);root.add(galleryAmbient);
  const lamps=[];
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const lamp=new THREE.PointLight(0xffd9aa,.55,4.5,2);
    lamp.position.set(Math.sin(a)*(HALL_R-.8),7.5,Math.cos(a)*(HALL_R-.8));root.add(lamp);lamps.push(lamp);
  }

  /* sheer cloth receives silhouettes, lets the central light pass (ADR-004) */
  const sails=new THREE.Group();root.add(sails);
  const sailMat=new THREE.MeshStandardMaterial({color:0xe9e2d0,roughness:.96,side:THREE.DoubleSide,transparent:true,opacity:.94});
  const rodMat=new THREE.MeshStandardMaterial({color:0x2a2c2e,roughness:.5,metalness:.5});
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2+Math.PI/8;
    const sail=new THREE.Group();
    const cloth=new THREE.Mesh(new THREE.PlaneGeometry(2.55,5.5,1,1),sailMat);
    cloth.position.y=4.55;cloth.receiveShadow=true;sail.add(cloth);
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,2.75,8),rodMat);
    rod.rotation.z=Math.PI/2;rod.position.y=7.38;sail.add(rod);
    const wire=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.5,6),rodMat);
    wire.position.y=8.1;sail.add(wire);
    sail.position.set(Math.sin(a)*8.55,0,Math.cos(a)*8.55);
    sail.rotation.y=a+Math.PI;sail.rotation.x=-.10;
    sails.add(sail);
  }

  return {galleryAmbient,lamps};
}
