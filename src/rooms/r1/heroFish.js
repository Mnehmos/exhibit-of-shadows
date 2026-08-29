import * as THREE from 'three';
import {state} from '../../core/state.js';
import {val} from '../../core/controls.js';

/* R1.D06 — hero clownfish quality study.
   This is deliberately repo-native geometry: one high-density deforming body,
   separate wet eyes/corneas, layered fins, physical materials, micro-scale
   bump/roughness, local aquarium lighting, a water surface and moving caustics.
   It proves the rendering pipeline before paid/scanned production assets land. */

const ORANGE=new THREE.Color(0xe84313);
const WHITE=new THREE.Color(0xf0eadb);
const BLACK=new THREE.Color(0x090b0c);
const TMP_COLOR=new THREE.Color();

function smoothstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}

function makeScaleBump(){
  const c=document.createElement('canvas');c.width=512;c.height=256;
  const g=c.getContext('2d');
  g.fillStyle='#777';g.fillRect(0,0,c.width,c.height);
  g.lineWidth=1.2;
  for(let y=-8;y<c.height+12;y+=10){
    const offset=((y/10)&1)*6;
    for(let x=-12;x<c.width+12;x+=12){
      const xx=x+offset;
      const grad=g.createRadialGradient(xx,y,1,xx,y,7);
      grad.addColorStop(0,'#a5a5a5');grad.addColorStop(.55,'#858585');grad.addColorStop(1,'#555');
      g.strokeStyle=grad;g.beginPath();g.arc(xx,y,6.5,.12,Math.PI-.12);g.stroke();
    }
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,4);t.colorSpace=THREE.NoColorSpace;
  return t;
}

function makeRoughness(){
  const c=document.createElement('canvas');c.width=256;c.height=128;
  const g=c.getContext('2d'),im=g.createImageData(c.width,c.height);
  let seed=9137;
  for(let i=0;i<im.data.length;i+=4){
    seed=(seed*1664525+1013904223)>>>0;
    const n=88+((seed>>>24)&63);
    im.data[i]=im.data[i+1]=im.data[i+2]=n;im.data[i+3]=255;
  }
  g.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);t.colorSpace=THREE.NoColorSpace;
  return t;
}

function bandColor(x,y){
  let nearest=99;
  for(const center of [.47,.02,-.50])nearest=Math.min(nearest,Math.abs(x-center));
  if(nearest<.105)TMP_COLOR.copy(WHITE);
  else if(nearest<.155)TMP_COLOR.copy(BLACK);
  else TMP_COLOR.copy(ORANGE);
  const belly=THREE.MathUtils.clamp((-.05-y)*.45,0,.18);
  TMP_COLOR.lerp(WHITE,belly);
  return TMP_COLOR;
}

function makeBody(){
  const geometry=new THREE.SphereGeometry(1,64,40);
  const p=geometry.attributes.position;
  const colors=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    const sx=p.getX(i),sy=p.getY(i),sz=p.getZ(i);
    const head=1+.08*smoothstep(.08,.75,sx);
    p.setXYZ(i,sx*.88,sy*.39*head,sz*.235*head);
    const color=bandColor(sx,sy);
    colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  const base=new Float32Array(p.array);
  const material=new THREE.MeshPhysicalMaterial({
    color:0xffffff,vertexColors:true,roughness:.31,metalness:0,
    bumpMap:makeScaleBump(),bumpScale:.014,roughnessMap:makeRoughness(),
    clearcoat:.58,clearcoatRoughness:.16,iridescence:.075,
    iridescenceIOR:1.32,iridescenceThicknessRange:[90,210],
    specularIntensity:.82,emissive:0x1b7775,emissiveIntensity:0,
  });
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;
  return {mesh,geometry,material,base};
}

function shapeGeometry(points){
  const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);
  s.closePath();return new THREE.ShapeGeometry(s,5);
}

function finMaterial(color,opacity=.9){
  return new THREE.MeshPhysicalMaterial({color,roughness:.27,metalness:0,clearcoat:.45,clearcoatRoughness:.2,
    transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false,alphaTest:.04});
}

function layeredFin(points,position,rotation=new THREE.Euler()){
  const group=new THREE.Group();group.position.copy(position);group.rotation.copy(rotation);
  const edge=new THREE.Mesh(shapeGeometry(points),finMaterial(0x24100d,.84));edge.castShadow=true;group.add(edge);
  const inner=new THREE.Mesh(shapeGeometry(points),finMaterial(0xe45a26,.78));inner.scale.set(.84,.78,1);inner.position.z=.001;inner.castShadow=true;group.add(inner);
  return group;
}

function makeEye(side){
  const root=new THREE.Group();root.position.set(.61,.105,side*.205);
  const sclera=new THREE.Mesh(new THREE.SphereGeometry(.078,24,16),new THREE.MeshPhysicalMaterial({color:0xb78032,roughness:.24,metalness:0,clearcoat:.65}));
  sclera.scale.set(.78,1,1);root.add(sclera);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.047,20,14),new THREE.MeshPhysicalMaterial({color:0x010202,roughness:.12,clearcoat:1,clearcoatRoughness:.05}));
  pupil.position.z=side*.055;root.add(pupil);
  const cornea=new THREE.Mesh(new THREE.SphereGeometry(.086,24,16),new THREE.MeshPhysicalMaterial({color:0xd8ffff,roughness:.04,metalness:0,transmission:.72,thickness:.018,ior:1.38,transparent:true,opacity:.24,clearcoat:1,clearcoatRoughness:.02,depthWrite:false}));
  cornea.scale.set(.78,1,1);cornea.position.z=side*.009;root.add(cornea);
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return root;
}

function makeCausticTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;
  const g=c.getContext('2d');g.clearRect(0,0,512,512);g.globalCompositeOperation='lighter';
  let seed=24891;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<110;i++){
    const x=rand()*512,y=rand()*512,r=12+rand()*58;
    g.strokeStyle=`rgba(185,255,246,${.035+rand()*.08})`;g.lineWidth=1+rand()*3;
    g.beginPath();g.ellipse(x,y,r,r*(.2+rand()*.35),rand()*Math.PI,0,Math.PI*2);g.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.35,1.35);t.colorSpace=THREE.SRGBColorSpace;
  return t;
}

function addWaterStudy(aquarium){
  const surfaceMat=new THREE.MeshPhysicalMaterial({color:0xa7e0dc,roughness:.16,metalness:0,transmission:.64,thickness:.05,ior:1.333,
    transparent:true,opacity:.42,clearcoat:.75,clearcoatRoughness:.12,side:THREE.DoubleSide,depthWrite:false});
  const surface=new THREE.Mesh(new THREE.CircleGeometry(3.0,72),surfaceMat);surface.rotation.x=-Math.PI/2;surface.position.y=4.03;surface.userData.noCast=true;aquarium.add(surface);

  const causticMap=makeCausticTexture();
  const caustics=new THREE.Mesh(new THREE.CircleGeometry(2.93,64),new THREE.MeshBasicMaterial({map:causticMap,color:0xa9fff0,transparent:true,opacity:.23,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  caustics.rotation.x=-Math.PI/2;caustics.position.y=-4.125;caustics.userData.noCast=true;aquarium.add(caustics);

  const targetA=new THREE.Object3D(),targetB=new THREE.Object3D();
  targetA.position.set(.3,.25,0);targetB.position.set(-.4,.1,.2);aquarium.add(targetA,targetB);
  const keyA=new THREE.SpotLight(0xc9f4ff,42,12,.68,.92,2);keyA.position.set(-2.5,4.15,1.7);keyA.target=targetA;
  const keyB=new THREE.SpotLight(0x98d9d5,26,11,.72,.95,2);keyB.position.set(2.35,3.7,-1.5);keyB.target=targetB;
  aquarium.add(keyA,keyB);
  return {surface,caustics,causticMap,keyA,keyB};
}

/* Standalone archive specimen for the photo booth. It deliberately reuses the
   same hero geometry/material construction as the live tank, but omits the
   aquarium-only water, caustic and light objects. */
export function createHeroFishSpecimen(){
  const visual=new THREE.Group();
  const body=makeBody();visual.add(body.mesh);
  const tail=layeredFin([[0,-.07],[-.34,-.36],[-.29,0],[-.34,.36],[0,.07]],new THREE.Vector3(-.86,0,0));visual.add(tail);
  const dorsal=layeredFin([[-.38,0],[-.22,.28],[.12,.42],[.39,.08],[.36,0]],new THREE.Vector3(0,.31,0));visual.add(dorsal);
  const ventral=layeredFin([[-.24,0],[-.05,-.20],[.24,-.14],[.34,0]],new THREE.Vector3(-.05,-.30,0));visual.add(ventral);
  const leftFin=layeredFin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,.19),new THREE.Euler(Math.PI/2,-.12,.18));
  const rightFin=layeredFin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,-.19),new THREE.Euler(-Math.PI/2,.12,.18));visual.add(leftFin,rightFin);
  visual.add(makeEye(1),makeEye(-1));
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,8,24),new THREE.MeshPhysicalMaterial({color:0x170604,roughness:.3,clearcoat:.4}));
  mouth.rotation.y=Math.PI/2;mouth.position.set(.872,-.04,0);visual.add(mouth);
  let phase=0,normalTick=0;
  function update(dt){
    phase+=dt*5.1;
    const pos=body.geometry.attributes.position,array=pos.array,base=body.base;
    for(let i=0;i<pos.count;i++){
      const j=i*3,x=base[j],y=base[j+1],z=base[j+2],tailWeight=smoothstep(.05,.98,(.72-x)/1.58);
      const wave=Math.sin(phase-tailWeight*4.5)*(.006+.078*tailWeight*tailWeight);
      array[j]=x-z*Math.cos(phase-tailWeight*4.5)*.04*tailWeight;array[j+1]=y;array[j+2]=z+wave;
    }
    pos.needsUpdate=true;if((normalTick++&1)===0)body.geometry.computeVertexNormals();
    tail.rotation.y=Math.sin(phase-4.55)*.30;leftFin.rotation.z=.18+Math.sin(phase*.53)*.20;rightFin.rotation.z=.18-Math.sin(phase*.53)*.20;
  }
  return {scene:visual,animations:[],update,label:'Hero clownfish · procedural quality study',kind:'procedural'};
}

export function createHeroFish(aquarium){
  const swimmer=new THREE.Group(),visual=new THREE.Group();swimmer.add(visual);aquarium.add(swimmer);

  const body=makeBody();visual.add(body.mesh);
  const tail=layeredFin([[0,-.07],[-.34,-.36],[-.29,0],[-.34,.36],[0,.07]],new THREE.Vector3(-.86,0,0));visual.add(tail);
  const dorsal=layeredFin([[-.38,0],[-.22,.28],[.12,.42],[.39,.08],[.36,0]],new THREE.Vector3(0,.31,0));visual.add(dorsal);
  const ventral=layeredFin([[-.24,0],[-.05,-.20],[.24,-.14],[.34,0]],new THREE.Vector3(-.05,-.30,0));visual.add(ventral);
  const leftFin=layeredFin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,.19),new THREE.Euler(Math.PI/2,-.12,.18));
  const rightFin=layeredFin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,-.19),new THREE.Euler(-Math.PI/2,.12,.18));visual.add(leftFin,rightFin);
  visual.add(makeEye(1),makeEye(-1));

  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,8,24),new THREE.MeshPhysicalMaterial({color:0x170604,roughness:.3,clearcoat:.4}));
  mouth.rotation.y=Math.PI/2;mouth.position.set(.872,-.04,0);mouth.castShadow=true;visual.add(mouth);

  const water=addWaterStudy(aquarium);
  let phase=0,normalTick=0;

  function deformBody(dt,speed){
    phase+=dt*(4.4+speed*1.2);
    const pos=body.geometry.attributes.position,array=pos.array,base=body.base;
    for(let i=0;i<pos.count;i++){
      const j=i*3,x=base[j],y=base[j+1],z=base[j+2];
      const tailWeight=smoothstep(.05,.98,(.72-x)/1.58);
      const wave=Math.sin(phase-tailWeight*4.5)*(.006+.078*tailWeight*tailWeight);
      array[j]=x-z*Math.cos(phase-tailWeight*4.5)*.04*tailWeight;
      array[j+1]=y;
      array[j+2]=z+wave;
    }
    pos.needsUpdate=true;
    if((normalTick++&1)===0)body.geometry.computeVertexNormals();
    tail.rotation.y=Math.sin(phase-4.55)*.30;
    leftFin.rotation.z=.18+Math.sin(phase*.53)*.20;
    rightFin.rotation.z=.18-Math.sin(phase*.53)*.20;
  }

  function update(dt,t){
    /* Keep the study in the visitor-facing half of the big tank. A shallow
       lateral patrol preserves a readable side silhouette from the gallery;
       the turn happens naturally at zero speed at each end of the run. */
    const pace=state.shadowPlay?.46:.34,a=t*pace;
    swimmer.position.set(Math.sin(a)*1.18,.34+Math.sin(a*1.7)*.18,1.56+Math.cos(a*2)*.10);
    const facing=Math.cos(a)>=0?0:Math.PI;
    visual.rotation.set(0,facing,-Math.cos(a*1.7)*.055);
    deformBody(dt,state.shadowPlay?1.3:1);
    const glow=val('glow')/100;
    body.material.emissiveIntensity=glow*.42;
    water.causticMap.offset.x=(t*.018)%1;water.causticMap.offset.y=(t*.012)%1;
    water.caustics.rotation.z=t*.018;
    water.surface.rotation.z=Math.sin(t*.11)*.04;
  }

  return {group:swimmer,update,material:body.material,label:'hero clownfish · physical study'};
}
