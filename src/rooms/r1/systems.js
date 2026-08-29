import {state,onFrame,onResize,registerStatus} from '../../core/state.js';
import {val,defineControl} from '../../core/controls.js';
import {$} from '../../core/world.js';
import {assets,loadFishPack} from '../../core/assets.js';
import {fish,syncFish} from './minnow.js';
import {buildHabitat} from './habitat.js';
import {feedExhibit} from './food.js';

/* R1.E systems: shadow play (E05), feeding buttons (E06), control declarations
   (E07/E11), magic systems (E12–E15), breathing + resize + status hooks */
export function initSystems(parts){
  const {galleryAmbient,lamps,centralLight,orbMat}=parts;
  let centralBase=680;

  function applyGallery(){
    const g=val('galleryLight');
    galleryAmbient.intensity=(.03+g/100*.70)*(state.shadowPlay?.18:1);
    for(const l of lamps)l.intensity=state.shadowPlay?.07:.55;
  }
  function setShadowPlay(on){
    state.shadowPlay=on;state.playT=0;
    $('#playBtn').textContent=on?'Stop the play':'Shadow play';
    $('#playBtn').style.borderColor=on?'#d8c89d':'';
    if(!on){centralLight.intensity=centralBase;orbMat.emissiveIntensity=4;}
    applyGallery();
  }
  function setGlow(v){const k=v/100*2.2;for(const f of fish)f.bodyMat.emissiveIntensity=k;}
  function setScale(v){for(const f of fish)f.group.scale.setScalar(f.size*v/100);}

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
  registerStatus(()=>'assets: '+assets.status);

  centralBase=val('lightPower');centralLight.intensity=centralBase;centralLight.shadow.radius=1+val('shadowSoft')/12;applyGallery();
  setGlow(val('glow'));setScale(val('fishScale'));
  loadFishPack().then(()=>{/* Phase 2: swap GLB models in when a pack lands in assets/fish */});
}
