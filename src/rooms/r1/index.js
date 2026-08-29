import * as THREE from 'three';
import {scene,readout} from '../../core/world.js';
import {onFrame,onResize,registerStatus} from '../../core/state.js';
import {player} from '../../core/player.js';
import {assets} from '../../core/assets.js';
import {R1} from './constants.js';
import {buildArchitecture} from './architecture.js';
import {buildFixtures} from './fixtures.js';
import {buildTank} from './tank.js';
import {buildBooth} from './booth.js';
import {initHabitat} from './habitat.js';
import {initTroupe,fish,updateAll} from './troupe.js';
import {initMoonMinnows,updateMoonMinnows} from './moonMinnows.js';
import {initFood} from './food.js';
import {initEcosystem} from './ecosystem.js';
import {initSystems} from './systems.js';

/* ROOM r1-gallery-one · "The Exhibit of Shadows" — master exhibit hall.
   Assembly only: parts build, this file collects and wires. */
export function mount(){
  const root=new THREE.Group();scene.add(root);
  const {HALL_R,TANK_R}=R1;
  player.setBounds(TANK_R+.82,HALL_R-.68);player.setSpawn(0,HALL_R-2.0);

  buildArchitecture(root);
  const {galleryAmbient,lamps}=buildFixtures(root);
  const tank=buildTank(root);
  buildBooth(root);

  const habitat=new THREE.Group(),fishGroup=new THREE.Group(),foodGroup=new THREE.Group();
  tank.aquarium.add(habitat,fishGroup,foodGroup);
  const {buildHabitat}=initHabitat(habitat);
  initTroupe(fishGroup);
  initMoonMinnows(fishGroup);
  initFood(foodGroup);
  initEcosystem();
  initSystems({galleryAmbient,lamps,centralLight:tank.centralLight,orbMat:tank.orbMat,aquarium:tank.aquarium,fish,buildHabitat});

  onFrame((dt,t)=>{
    tank.updateTank(dt,t);
    updateAll(dt,t);
    updateMoonMinnows(dt,t);
  });
  registerStatus(()=>fish.length+' fish · '+fish.filter(f=>f.state==='feed').length+' feeding');
  registerStatus(()=>'assets: '+assets.status);

  readout.innerHTML='<strong>The Exhibit of Shadows.</strong> A single shadow-casting PointLight burns at the heart of the tank — the only instrument in the hall. Its six-direction shadow map throws every minnow, plant, and visitor onto eight hanging sails, the gallery wall, floor, and ceiling. Physics bends around the core: the <em>Light pull</em> slider tugs the school into orbit like moths, and <em>Shadow play</em> dims the gallery, sets the core breathing, and winds the fish into a slow vortex of silhouettes. The stagehand console bends physics itself — gravity, hall time, bioluminescence, minnow scale.';
}
