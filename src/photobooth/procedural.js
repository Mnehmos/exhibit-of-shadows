import * as THREE from 'three';

const ORANGE=new THREE.Color(0xe84313),WHITE=new THREE.Color(0xf0eadb),BLACK=new THREE.Color(0x090b0c),TMP_COLOR=new THREE.Color();
function smoothstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function scaleBump(){
  const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle='#777';g.fillRect(0,0,c.width,c.height);g.lineWidth=1.2;
  for(let y=-8;y<c.height+12;y+=10){const offset=((y/10)&1)*6;for(let x=-12;x<c.width+12;x+=12){const xx=x+offset,grad=g.createRadialGradient(xx,y,1,xx,y,7);grad.addColorStop(0,'#a5a5a5');grad.addColorStop(.55,'#858585');grad.addColorStop(1,'#555');g.strokeStyle=grad;g.beginPath();g.arc(xx,y,6.5,.12,Math.PI-.12);g.stroke();}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,4);t.colorSpace=THREE.NoColorSpace;return t;
}
function roughness(){
  const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d'),im=g.createImageData(c.width,c.height);let seed=9137;
  for(let i=0;i<im.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=88+((seed>>>24)&63);im.data[i]=im.data[i+1]=im.data[i+2]=n;im.data[i+3]=255;}
  g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);t.colorSpace=THREE.NoColorSpace;return t;
}
function bandColor(x,y){let nearest=99;for(const center of [.47,.02,-.50])nearest=Math.min(nearest,Math.abs(x-center));if(nearest<.105)TMP_COLOR.copy(WHITE);else if(nearest<.155)TMP_COLOR.copy(BLACK);else TMP_COLOR.copy(ORANGE);TMP_COLOR.lerp(WHITE,THREE.MathUtils.clamp((-.05-y)*.45,0,.18));return TMP_COLOR;}
function heroBody(){
  const geometry=new THREE.SphereGeometry(1,64,40),p=geometry.attributes.position,colors=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const sx=p.getX(i),sy=p.getY(i),sz=p.getZ(i),head=1+.08*smoothstep(.08,.75,sx);p.setXYZ(i,sx*.88,sy*.39*head,sz*.235*head);const c=bandColor(sx,sy);colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeVertexNormals();
  const material=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.31,metalness:0,bumpMap:scaleBump(),bumpScale:.014,roughnessMap:roughness(),clearcoat:.58,clearcoatRoughness:.16,iridescence:.075,iridescenceIOR:1.32,iridescenceThicknessRange:[90,210],specularIntensity:.82,emissive:0x1b7775,emissiveIntensity:0});
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return{mesh,geometry,material,base:new Float32Array(p.array)};
}
function shape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s,5);}
function finMaterial(color,opacity){return new THREE.MeshPhysicalMaterial({color,roughness:.27,metalness:0,clearcoat:.45,clearcoatRoughness:.2,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false,alphaTest:.04});}
function fin(points,position,rotation=new THREE.Euler()){const group=new THREE.Group();group.position.copy(position);group.rotation.copy(rotation);const edge=new THREE.Mesh(shape(points),finMaterial(0x24100d,.84));edge.castShadow=true;group.add(edge);const inner=new THREE.Mesh(shape(points),finMaterial(0xe45a26,.78));inner.scale.set(.84,.78,1);inner.position.z=.001;inner.castShadow=true;group.add(inner);return group;}
function eye(side){const root=new THREE.Group();root.position.set(.61,.105,side*.205);const sclera=new THREE.Mesh(new THREE.SphereGeometry(.078,24,16),new THREE.MeshPhysicalMaterial({color:0xb78032,roughness:.24,clearcoat:.65}));sclera.scale.set(.78,1,1);root.add(sclera);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.047,20,14),new THREE.MeshPhysicalMaterial({color:0x010202,roughness:.12,clearcoat:1,clearcoatRoughness:.05}));pupil.position.z=side*.055;root.add(pupil);const cornea=new THREE.Mesh(new THREE.SphereGeometry(.086,24,16),new THREE.MeshPhysicalMaterial({color:0xd8ffff,roughness:.04,transmission:.72,thickness:.018,ior:1.38,transparent:true,opacity:.24,clearcoat:1,clearcoatRoughness:.02,depthWrite:false}));cornea.scale.set(.78,1,1);cornea.position.z=side*.009;root.add(cornea);root.traverse(o=>{if(o.isMesh)o.castShadow=true;});return root;}

export function createHeroFishSpecimen(){
  const visual=new THREE.Group(),body=heroBody();visual.add(body.mesh);
  const tail=fin([[0,-.07],[-.34,-.36],[-.29,0],[-.34,.36],[0,.07]],new THREE.Vector3(-.86,0,0));visual.add(tail);
  visual.add(fin([[-.38,0],[-.22,.28],[.12,.42],[.39,.08],[.36,0]],new THREE.Vector3(0,.31,0)));
  visual.add(fin([[-.24,0],[-.05,-.20],[.24,-.14],[.34,0]],new THREE.Vector3(-.05,-.30,0)));
  const left=fin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,.19),new THREE.Euler(Math.PI/2,-.12,.18));
  const right=fin([[0,0],[-.25,-.04],[-.05,.24],[.18,.08]],new THREE.Vector3(.18,-.02,-.19),new THREE.Euler(-Math.PI/2,.12,.18));visual.add(left,right,eye(1),eye(-1));
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,8,24),new THREE.MeshPhysicalMaterial({color:0x170604,roughness:.3,clearcoat:.4}));mouth.rotation.y=Math.PI/2;mouth.position.set(.872,-.04,0);visual.add(mouth);
  let phase=0,normalTick=0;
  function update(dt){phase+=dt*5.1;const pos=body.geometry.attributes.position,array=pos.array,base=body.base;for(let i=0;i<pos.count;i++){const j=i*3,x=base[j],y=base[j+1],z=base[j+2],w=smoothstep(.05,.98,(.72-x)/1.58),wave=Math.sin(phase-w*4.5)*(.006+.078*w*w);array[j]=x-z*Math.cos(phase-w*4.5)*.04*w;array[j+1]=y;array[j+2]=z+wave;}pos.needsUpdate=true;if((normalTick++&1)===0)body.geometry.computeVertexNormals();tail.rotation.y=Math.sin(phase-4.55)*.30;left.rotation.z=.18+Math.sin(phase*.53)*.20;right.rotation.z=.18-Math.sin(phase*.53)*.20;}
  return{scene:visual,animations:[],update,label:'Hero clownfish · procedural quality study',kind:'procedural'};
}

function minnowMesh(){
  const group=new THREE.Group(),rings=28,sides=14,pos=[],idx=[],u=[];
  for(let i=0;i<rings;i++){const q=i/(rings-1),x=.46-.92*q;let r=q<.15?.045+.06*Math.sin(q/.15*Math.PI*.5):q<.34?.105+.014*Math.sin((q-.15)/.19*Math.PI):.11*(1-(q-.34)/.66*.76);if(q>.80)r*=THREE.MathUtils.lerp(1,.58,(q-.80)/.20);const rz=r*(.48-.055*q);for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;pos.push(x,Math.sin(a)*r,Math.cos(a)*rz);u.push(q);}}
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();geom.userData.base=new Float32Array(pos);geom.userData.u=new Float32Array(u);
  const body=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:0x9aa69d,roughness:.38,metalness:.10,emissive:0x7fd4c1,emissiveIntensity:0}));body.castShadow=true;group.add(body);
  const finMat=new THREE.MeshStandardMaterial({color:0x686f68,roughness:.64,transparent:true,opacity:.92,side:THREE.DoubleSide}),tailPivot=new THREE.Group();tailPivot.position.x=-.455;
  const tail=new THREE.Mesh(shape([[0,.022],[-.11,.11],[-.29,.16],[-.23,.038],[-.16,0],[-.23,-.038],[-.29,-.16],[-.11,-.11],[0,-.022]]),finMat);tail.castShadow=true;tailPivot.add(tail);group.add(tailPivot);
  const dorsal=new THREE.Mesh(shape([[.10,0],[0,.13],[-.15,.10],[-.23,.02],[-.24,0]]),finMat);dorsal.position.y=.095;dorsal.castShadow=true;group.add(dorsal);
  const eyeGeo=new THREE.SphereGeometry(.021,7,5),eyeMat=new THREE.MeshStandardMaterial({color:0x050606});for(const z of [-.052,.052]){const e=new THREE.Mesh(eyeGeo,eyeMat);e.position.set(.34,.032,z);group.add(e);}return{group,geom,tailPivot};
}
export function createMinnowSpecimen(){const m=minnowMesh();let phase=0;function update(dt){phase+=dt*3.8;const p=m.geom.attributes.position,base=m.geom.userData.base,us=m.geom.userData.u;for(let i=0;i<p.count;i++){const k=i*3,lat=(.002+.009*us[i]+.068*Math.pow(us[i],2.8))*Math.sin(phase-us[i]*6.45);p.array[k+2]=base[k+2]+lat;}p.needsUpdate=true;m.tailPivot.rotation.y=-Math.sin(phase-6.45)*.40;}return{scene:m.group,animations:[],update,label:'Minnow · procedural archive study',kind:'procedural'};}
