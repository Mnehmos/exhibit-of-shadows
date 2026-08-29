import * as THREE from 'three';
import {R1} from './constants.js';
import {val} from '../../core/controls.js';
import {rnd,pick,disposeTree} from '../../core/utils.js';

/* R1.D01 plants + R1.D02 rocks — rebuilt from the Plant density slider */
export function initHabitat(habitat){
  function buildHabitat(){
    for(const c of [...habitat.children]){habitat.remove(c);disposeTree(c);}
    const {TANK_R,TANK_H}=R1;
    const count=Math.round(6+val('plants')/5.5);
    const plantMat=[0x396f49,0x438354,0x4d9360,0x306643];
    for(let i=0;i<count;i++){
      const a=rnd(0,Math.PI*2),r=rnd(1.05,TANK_R*.78),h=rnd(.8,2.5);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.055,h,7),new THREE.MeshStandardMaterial({color:pick(plantMat),roughness:.9}));
      stem.position.set(Math.sin(a)*r,-TANK_H/2+h/2+.22,Math.cos(a)*r);stem.castShadow=true;habitat.add(stem);
      for(let j=0;j<5;j++){
        const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.16,.36),new THREE.MeshStandardMaterial({color:pick(plantMat),side:THREE.DoubleSide,roughness:.88}));
        leaf.position.set(stem.position.x+rnd(-.12,.12),-TANK_H/2+.35+h*(j+1)/6,stem.position.z+rnd(-.12,.12));
        leaf.rotation.set(rnd(-.5,.5),rnd(0,6.28),rnd(-.7,.7));leaf.castShadow=true;habitat.add(leaf);
      }
    }
    for(let i=0;i<7;i++){
      const a=rnd(0,6.28),r=rnd(1.0,TANK_R*.78),size=rnd(.14,.32);
      const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(size,1),new THREE.MeshStandardMaterial({color:pick([0x686a64,0x777166,0x596463]),roughness:1}));
      rock.position.set(Math.sin(a)*r,-TANK_H/2+.25,Math.cos(a)*r);rock.castShadow=true;habitat.add(rock);
    }
  }
  buildHabitat();
  return {buildHabitat};
}
