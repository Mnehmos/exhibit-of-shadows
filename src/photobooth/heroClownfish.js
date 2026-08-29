import * as THREE from 'three';

const ORANGE=new THREE.Color(0xf25a20),WHITE=new THREE.Color(0xfff5d9),BLACK=new THREE.Color(0x171318),TMP_COLOR=new THREE.Color();
const PROFILE=[
  [0,-.98,0,.18,.13],
  [.07,-.86,0,.28,.19],
  [.18,-.66,0,.44,.25],
  [.35,-.37,.005,.57,.30],
  [.54,-.04,.012,.62,.32],
  [.70,.24,.018,.59,.31],
  [.84,.49,0,.49,.27],
  [.94,.68,-.035,.34,.21],
  [1,.79,-.055,.15,.12],
];

function smoothstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function profileAt(q){
  let i=1;while(i<PROFILE.length-1&&q>PROFILE[i][0])i++;
  const a=PROFILE[i-1],b=PROFILE[i],t=(q-a[0])/(b[0]-a[0]);
  return a.slice(1).map((value,j)=>THREE.MathUtils.lerp(value,b[j+1],t));
}

function stripeColor(x,sy){
  const belly=1-smoothstep(-1,-.2,sy),arches=1-sy*sy;
  const bands=[
    {center:-.71+.018*sy,white:.090,edge:.145},
    {center:-.12-.045*arches+.025*sy,white:.125+.025*arches,edge:.180+.025*arches},
    {center:.43+.060*sy,white:.100+.018*arches,edge:.155+.018*arches},
  ];
  let fill=ORANGE;
  for(const band of bands){
    const distance=Math.abs(x-band.center);
    if(distance<band.white){fill=WHITE;break;}
    if(distance<band.edge)fill=BLACK;
  }
  TMP_COLOR.copy(fill);if(fill===ORANGE)TMP_COLOR.lerp(WHITE,.035*belly);return TMP_COLOR;
}

function heroBody(){
  const rings=68,sides=36,pos=[],idx=[],colors=[];
  for(let i=0;i<rings;i++){
    const q=i/(rings-1),[x,cy,ry,rz]=profileAt(q);
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2,sy=Math.sin(a),sz=Math.cos(a);
      pos.push(x,cy+sy*ry,sz*rz);
      const c=stripeColor(x,sy);colors.push(c.r,c.g,c.b);
    }
  }
  const tailCenter=pos.length/3;pos.push(-1,0,0);colors.push(ORANGE.r,ORANGE.g,ORANGE.b);
  const headCenter=pos.length/3;pos.push(.82,-.055,0);colors.push(ORANGE.r,ORANGE.g,ORANGE.b);
  for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){
    const n=(j+1)%sides,a=i*sides+j,b=i*sides+n,c=(i+1)*sides+j,d=(i+1)*sides+n;idx.push(a,c,b,b,c,d);
  }
  const headRing=(rings-1)*sides;
  for(let j=0;j<sides;j++){const n=(j+1)%sides;idx.push(tailCenter,j,n);idx.push(headCenter,headRing+n,headRing+j);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(idx);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.44,metalness:.01,emissive:0x311009,emissiveIntensity:.025});
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return{mesh,geometry,material,base:new Float32Array(pos)};
}

function shape(points){const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return new THREE.ShapeGeometry(s,5);}
function finMaterial(color,opacity=1){return new THREE.MeshStandardMaterial({color,roughness:.50,metalness:0,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:true});}
function fin(points,position,rotation=new THREE.Euler(),scale=.88){
  const group=new THREE.Group();group.position.copy(position);group.rotation.copy(rotation);
  const edge=new THREE.Mesh(shape(points),finMaterial(BLACK));edge.castShadow=true;edge.receiveShadow=true;group.add(edge);
  const inner=new THREE.Mesh(shape(points),finMaterial(0xed6229,.98));inner.scale.set(scale,scale,1);inner.position.z=.004;inner.castShadow=true;group.add(inner);return group;
}

function eye(side){
  const root=new THREE.Group();root.position.set(.60,.105,side*.255);
  const rim=new THREE.Mesh(new THREE.SphereGeometry(.057,20,14),new THREE.MeshStandardMaterial({color:0x7e3b21,roughness:.38}));rim.scale.set(.82,1,1);root.add(rim);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.039,18,12),new THREE.MeshStandardMaterial({color:0x08090a,roughness:.24}));pupil.position.z=side*.044;root.add(pupil);
  const glint=new THREE.Mesh(new THREE.SphereGeometry(.010,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));glint.position.set(.015,.017,side*.069);root.add(glint);
  root.traverse(object=>{if(object.isMesh)object.castShadow=true;});return root;
}
function mouth(side){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.965,-.070,side*.055),new THREE.Vector3(.925,-.092,side*.105),new THREE.Vector3(.865,-.100,side*.145)]);
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,10,.009,6,false),new THREE.MeshStandardMaterial({color:0x230e10,roughness:.52}));mesh.castShadow=true;return mesh;
}
function muzzle(){
  const group=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:ORANGE,roughness:.47,metalness:0});
  const cheek=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),material);cheek.position.set(.78,-.055,0);cheek.scale.set(.145,.165,.205);group.add(cheek);
  const upper=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material.clone());upper.material.color.set(0xf36a27);upper.position.set(.90,-.045,0);upper.scale.set(.095,.060,.135);group.add(upper);
  const lower=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material.clone());lower.material.color.set(0xdc481b);lower.position.set(.91,-.105,0);lower.scale.set(.082,.052,.125);group.add(lower);
  group.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});return group;
}

export function createHeroFishSpecimen(){
  const visual=new THREE.Group(),body=heroBody();visual.add(body.mesh,muzzle());
  const tail=fin([[.03,-.15],[-.09,-.23],[-.28,-.33],[-.46,-.32],[-.55,-.21],[-.58,0],[-.55,.21],[-.46,.32],[-.28,.33],[-.09,.23],[.03,.15]],new THREE.Vector3(-.97,0,0),new THREE.Euler(),.88);visual.add(tail);
  const dorsal=fin([[-.64,0],[-.57,.18],[-.40,.32],[-.16,.39],[.10,.37],[.32,.28],[.50,.15],[.57,.025],[.47,0]],new THREE.Vector3(-.10,.40,0),new THREE.Euler(),.88);visual.add(dorsal);
  const anal=fin([[-.52,0],[-.44,-.15],[-.27,-.29],[-.02,-.34],[.22,-.30],[.42,-.18],[.52,-.035],[.43,0]],new THREE.Vector3(-.17,-.43,0),new THREE.Euler(),.88);visual.add(anal);
  const pectoralPoints=[[.04,.06],[-.05,.04],[-.16,-.03],[-.23,-.14],[-.20,-.27],[-.10,-.33],[.02,-.27],[.10,-.13],[.11,-.02]];
  const leftFin=fin(pectoralPoints,new THREE.Vector3(.28,.08,.285),new THREE.Euler(.28,-.05,.04),.84);
  const rightFin=fin(pectoralPoints,new THREE.Vector3(.28,.08,-.285),new THREE.Euler(-.28,.05,.04),.84);
  const pelvicPoints=[[-.14,0],[-.08,-.16],[.03,-.24],[.17,-.17],[.22,-.03],[.15,0]];
  const leftPelvic=fin(pelvicPoints,new THREE.Vector3(.18,-.44,.11),new THREE.Euler(.18,0,0),.84);
  const rightPelvic=fin(pelvicPoints,new THREE.Vector3(.18,-.44,-.11),new THREE.Euler(-.18,0,0),.84);
  visual.add(leftFin,rightFin,leftPelvic,rightPelvic,eye(1),eye(-1),mouth(1),mouth(-1));
  let phase=0,normalTick=0;
  function update(dt){
    phase+=dt*4.7;const position=body.geometry.attributes.position,array=position.array,base=body.base;
    for(let i=0;i<position.count;i++){
      const j=i*3,x=base[j],y=base[j+1],z=base[j+2],tailWeight=smoothstep(-.08,.98,(-x)/1.03),angle=phase-tailWeight*4.1,wave=Math.sin(angle)*(.003+.050*tailWeight*tailWeight);
      array[j]=x-z*Math.cos(angle)*.030*tailWeight;array[j+1]=y;array[j+2]=z+wave;
    }
    position.needsUpdate=true;if((normalTick++&1)===0)body.geometry.computeVertexNormals();
    tail.rotation.y=Math.sin(phase-4.2)*.23;dorsal.rotation.z=Math.sin(phase*.52)*.025;anal.rotation.z=-Math.sin(phase*.52)*.025;
    leftFin.rotation.z=.04+Math.sin(phase*.63)*.09;rightFin.rotation.z=.04-Math.sin(phase*.63)*.09;
    leftPelvic.rotation.z=Math.sin(phase*.55)*.045;rightPelvic.rotation.z=-Math.sin(phase*.55)*.045;
  }
  return{scene:visual,animations:[],update,material:body.material,label:'Hero clownfish · anatomical procedural',kind:'procedural'};
}
