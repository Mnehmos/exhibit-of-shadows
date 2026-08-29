/* scenario registry — capture runner drives these via window.__aquarium */
const handlers=new Map();
export function defineScenario(name,fn){handlers.set(name,fn);}
export function runScenario(name){
  const fn=handlers.get(name);
  if(!fn)return false;
  try{fn();}
  catch(e){e.message=`[scenario ${name}] ${e.message}`;throw e;}
  return true;
}
