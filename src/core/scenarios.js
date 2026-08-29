/* scenario registry — capture runner drives these via window.__aquarium */
const handlers=new Map();
export function defineScenario(name,fn){handlers.set(name,fn);}
export function runScenario(name){
  const fn=handlers.get(name);
  if(!fn)return false;
  document.body.dataset.labState='transitioning';
  try{fn();}
  catch(e){e.message=`[scenario ${name}] ${e.message}`;throw e;}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{document.body.dataset.labState='settled';}));
  return true;
}
