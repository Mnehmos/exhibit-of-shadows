import * as THREE from 'three';

export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const rnd=(a,b)=>a+Math.random()*(b-a);
export const pick=a=>a[Math.floor(Math.random()*a.length)];

export function holdButton(el,onStart,onEnd){let p=null;el.addEventListener('pointerdown',e=>{p=e.pointerId;onStart();el.setPointerCapture?.(e.pointerId);});el.addEventListener('pointerup',e=>{if(e.pointerId===p){p=null;onEnd();}});el.addEventListener('pointercancel',()=>{p=null;onEnd();});}

export function disposeTree(rootObj){rootObj.traverse(n=>{n.geometry?.dispose();if(Array.isArray(n.material))n.material.forEach(m=>m.dispose());else n.material?.dispose();});}

export function gradientTexture(stops){const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);for(const[o,col] of stops)gr.addColorStop(o,col);g.fillStyle=gr;g.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;return t;}
