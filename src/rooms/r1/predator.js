import * as THREE from 'three';
import {clamp} from '../../core/utils.js';

/* ═══ THE DUSK LANCER — our own predator, built with love and granularity ═══
   A long blade of the deep: countershaded slate-over-silver, tall translucent
   dorsal sail, forked scythe tail, articulated jaw, gill razors, flanking
   pectorals. CPU undulation beat-linked to speed; jaw opens on the hunt. */

const SLATE=0x4e5d6b, SILVER=0xc7d3dc, FIN=0x33414f, FIN_SOFT=0x2c3947, TOOTH=0xe8eef2, BROW=0x232c34;
const cSlate=new THREE.Color(SLATE), cSilver=new THREE.Color(SILVER);

function bodyGeometry(){
  const rings=34,sides=14,pos=[],idx=[],col=[],u=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),x=1.15-2.3*q;
    let r;
    if(q<.08) r=.05+.11*Math.sin(q/.08*Math.PI*.5);
    else if(q<.42) r=.16+.10*Math.sin((q-.08)/.34*Math.PI*.62);
    else r=.20-.145*((q-.42)/.58);
    r=Math.max(r,.018);
    const rz=r*.52;
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2,s=Math.sin(a);
      pos.push(x,Math.sin(a)*r,Math.cos(a)*rz);
      const t=clamp((s+.35)/1.1,0,1);
      const c=cSilver.clone().lerp(cSlate,t*t);
      col.push(c.r,c.g,c.b);
      u.push(q);
    }
  }
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){
    const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c2=(i+1)*sides+j,d=(i+1)*sides+n;
    idx.push(a,c2,b,b,c2,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();
  g.userData={base:new Float32Array(pos),u:new Float32Array(u),rings,sides};
  return g;
}

function finShape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s);}

export function createDuskLancer(){
  const group=new THREE.Group();
  const bodyMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.22});
  const finMat=new THREE.MeshStandardMaterial({color:FIN,roughness:.6,transparent:true,opacity:.78,side:THREE.DoubleSide});
  const softFinMat=new THREE.MeshStandardMaterial({color:FIN_SOFT,roughness:.65,transparent:true,opacity:.62,side:THREE.DoubleSide});
  const darkMat=new THREE.MeshStandardMaterial({color:BROW,roughness:.55});
  const toothMat=new THREE.MeshStandardMaterial({color:TOOTH,roughness:.3});

  const geom=bodyGeometry();
  const body=new THREE.Mesh(geom,bodyMat);body.castShadow=true;group.add(body);

  /* dorsal sail */
  const dorsal=new THREE.Mesh(finShape([[.55,.13],[.2,.30],[-.1,.34],[-.35,.24],[-.5,.10],[-.5,.06],[.5,.07]]),finMat);
  dorsal.position.y=.045;dorsal.castShadow=true;group.add(dorsal);
  /* anal fin */
  const anal=new THREE.Mesh(finShape([[.15,-.12],[-.05,-.22],[-.3,-.19],[-.42,-.09],[-.42,-.05],[.1,-.06]]),softFinMat);
  anal.position.y=-.015;group.add(anal);

  /* forked scythe tail */
  const tailPivot=new THREE.Group();tailPivot.position.x=-1.12;group.add(tailPivot);
  const tailMat=new THREE.MeshStandardMaterial({color:FIN,roughness:.55,transparent:true,opacity:.85,side:THREE.DoubleSide});
  const bladeU=new THREE.Mesh(finShape([[0,.02],[-.14,.26],[-.34,.34],[-.28,.14],[-.2,.03]]),tailMat);bladeU.castShadow=true;tailPivot.add(bladeU);
  const bladeL=new THREE.Mesh(finShape([[0,-.02],[-.13,-.22],[-.3,-.3],[-.24,-.12],[-.18,-.02]]),tailMat);bladeL.castShadow=true;tailPivot.add(bladeL);

  /* pectorals */
  const pects=[];
  for(const z of [-.13,.13]){
    const pect=new THREE.Mesh(finShape([[0,0],[-.1,-.12],[-.2,-.1],[-.16,.02]]),softFinMat);
    pect.position.set(.45,-.05,z);pect.rotation.y=z>0?-.5:.5;pect.castShadow=true;group.add(pect);pects.push(pect);
  }

  /* head: brow, eyes, gill razors, jaw, teeth */
  for(const z of [-.085,.085]){
    const brow=new THREE.Mesh(new THREE.BoxGeometry(.09,.02,.03),darkMat);
    brow.position.set(.86,.095,z);group.add(brow);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.032,10,8),new THREE.MeshStandardMaterial({color:0xdfe9ee,roughness:.15}));
    eye.position.set(.83,.062,z);group.add(eye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.015,8,6),new THREE.MeshBasicMaterial({color:0x05080b}));
    pupil.position.set(.852,.062,z*1.18);group.add(pupil);
  }
  for(let i=0;i<3;i++){
    const gill=new THREE.Mesh(new THREE.TorusGeometry(.115-i*.012,.008,6,14,Math.PI*.9),darkMat);
    gill.rotation.y=Math.PI/2;gill.position.set(.6-i*.09,.01,0);group.add(gill);
  }
  const jawPivot=new THREE.Group();jawPivot.position.set(.94,-.02,0);group.add(jawPivot);
  const jaw=new THREE.Mesh(new THREE.BoxGeometry(.3,.045,.09),new THREE.MeshStandardMaterial({color:SILVER,roughness:.4}));
  jaw.position.x=.13;jawPivot.add(jaw);
  for(let i=0;i<5;i++){
    const tooth=new THREE.Mesh(new THREE.ConeGeometry(.008,.035,5),toothMat);
    tooth.position.set(.02+i*.055,.032,0);tooth.rotation.x=Math.PI;jawPivot.add(tooth);
  }
  const jawStripe=new THREE.Mesh(new THREE.BoxGeometry(.02,.02,.1),darkMat);jawStripe.position.set(-.02,.045,0);jawPivot.add(jawStripe);

  /* swim: undulation + jaw + pects — called by troupe each frame */
  let phase=rnd(0,6.28);
  function update(dt,speed,hunt){
    phase+=dt*(2.2+speed*3.2);
    const p=geom.attributes.position,base=geom.userData.base,us=geom.userData.u;
    for(let i=0;i<p.count;i++){
      const k=i*3,u=us[i],lat=(.004+.014*u+.075*Math.pow(u,2.7))*Math.sin(phase-u*5.1);
      p.array[k+2]=base[k+2]+lat;
    }
    p.needsUpdate=true;
    tailPivot.rotation.y=-Math.sin(phase-5.05)*.55;
    pects[0].rotation.x=.35+Math.sin(phase*.72)*.28;
    pects[1].rotation.x=.35-Math.sin(phase*.72+1.1)*.28;
    jawPivot.rotation.x=hunt?.24+.09*Math.sin(phase*1.15):.05+.03*Math.sin(phase*.8);
  }

  return {scene:group,animations:[],update,materials:[],label:'Dusk Lancer · authored predator',kind:'procedural'};
}
