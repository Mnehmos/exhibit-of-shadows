import * as THREE from 'three';

const ORANGE=new THREE.Color(0xf05a25),WHITE=new THREE.Color(0xfff4dc),BLACK=new THREE.Color(0x17151a),TMP_COLOR=new THREE.Color();
function smoothstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}

function stripeColor(x,y){
  let nearest=99;
  for(const center of [.53,.08,-.43])nearest=Math.min(nearest,Math.abs(x-center));
  if(nearest<.095)TMP_COLOR.copy(WHITE);
  else if(nearest<.145)TMP_COLOR.copy(BLACK);
  else TMP_COLOR.copy(ORANGE);
  const belly=smoothstep(.02,.40,-y)*.16;TMP_COLOR.lerp(WHITE,belly);return TMP_COLOR;
}

function heroBody(){
  const rings=58,sides=28,pos=[],idx=[],colors=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),noseTaper=smoothstep(.72,1,q),x=-1.02+q*2.04+.08*noseTaper;
    const tailRise=smoothstep(.02,.25,q),fullness=.62+.38*smoothstep(.12,.48,q),belly=1+.10*Math.sin(q*Math.PI);
    const roundedCap=.28+.72*Math.sqrt(Math.max(0,1-noseTaper*noseTaper));
    const ry=(.055+.43*tailRise)*fullness*roundedCap*belly;
    const rz=(.035+.245*tailRise)*(.93+.07*smoothstep(.25,.66,q))*roundedCap;
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2,sy=Math.sin(a),sz=Math.cos(a);pos.push(x,sy*ry,sz*rz);
      const c=stripeColor(x,sy*ry);colors.push(c.r,c.g,c.b);
    }
  }
  const tailCenter=pos.length/3;pos.push(-1.02,0,0);colors.push(ORANGE.r,ORANGE.g,ORANGE.b);
  const headCenter=pos.length/3;pos.push(1.10,0,0);const nose=stripeColor(1.10,0);colors.push(nose.r,nose.g,nose.b);
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){
    const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);
  }
  const headRing=(rings-1)*sides;
  for(let j=0;j<sides;j++){const n=(j+1)%sides;idx.push(tailCenter,j,n);idx.push(headCenter,headRing+n,headRing+j);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(idx);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.38,metalness:.02,emissive:0x123d3a,emissiveIntensity:.02});
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return{mesh,geometry,material,base:new Float32Array(pos)};
}

function shape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s,4);}
function finMaterial(color,opacity){return new THREE.MeshStandardMaterial({color,roughness:.48,metalness:0,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});}
function fin(points,position,rotation=new THREE.Euler(),scale=.86){
  const group=new THREE.Group();group.position.copy(position);group.rotation.copy(rotation);
  const edge=new THREE.Mesh(shape(points),finMaterial(BLACK,.94));edge.castShadow=true;group.add(edge);
  const inner=new THREE.Mesh(shape(points),finMaterial(0xf06b34,.96));inner.scale.set(scale,scale*.9,1);inner.position.z=.002;inner.castShadow=true;group.add(inner);return group;
}
function eye(side){
  const root=new THREE.Group();root.position.set(.72,.145,side*.235);
  const iris=new THREE.Mesh(new THREE.SphereGeometry(.073,18,12),new THREE.MeshStandardMaterial({color:0xf6b84b,roughness:.28}));iris.scale.set(.86,1,1);root.add(iris);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.041,16,10),new THREE.MeshStandardMaterial({color:0x090a0b,roughness:.2}));pupil.position.z=side*.058;root.add(pupil);
  const glint=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));glint.position.set(.023,.022,side*.085);root.add(glint);
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});return root;
}
function mouth(side){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(1.075,-.055,side*.084),new THREE.Vector3(1.035,-.080,side*.12),new THREE.Vector3(.98,-.070,side*.16)]);
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,8,.011,6,false),new THREE.MeshStandardMaterial({color:0x1c0f12,roughness:.46}));mesh.castShadow=true;return mesh;
}

export function createHeroFishSpecimen(){
  const visual=new THREE.Group(),body=heroBody();visual.add(body.mesh);
  const tail=fin([[0,-.055],[-.27,-.33],[-.36,-.39],[-.28,0],[-.36,.39],[-.27,.33],[0,.055]],new THREE.Vector3(-1,0,0),new THREE.Euler(),.90);visual.add(tail);
  const dorsal=fin([[-.44,0],[-.30,.26],[-.10,.39],[.18,.20],[.34,.045],[.27,0]],new THREE.Vector3(-.04,.39,0),new THREE.Euler(),.85);visual.add(dorsal);
  const ventral=fin([[-.34,0],[-.15,-.20],[.10,-.24],[.30,-.05],[.23,0]],new THREE.Vector3(-.12,-.39,0),new THREE.Euler(),.83);visual.add(ventral);
  const leftFin=fin([[.10,0],[-.18,-.03],[-.07,.25],[.16,.18],[.26,.05]],new THREE.Vector3(.20,-.02,.205),new THREE.Euler(Math.PI/2,-.10,.14),.78);
  const rightFin=fin([[.10,0],[-.18,-.03],[-.07,.25],[.16,.18],[.26,.05]],new THREE.Vector3(.20,-.02,-.205),new THREE.Euler(-Math.PI/2,.10,.14),.78);
  visual.add(leftFin,rightFin,eye(1),eye(-1),mouth(1),mouth(-1));
  let phase=0,normalTick=0;
  function update(dt){
    phase+=dt*4.7;const p=body.geometry.attributes.position,array=p.array,base=body.base;
    for(let i=0;i<p.count;i++){
      const j=i*3,x=base[j],y=base[j+1],z=base[j+2],tailWeight=smoothstep(-.06,.98,(-x)/1.04),wave=Math.sin(phase-tailWeight*4.25)*(.004+.055*tailWeight*tailWeight);
      array[j]=x-z*Math.cos(phase-tailWeight*4.25)*.035*tailWeight;array[j+1]=y;array[j+2]=z+wave;
    }
    p.needsUpdate=true;if((normalTick++&1)===0)body.geometry.computeVertexNormals();
    tail.rotation.y=Math.sin(phase-4.45)*.24;dorsal.rotation.z=Math.sin(phase*.52)*.055;ventral.rotation.z=-Math.sin(phase*.52)*.045;
    leftFin.rotation.z=.14+Math.sin(phase*.63)*.13;rightFin.rotation.z=.14-Math.sin(phase*.63)*.13;
  }
  return{scene:visual,animations:[],update,material:body.material,label:'Hero clownfish · stylized procedural',kind:'procedural'};
}
