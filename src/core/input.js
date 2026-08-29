import {state} from './state.js';
import {$,lookEl} from './world.js';
import {player} from './player.js';
import {clamp,holdButton} from './utils.js';
import {nearConsole,openConsole} from './console.js';

export const keys={};export const joy={x:0,y:0};
window.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code)){keys[e.code]=true;e.preventDefault();}});
window.addEventListener('keyup',e=>{if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code))keys[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});

let lookPointer=null,lastX=0,lastY=0;
export function lockLook(){
  if(state.consoleOpen)return;
  if(!lookEl.requestPointerLock||document.pointerLockElement===lookEl)return;
  try{const p=lookEl.requestPointerLock({unadjustedMovement:true});if(p&&p.catch)p.catch(()=>{try{lookEl.requestPointerLock()}catch(e){}});}
  catch(e){try{lookEl.requestPointerLock()}catch(e2){}}
}
lookEl.addEventListener('pointerdown',e=>{
  if(state.consoleOpen)return;
  if(e.pointerType==='mouse'){lockLook();return;}
  if(nearConsole()){openConsole();return;}
  lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;lookEl.setPointerCapture?.(e.pointerId);
});
lookEl.addEventListener('pointermove',e=>{
  if(document.pointerLockElement===lookEl){player.yaw+=e.movementX*.0026;player.pitch=clamp(player.pitch-e.movementY*.0021,-.95,.95);return;}
  if(e.pointerId!==lookPointer)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;player.yaw+=dx*.006;player.pitch=clamp(player.pitch-dy*.0048,-.95,.95);
});
lookEl.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer)lookPointer=null;});
lookEl.addEventListener('pointercancel',()=>{lookPointer=null;});

const joystick=$('#joystick'),stick=$('#stick');let joyPointer=null;
function updateJoy(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,m=Math.hypot(dx,dy)||1,k=Math.min(1,max/m),x=dx*k,y=dy*k;joy.x=x/max;joy.y=y/max;stick.style.transform='translate('+x+'px,'+y+'px)';}
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);updateJoy(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updateJoy(e);});
function releaseJoy(e){if(joyPointer===null||!e||e.pointerId===joyPointer){joyPointer=null;joy.x=0;joy.y=0;stick.style.transform='translate(0px,0px)';}}
joystick.addEventListener('pointerup',releaseJoy);joystick.addEventListener('pointercancel',releaseJoy);

holdButton($('#forwardBtn'),()=>keys.KeyW=true,()=>keys.KeyW=false);holdButton($('#backBtn'),()=>keys.KeyS=true,()=>keys.KeyS=false);
holdButton($('#turnLeftBtn'),()=>keys.turnL=true,()=>keys.turnL=false);holdButton($('#turnRightBtn'),()=>keys.turnR=true,()=>keys.turnR=false);
