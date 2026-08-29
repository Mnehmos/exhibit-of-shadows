import {state,consolePoints} from './state.js';
import {$,lookEl} from './world.js';
import {player} from './player.js';
import {keys,joy} from './input.js';

/* stagehand console system: proximity, E/ESC, open/close, prompt state */
export const consolePanel=$('#consolePanel'),promptEl=$('#prompt');
export function nearConsole(){return consolePoints.length>0&&player.pos.distanceTo(consolePoints[0])<2.6;}
export function openConsole(){
  state.consoleOpen=true;consolePanel.hidden=false;
  if(document.pointerLockElement)document.exitPointerLock();
  for(const k in keys)keys[k]=false;joy.x=0;joy.y=0;
}
export function closeConsole(){state.consoleOpen=false;consolePanel.hidden=true;}
export function updatePrompt(){
  if(state.consoleOpen){promptEl.hidden=false;promptEl.innerHTML='<kbd>E</kbd> / <kbd>ESC</kbd> — step away';}
  else if(nearConsole()){promptEl.hidden=false;promptEl.innerHTML=window.matchMedia('(hover:hover) and (pointer:fine)').matches?'<kbd>E</kbd> — Stagehand console':'You approach the stagehand console';}
  else promptEl.hidden=true;
}

$('#consoleClose').addEventListener('click',closeConsole);
consolePanel.addEventListener('click',e=>{if(e.target===consolePanel)closeConsole();});
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&state.consoleOpen)closeConsole();
  else if(e.code==='KeyE'&&!e.repeat){if(state.consoleOpen)closeConsole();else if(nearConsole())openConsole();}
});
