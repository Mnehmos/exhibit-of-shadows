import * as THREE from 'three';

function shape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s,4);}

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

export function createMinnowSpecimen(){
  const m=minnowMesh();let phase=0;
  function update(dt){phase+=dt*3.8;const p=m.geom.attributes.position,base=m.geom.userData.base,us=m.geom.userData.u;for(let i=0;i<p.count;i++){const k=i*3,lat=(.002+.009*us[i]+.068*Math.pow(us[i],2.8))*Math.sin(phase-us[i]*6.45);p.array[k+2]=base[k+2]+lat;}p.needsUpdate=true;m.tailPivot.rotation.y=-Math.sin(phase-6.45)*.40;}
  return{scene:m.group,animations:[],update,label:'Minnow · procedural archive study',kind:'procedural'};
}
