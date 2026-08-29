import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {assets,loadFishPack} from '../core/assets.js';
import {createSpecimenStage,displayName} from './stage.js';

const $=s=>document.querySelector(s),mount=$('#mount');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071114);
const camera=new THREE.PerspectiveCamera(31,16/9,.08,40);camera.position.set(0,.18,7.1);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(1280,720,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-label','Isolated animated aquarium specimen');mount.appendChild(renderer.domElement);

const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.05).texture;scene.environmentIntensity=.38;pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xbce5e5,0x101516,1.45));
const key=new THREE.DirectionalLight(0xffead2,4.6);key.position.set(-3.8,4.6,5.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=.1;key.shadow.camera.far=18;key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;scene.add(key);
const rim=new THREE.DirectionalLight(0x73d8e4,3.1);rim.position.set(4.5,1.6,-4);scene.add(rim);
const fill=new THREE.DirectionalLight(0x9ec6ff,1.4);fill.position.set(0,-2.4,4);scene.add(fill);
const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(16,9),new THREE.MeshStandardMaterial({color:0x10272a,roughness:.82,metalness:0}));backdrop.position.z=-2.3;backdrop.receiveShadow=true;scene.add(backdrop);
const halo=new THREE.Mesh(new THREE.CircleGeometry(2.55,96),new THREE.MeshBasicMaterial({color:0x183c3e,transparent:true,opacity:.82,depthWrite:false}));halo.position.z=-2.27;scene.add(halo);
const pedestalShadow=new THREE.Mesh(new THREE.CircleGeometry(2.25,80),new THREE.ShadowMaterial({color:0x000000,opacity:.28}));pedestalShadow.rotation.x=-Math.PI/2;pedestalShadow.position.y=-1.62;pedestalShadow.receiveShadow=true;scene.add(pedestalShadow);

const select=$('#specimenSelect'),nameEl=$('#specimenName'),metaEl=$('#specimenMeta'),counter=$('#counter');
const booth=createSpecimenStage({scene,renderer,onChange:updateUI});
function formatBounds(v){return [v.x,v.y,v.z].map(n=>n.toFixed(2)).join(' × ');}
function updateUI(info){select.value=info.file;nameEl.textContent=info.name;metaEl.textContent='animated archive specimen · normalized studio length';counter.textContent=`${info.index+1} / ${info.count}`;$('#fileFact').textContent=info.file;$('#animationFact').textContent=String(info.animations);$('#meshFact').textContent=String(info.meshes);$('#boundsFact').textContent=formatBounds(info.nativeSize);}
function syncSpinButton(){const b=$('#spinBtn');b.classList.toggle('active',booth.spin);b.textContent=booth.spin?'Turntable':'Spin';}
function choose(value){const result=booth.select(value);syncSpinButton();return result;}

$('#previousBtn').addEventListener('click',()=>{booth.step(-1);syncSpinButton();});$('#nextBtn').addEventListener('click',()=>{booth.step(1);syncSpinButton();});select.addEventListener('change',()=>choose(select.value));
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{booth.setView(b.dataset.view);document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));syncSpinButton();});
$('#spinBtn').addEventListener('click',()=>{booth.setSpin(!booth.spin);syncSpinButton();});
$('#captureBtn').addEventListener('click',()=>renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`specimen-${booth.stats().file.replace(/\.glb$/,'')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},'image/png'));

let dragging=false,lastX=0,lastY=0,pinch=0;
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;booth.rotate((e.clientX-lastX)*.008,(e.clientY-lastY)*.006);lastX=e.clientX;lastY=e.clientY;syncSpinButton();});renderer.domElement.addEventListener('pointerup',()=>{dragging=false;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();booth.setZoom(booth.zoom*Math.exp(-e.deltaY*.001));},{passive:false});
renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length!==2)return;const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)booth.setZoom(booth.zoom*d/pinch);pinch=d;},{passive:true});renderer.domElement.addEventListener('touchend',()=>{pinch=0;});
function resize(){const w=Math.max(320,mount.getBoundingClientRect().width),h=w*9/16;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
const clock=new THREE.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(.05,clock.getDelta());booth.update(dt);halo.rotation.z+=dt*.015;renderer.render(scene,camera);}frame();

document.body.dataset.boothState='loading';
const list=await loadFishPack();
for(const entry of list){const option=document.createElement('option');option.value=entry.file;option.textContent=displayName(entry.file);select.appendChild(option);}select.disabled=!list.length;
if(list.length){booth.setEntries(list);document.body.dataset.boothState='settled';}else{nameEl.textContent='No specimens found';metaEl.textContent=assets.status;document.body.dataset.boothState='error';}
window.__photoBooth={get ready(){return document.body.dataset.boothState==='settled';},files:list.map(x=>x.file),select:file=>choose(file),setView:name=>booth.setView(name),setSpin:on=>{const value=booth.setSpin(on);syncSpinButton();return value;},stats:()=>booth.stats()};
