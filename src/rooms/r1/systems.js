import {state,onFrame,onResize,registerStatus} from '../../core/state.js';
import {val,defineControl,setControlValue} from '../../core/controls.js';
import {$,scene} from '../../core/world.js';
import {fish,syncFish,setGlow,setScale} from './troupe.js';
import {feedExhibit} from './food.js';
import {defineScenario} from '../../core/scenarios.js';

/* R1.E systems: shadow play (E05), feeding buttons (E06), control declarations
   (E07/E11), magic systems (E12–E15), breathing + resize + status hooks */
export function initSystems(parts){
  const {galleryAmbient,lamps,centralLight,orbMat,buildHabitat}=parts;
  let centralBase=680;

  function applyGallery(){
    const g=val('galleryLight');
    galleryAmbient.intensity=(.03+g/100*.70)*(state.shadowPlay?.18:1);
    for(const l of lamps)l.intensity=state.shadowPlay?.07:.45;
    scene.environmentIntensity=state.shadowPlay?.05:.25;
  }
  function setShadowPlay(on){
    state.shadowPlay=on;state.playT=0;
    $('#playBtn').textContent=on?'Stop the play':'Shadow play';
    $('#playBtn').style.borderColor=on?'#d8c89d':'';
    if(!on){centralLight.intensity=centralBase;orbMat.emissiveIntensity=4;}
    applyGallery();
  }
  /* setGlow / setScale come from troupe.js (GLB species materials/scales) */

  $('#feedAction').addEventListener('click',feedExhibit);$('#feedBtn').addEventListener('click',feedExhibit);
  $('#playBtn').addEventListener('click',()=>setShadowPlay(!state.shadowPlay));

  defineControl({id:'fishCount',label:'Minnows',group:'Exhibit',min:6,max:28,step:1,value:16,onChange:syncFish});
  defineControl({id:'activity',label:'Fish activity',group:'Exhibit',min:35,max:180,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×'});
  defineControl({id:'schooling',label:'Schooling',group:'Exhibit',min:0,max:100,step:1,value:64,fmt:v=>(v/100).toFixed(2)});
  defineControl({id:'lightPull',label:'Light pull',group:'Exhibit',min:0,max:200,step:1,value:45,fmt:v=>(v/100).toFixed(2)+'×'});
  defineControl({id:'plants',label:'Plant density',group:'Exhibit',min:0,max:100,step:1,value:58,fmt:v=>(v/100).toFixed(2),onChange:buildHabitat});
  defineControl({id:'gravity',label:'Gravity',group:'Impossible things',min:-100,max:200,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×'});
  defineControl({id:'timeScale',label:'Hall time',group:'Impossible things',min:10,max:300,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×'});
  defineControl({id:'glow',label:'Bioluminescence',group:'Impossible things',min:0,max:100,step:1,value:0,fmt:v=>Math.round(v)+'%',onChange:setGlow});
  defineControl({id:'fishScale',label:'Minnow scale',group:'Impossible things',min:30,max:250,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×',onChange:setScale});
  defineControl({id:'lightPower',label:'Central light',group:'Shadow hall',min:180,max:1200,step:10,value:680,onChange:v=>{centralBase=v;if(!state.shadowPlay)centralLight.intensity=centralBase;}});
  defineControl({id:'shadowSoft',label:'Shadow softness',group:'Shadow hall',min:0,max:100,step:1,value:36,fmt:v=>(v/100).toFixed(2),onChange:v=>{centralLight.shadow.radius=1+v/12;}});
  defineControl({id:'galleryLight',label:'Gallery light',group:'Shadow hall',min:0,max:100,step:1,value:16,fmt:v=>(v/100).toFixed(2),onChange:applyGallery});

  onFrame(dt=>{
    if(state.shadowPlay){
      state.playT+=dt;
      const breath=.78+.20*Math.sin(state.playT*1.25)+.06*Math.sin(state.playT*4.3);
      centralLight.intensity=centralBase*breath;orbMat.emissiveIntensity=2.2+2.6*breath;
    }
  });
  onResize(w=>{const s=w<620?512:1024;if(centralLight.shadow.mapSize.x!==s){centralLight.shadow.mapSize.set(s,s);if(centralLight.shadow.map){centralLight.shadow.map.dispose();centralLight.shadow.map=null;}}});

  centralBase=val('lightPower');centralLight.intensity=centralBase;centralLight.shadow.radius=1+val('shadowSoft')/12;applyGallery();
  syncFish();setGlow(val('glow'));setScale(val('fishScale'));

  /* capture scenarios (Plant Forge pattern) */
  defineScenario('default',()=>{setShadowPlay(false);setControlValue('glow',0);setControlValue('gravity',100);setControlValue('timeScale',100);});
  defineScenario('shadowplay',()=>{setControlValue('glow',35);setShadowPlay(true);});
  defineScenario('calm',()=>{setShadowPlay(false);setControlValue('timeScale',25);});
  defineScenario('feeding',()=>{setShadowPlay(false);feedExhibit();feedExhibit();});
  defineScenario('hunt',()=>{setShadowPlay(false);setControlValue('hungerRate',300);setControlValue('sharks',2);setControlValue('restock',8);setControlValue('timeScale',300);});
  defineScenario('magic',()=>{setShadowPlay(false);setControlValue('gravity',-60);setControlValue('glow',100);setControlValue('fishScale',180);});
}
