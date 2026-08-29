import {scene} from './world.js';

/* shadow discipline (ADR-004): every non-transparent mesh blocks light.
   Transparent materials (glass, water, beam, sheer sail cloth) and
   userData.noCast exemptions do not. Runs after all rooms mount. */
export function applyShadowCasting(){
  scene.traverse(o=>{
    if(o.isMesh&&!o.castShadow&&!o.userData.noCast){
      const m=o.material,tx=Array.isArray(m)?m.some(x=>x.transparent):m.transparent;
      if(!tx)o.castShadow=true;
    }
  });
}
