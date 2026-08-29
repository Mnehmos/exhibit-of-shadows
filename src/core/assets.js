/* asset pipeline (Phase 1): inert until assets/fish/manifest.json exists.
   Drop Quaternius (or any) GLB fish + a JSON array of filenames there and
   the pack loads automatically — Phase 2 swaps the procedural troupe. */
export const assets={status:'unchecked',fish:[]};

export async function loadFishPack(dir='assets/fish'){
  assets.status='loading';
  try{
    const res=await fetch(dir+'/manifest.json');
    if(!res.ok)throw new Error('manifest '+res.status);
    const list=await res.json();
    if(!Array.isArray(list)||!list.length)throw new Error('manifest empty');
    const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
    const loader=new GLTFLoader();
    assets.fish=await Promise.all(list.map(name=>new Promise((resolve,reject)=>loader.load(dir+'/'+name,g=>resolve({scene:g.scene,animations:g.animations||[]}),undefined,reject))));
    assets.status='ready · '+assets.fish.length+' models';
  }catch(e){assets.fish=[];assets.status='none — procedural troupe';}
  return assets.fish;
}
