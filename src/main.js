/* main.js — composition root of the Silo layer.
   Import order initializes: world (DOM+scene) → state → systems → rooms.
   The importmap in index.html is the single three.js version pin (ADR-001).
   Rooms mount through roomManifest (ADR-003): adding a room = one line. */
import {state,frameHooks,statusHooks} from './core/state.js';
import {$,hud,scene,camera,renderer,resize,lookEl,desktopPointer} from './core/world.js';
import {defineControl,val,setControlValue,buildConsole,refreshOutputs} from './core/controls.js';
import {applyShadowCasting} from './core/shadows.js';
import {player,resetPlayer,updatePlayer,updateCamera,setCaptureView} from './core/player.js';
import {keys} from './core/input.js';
import {updatePrompt} from './core/console.js';
import {runScenario} from './core/scenarios.js';
import {assets} from './core/assets.js';
import * as r1 from './rooms/r1/index.js';

/* core-owned control: the visitor's own walk speed (rooms declare theirs) */
defineControl({id:'walkSpeed',label:'Walk speed',group:'Visitor',min:40,max:180,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×'});

/* mode / reset / pause */
function setMode(mode){player.viewMode=mode;$('#firstBtn').classList.toggle('active',mode==='first');$('#thirdBtn').classList.toggle('active',mode==='third');}
$('#firstBtn').addEventListener('click',()=>setMode('first'));$('#thirdBtn').addEventListener('click',()=>setMode('third'));
$('#resetPlayerBtn').addEventListener('click',resetPlayer);
$('#pauseBtn').addEventListener('click',e=>{state.running=!state.running;e.currentTarget.textContent=state.running?'Pause':'Play';});

/* room manifest — plugins.txt (ADR-003). One line per room. */
const roomManifest=[
  {id:'r1-gallery-one',mount:r1.mount},
  {id:'demo-room',mount:()=>{}},
];
for(const room of roomManifest)room.mount();

buildConsole();refreshOutputs();applyShadowCasting();
resize();resetPlayer();setMode('first');
if(!state.running)$('#pauseBtn').textContent='Play';

function updateHud(){
  const r=Math.hypot(player.pos.x,player.pos.z);
  updatePrompt();
  const lookHint=desktopPointer?(document.pointerLockElement===lookEl?' · ESC frees the mouse':' · click scene for mouse-look'):'';
  let text=(state.shadowPlay?'SHADOW PLAY · ':'')+'Exhibit of Shadows · '+(player.viewMode==='first'?'first-person':'third-person');
  for(const f of statusHooks)text+=' · '+f();
  hud.textContent=text+' · radial '+r.toFixed(1)+' m'+lookHint;
}

let last=performance.now(),metricClock=0,frames=0;
function frame(now){
  frames++;
  if(frames===3)window.__aquarium.ready=true;
  if(frames>5&&document.body.dataset.labState!=='ready'){
    const a=assets.status;
    if(a.startsWith('ready')||a.startsWith('none'))document.body.dataset.labState='ready';
  }
  const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;
  if(!state.consoleOpen){if(keys.turnL)player.yaw-=dt*1.4;if(keys.turnR)player.yaw+=dt*1.4;}
  if(state.running){
    const wdt=dt*val('timeScale')/100;      /* hall time (E13): world scales, visitor does not (ADR-009) */
    state.simTime+=wdt;updatePlayer(dt);
    for(const f of frameHooks)f(wdt,state.simTime);
  }
  updateCamera();metricClock+=dt;
  if(metricClock>.25){metricClock=0;updateHud();}
  renderer.render(scene,camera);requestAnimationFrame(frame);
}
updateHud();requestAnimationFrame(frame);

/* evidence/capture API (Plant Forge pattern) — tools/capture-exhibit.mjs drives this */
window.__aquarium={
  ready:false,
  stats:()=>({
    running:state.running,
    simTime:Number(state.simTime.toFixed(1)),
    shadowPlay:state.shadowPlay,
    captureView:state.captureView,
    assets:assets.status,
    status:statusHooks.map(f=>f()),
  }),
  setScenario:name=>runScenario(name),
  capturePreset:name=>setCaptureView(name),
  setControlValue:(id,v)=>setControlValue(id,v),
};
