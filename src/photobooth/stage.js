import * as THREE from 'three';
import {clone as skClone} from 'three/addons/utils/SkeletonUtils.js';

const VIEWS={side:0,quarter:Math.PI/5,front:Math.PI/2};

function displayName(file){return file.replace(/\.glb$/i,'').split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');}
function alignLongestAxis(group,size){if(size.y>=size.x&&size.y>=size.z)group.rotation.z=-Math.PI/2;else if(size.z>=size.x&&size.z>=size.y)group.rotation.y=Math.PI/2;}
function cloneMaterials(root,renderer){
  let meshes=0;
  root.traverse(o=>{
    if(!o.isMesh)return;meshes++;o.castShadow=true;o.receiveShadow=true;
    const src=Array.isArray(o.material)?o.material:[o.material];
    const next=src.filter(Boolean).map(m=>{const c=m.clone();if(c.map)c.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if('envMapIntensity' in c)c.envMapIntensity=.72;if('roughness' in c)c.roughness=Math.max(.24,c.roughness??.6);c.needsUpdate=true;return c;});
    o.material=Array.isArray(o.material)?next:next[0];
  });
  return meshes;
}

export function createSpecimenStage({scene,renderer,onChange=()=>{}}){
  const specimenRoot=new THREE.Group();scene.add(specimenRoot);
  let entries=[],index=0,current=null,mixer=null,view='side',spin=true,userYaw=0,userPitch=0,zoom=1;
  function clear(){if(mixer){mixer.stopAllAction();mixer=null;}specimenRoot.clear();current=null;}
  function mount(entry,nextIndex){
    clear();index=nextIndex;
    const source=entry.create?entry.create():entry;
    const model=entry.create?source.scene:skClone(source.scene),centerer=new THREE.Group(),alignment=new THREE.Group();centerer.add(model);alignment.add(centerer);specimenRoot.add(alignment);
    model.updateMatrixWorld(true);
    const nativeBox=new THREE.Box3().setFromObject(model),nativeSize=nativeBox.getSize(new THREE.Vector3()),nativeCenter=nativeBox.getCenter(new THREE.Vector3());
    centerer.position.sub(nativeCenter);alignLongestAxis(alignment,nativeSize);alignment.updateMatrixWorld(true);
    const alignedBox=new THREE.Box3().setFromObject(alignment),alignedSize=alignedBox.getSize(new THREE.Vector3()),fit=3.35/Math.max(alignedSize.x,alignedSize.y,alignedSize.z,1e-6);alignment.scale.setScalar(fit);
    const meshes=cloneMaterials(model,renderer),clips=source.animations||entry.animations||[],clip=clips.find(a=>/swim/i.test(a.name))||clips[0]||null;
    if(clip){mixer=new THREE.AnimationMixer(model);mixer.clipAction(clip).play();}
    current={entry,source,alignment,model,nativeSize,meshes,fit,update:source.update};userYaw=0;userPitch=0;zoom=1;applyPose();
    onChange({index,count:entries.length,name:entry.label||source.label||displayName(entry.file),file:entry.file,kind:entry.kind||source.kind||'glb',animations:clips.length,meshes,nativeSize});document.body.dataset.boothState='settled';return true;
  }
  function applyPose(){if(!current)return;specimenRoot.rotation.set(userPitch,VIEWS[view]+userYaw,0);specimenRoot.scale.setScalar(zoom);}
  function setEntries(next){entries=next;return entries.length?mount(entries[0],0):false;}
  function select(value){const i=typeof value==='number'?value:entries.findIndex(e=>e.file===value);if(i<0||i>=entries.length)return false;document.body.dataset.boothState='transitioning';return mount(entries[i],i);}
  function step(delta){return select((index+delta+entries.length)%entries.length);}
  function setView(name){if(!(name in VIEWS))return false;view=name;spin=false;applyPose();return true;}
  function setSpin(next){spin=Boolean(next);return spin;}
  function rotate(dx,dy){spin=false;userYaw+=dx;userPitch=THREE.MathUtils.clamp(userPitch+dy,-.55,.55);applyPose();}
  function setZoom(next){zoom=THREE.MathUtils.clamp(next,.66,1.45);applyPose();return zoom;}
  function update(dt){if(mixer)mixer.update(dt);if(current?.update)current.update(dt);if(spin&&current){userYaw=(userYaw+dt*.22)%(Math.PI*2);applyPose();}}
  function stats(){return current?{file:current.entry.file,index,count:entries.length,kind:current.entry.kind||current.source.kind||'glb',animations:(current.source.animations||[]).length,meshes:current.meshes,view,spin}:null;}
  return {setEntries,select,step,setView,setSpin,rotate,setZoom,update,stats,get index(){return index;},get entries(){return entries;},get spin(){return spin;},get zoom(){return zoom;}};
}
export {displayName};
